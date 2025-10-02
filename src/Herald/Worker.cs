namespace Herald
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IConfiguration _config;
        private readonly IMarkdownMonitor _monitor;

        private const string ConfigSection = "DateFolders";

        public Worker(ILogger<Worker> logger, IConfiguration config, IMarkdownMonitor monitor)
        {
            _logger = logger;
            _config = config;
            _monitor = monitor;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var basePath = _config[$"{ConfigSection}:BasePath"]; // e.g., data or C:\data
            if (string.IsNullOrWhiteSpace(basePath))
            {
                _logger.LogWarning("{section}:BasePath is not configured. Skipping folder creation.", ConfigSection);
            }

            // Interval (minutes), default 60
            var minutesStr = _config[$"{ConfigSection}:CheckIntervalMinutes"];
            var mdMinutesStr = _config["MarkdownWatch:IntervalMinutes"]; // optional separate interval
            var effectiveMinutes = int.TryParse(mdMinutesStr, out var mdm) && mdm > 0
                ? mdm
                : (int.TryParse(minutesStr, out var m) && m > 0 ? m : 60);
            var interval = TimeSpan.FromMinutes(effectiveMinutes);

            using var timer = new PeriodicTimer(interval);

            await EnsureTodayFolderAsync(basePath, stoppingToken);
            await _monitor.ScanAsync(stoppingToken);

            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await EnsureTodayFolderAsync(basePath, stoppingToken);
                await _monitor.ScanAsync(stoppingToken);
            }
        }

        private Task EnsureTodayFolderAsync(string? basePath, CancellationToken ct)
        {
            if (ct.IsCancellationRequested)
            {
                return Task.CompletedTask;
            }

            if (string.IsNullOrWhiteSpace(basePath))
            {
                return Task.CompletedTask;
            }

            try
            {
                var now = DateTime.Now; // local date
                var year = now.ToString("yyyy");
                var month = now.ToString("MM");

                var original = Path.Combine(basePath, "original", year, month);
                var output = Path.Combine(basePath, "out", year, month);

                Directory.CreateDirectory(original);
                Directory.CreateDirectory(output);
                _logger.LogInformation("Ensured month folders exist: {orig} , {out}", original, output);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to ensure date folder.");
            }

            return Task.CompletedTask;
        }
    }
}
