using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Herald;

public interface IMarkdownMonitor
{
    Task ScanAsync(CancellationToken ct);
}

public class MarkdownMonitor : IMarkdownMonitor
{
    private readonly ILogger<MarkdownMonitor> _logger;
    private readonly IConfiguration _config;
    private readonly IMongoClient _mongoClient;
    

    private IMongoDatabase Database => _mongoClient.GetDatabase(_config["MongoDb:Database"] ?? "herald");
    private IMongoCollection<BsonDocument> Files => Database.GetCollection<BsonDocument>(_config["MongoDb:FilesCollection"] ?? "files");
    private IMongoCollection<BsonDocument> Events => Database.GetCollection<BsonDocument>(_config["MongoDb:EventsCollection"] ?? "events");

    public MarkdownMonitor(ILogger<MarkdownMonitor> logger, IConfiguration config, IMongoClient mongoClient)
    {
        _logger = logger;
        _config = config;
        _mongoClient = mongoClient;
    }

    public async Task ScanAsync(CancellationToken ct)
    {
        var root = _config["MarkdownWatch:RootPath"];
        if (string.IsNullOrWhiteSpace(root))
        {
            _logger.LogWarning("MarkdownWatch:RootPath is not configured. Skipping scan.");
            return;
        }

        string rootFullPath;
        try
        {
            rootFullPath = Path.GetFullPath(root);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Invalid RootPath: {root}", root);
            return;
        }

        if (!Directory.Exists(rootFullPath))
        {
            _logger.LogWarning("RootPath does not exist: {root}", rootFullPath);
            return;
        }

        var now = DateTime.UtcNow;
        var storeContent = bool.TryParse(_config["MarkdownWatch:StoreContent"], out var sc) && sc;
        var maxContentBytes = int.TryParse(_config["MarkdownWatch:MaxContentBytes"], out var mcb) && mcb > 0 ? mcb : 262144;
        var current = new Dictionary<string, FileSnapshot>(StringComparer.OrdinalIgnoreCase);

        var patterns = new[] { "*.md" };
        foreach (var pattern in patterns)
        {
            foreach (var file in Directory.EnumerateFiles(rootFullPath, pattern, SearchOption.AllDirectories))
            {
                if (ct.IsCancellationRequested) return;
                try
                {
                    var info = new FileInfo(file);
                    var relPath = Path.GetRelativePath(rootFullPath, file).Replace('\\', '/');
                    var hash = ComputeSha256(file);
                    current[relPath] = new FileSnapshot(relPath, info.Length, info.LastWriteTimeUtc, hash);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to read file: {file}", file);
                }
            }
        }

        List<BsonDocument> known;
        try
        {
            known = await Files.Find(Builders<BsonDocument>.Filter.Empty)
                .Project(Builders<BsonDocument>.Projection.Include("_id").Include("path").Include("hash").Include("deleted").Include("lastWriteUtc").Include("size"))
                .ToListAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to query known files from MongoDB.");
            return;
        }

        var knownMap = new Dictionary<string, BsonDocument>(StringComparer.OrdinalIgnoreCase);
        foreach (var doc in known)
        {
            var p = doc.GetValue("path", defaultValue: BsonNull.Value);
            if (p.IsString) knownMap[p.AsString] = doc;
        }

        foreach (var snap in current.Values)
        {
            if (ct.IsCancellationRequested) return;

            var exists = knownMap.TryGetValue(snap.Path, out var doc);
            var wasDeleted = exists && doc!.GetValue("deleted", false).ToBoolean();
            var changed = !exists || wasDeleted || !string.Equals(doc!.GetValue("hash", "").AsString, snap.Hash, StringComparison.OrdinalIgnoreCase);

            try
            {
                var filter = Builders<BsonDocument>.Filter.Eq("path", snap.Path);
                var updates = new List<UpdateDefinition<BsonDocument>>
                {
                    Builders<BsonDocument>.Update.Set("path", snap.Path),
                    Builders<BsonDocument>.Update.Set("size", snap.Size),
                    Builders<BsonDocument>.Update.Set("hash", snap.Hash),
                    Builders<BsonDocument>.Update.Set("lastWriteUtc", snap.LastWriteUtc),
                    Builders<BsonDocument>.Update.Set("deleted", false),
                    Builders<BsonDocument>.Update.Set("updatedAt", now)
                };

                if (storeContent && changed)
                {
                    var (content, bytesRead, truncated) = ReadContentPreview(Path.Combine(rootFullPath, snap.Path), maxContentBytes);
                    updates.Add(Builders<BsonDocument>.Update.Set("content", content));
                    updates.Add(Builders<BsonDocument>.Update.Set("contentPreviewBytes", bytesRead));
                    updates.Add(Builders<BsonDocument>.Update.Set("contentTruncated", truncated));
                }

                var options = new UpdateOptions { IsUpsert = true };
                await Files.UpdateOneAsync(filter, Builders<BsonDocument>.Update.Combine(updates), options, ct);

                if (changed)
                {
                    var type = !exists || wasDeleted ? "created" : "modified";
                    await EmitEventAsync(type, snap.Path, now, snap.Size, snap.Hash, ct);
                    _logger.LogInformation("File {type}: {path}", type, snap.Path);

                    await GenerateHtmlAsync(rootFullPath, snap.Path, ct);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upsert file or emit event for {path}", snap.Path);
            }
        }

        foreach (var kvp in knownMap)
        {
            if (ct.IsCancellationRequested) return;
            var path = kvp.Key;
            var doc = kvp.Value;
            var deleted = doc.GetValue("deleted", false).ToBoolean();
            if (!current.ContainsKey(path) && !deleted)
            {
                try
                {
                    var filter = Builders<BsonDocument>.Filter.Eq("path", path);
                    var update = Builders<BsonDocument>.Update
                        .Set("deleted", true)
                        .Set("updatedAt", now);
                    await Files.UpdateOneAsync(filter, update, cancellationToken: ct);
                    await EmitEventAsync("deleted", path, now, null, null, ct);
                    _logger.LogInformation("File deleted: {path}", path);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to mark deletion for {path}", path);
                }
            }
        }
    }

    private static string ComputeSha256(string filePath)
    {
        using var stream = File.OpenRead(filePath);
        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(stream);
        return Convert.ToHexString(hash);
    }

    private static (string content, int bytesRead, bool truncated) ReadContentPreview(string filePath, int maxBytes)
    {
        try
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            var buffer = new byte[Math.Min(maxBytes, (int)Math.Max(1, fs.Length))];
            var read = fs.Read(buffer, 0, buffer.Length);
            var truncated = fs.Length > read;
            var content = System.Text.Encoding.UTF8.GetString(buffer, 0, read);
            return (content, read, truncated);
        }
        catch
        {
            return (string.Empty, 0, false);
        }
    }

    private async Task GenerateHtmlAsync(string rootFullPath, string mdRelativePath, CancellationToken ct)
    {
        try
        {
            var mdRelFs = mdRelativePath.Replace('/', Path.DirectorySeparatorChar);
            var mdFullPath = Path.Combine(rootFullPath, mdRelFs);
            if (!File.Exists(mdFullPath)) return;

            // Base data path (for original copy)
            var dataBase = _config["DateFolders:BasePath"] ?? "data";
            var dataBaseFull = Path.IsPathRooted(dataBase) ? dataBase : Path.GetFullPath(Path.Combine(rootFullPath, dataBase));

            // Output base path
            var outputBase = _config["HtmlOutput:BasePath"] ?? Path.Combine(dataBaseFull, "out");
            var outputFullPath = Path.IsPathRooted(outputBase)
                ? outputBase
                : Path.GetFullPath(Path.Combine(rootFullPath, outputBase));

            // Ensure base output directory exists
            Directory.CreateDirectory(outputFullPath);
            Directory.CreateDirectory(dataBaseFull);

            // Decide year/month from file's last write time (local)
            var info = new FileInfo(mdFullPath);
            var year = info.LastWriteTime.ToString("yyyy");
            var month = info.LastWriteTime.ToString("MM");

            // Original copy under data/original/yyyy/MM
            var originalBaseDir = Path.Combine(dataBaseFull, "original");
            var originalMonthDir = Path.Combine(originalBaseDir, year, month);
            Directory.CreateDirectory(originalMonthDir);
            var mdTargetPath = Path.Combine(originalMonthDir, Path.GetFileName(mdFullPath));

            // Avoid copying onto itself or into a locked destination; retry a few times then continue
            var srcFull = Path.GetFullPath(mdFullPath);
            var dstFull = Path.GetFullPath(mdTargetPath);
            var alreadyInOriginal = srcFull.StartsWith(Path.GetFullPath(originalBaseDir) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);
            if (!alreadyInOriginal && !string.Equals(srcFull, dstFull, StringComparison.OrdinalIgnoreCase))
            {
                var copied = await TryCopyWithRetriesAsync(srcFull, dstFull, attempts: 3, delayMs: 200, ct);
                if (!copied)
                {
                    _logger.LogWarning("Could not copy to original folder after retries: {dest}", dstFull);
                }
            }

            // HTML output under out/yyyy/MM/<filename>.html
            var outMonthDir = Path.Combine(outputFullPath, year, month);
            Directory.CreateDirectory(outMonthDir);
            var fileNameNoExt = Path.GetFileNameWithoutExtension(mdFullPath);
            var htmlFullPath = Path.Combine(outMonthDir, fileNameNoExt + ".html");

            var md = await File.ReadAllTextAsync(mdFullPath, ct);
            var body = Markdig.Markdown.ToHtml(md);
            var title = fileNameNoExt;
            var html = "<!doctype html>\n<html lang=\"ko\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>" +
                       title + "</title></head><body>" + body + "</body></html>";

            await File.WriteAllTextAsync(htmlFullPath, html, System.Text.Encoding.UTF8, ct);

            var htmlRelForEvent = Path.Combine(year, month, Path.GetFileName(htmlFullPath)).Replace('\\','/');
            await EmitEventAsync("html_generated", htmlRelForEvent, DateTime.UtcNow, new FileInfo(htmlFullPath).Length, ComputeSha256(htmlFullPath), ct);
            _logger.LogInformation("Generated HTML: {path}", htmlFullPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate HTML for {md}", mdRelativePath);
        }
    }

    private static async Task<bool> TryCopyWithRetriesAsync(string source, string dest, int attempts, int delayMs, CancellationToken ct)
    {
        for (int i = 0; i < attempts; i++)
        {
            try
            {
                File.Copy(source, dest, overwrite: true);
                return true;
            }
            catch (IOException) when (i < attempts - 1)
            {
                try { await Task.Delay(delayMs, ct); } catch { }
            }
            catch (UnauthorizedAccessException) when (i < attempts - 1)
            {
                try { await Task.Delay(delayMs, ct); } catch { }
            }
        }
        return false;
    }

    private Task EmitEventAsync(string type, string path, DateTime atUtc, long? size, string? hash, CancellationToken ct)
    {
        var doc = new BsonDocument
        {
            { "type", type },
            { "path", path },
            { "atUtc", atUtc },
        };
        if (size.HasValue) doc.Add("size", size.Value);
        if (!string.IsNullOrEmpty(hash)) doc.Add("hash", hash);
        return Events.InsertOneAsync(doc, cancellationToken: ct);
    }

    private readonly record struct FileSnapshot(string Path, long Size, DateTime LastWriteUtc, string Hash);
}
