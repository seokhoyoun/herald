using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MongoDB.Driver;
namespace Herald
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = Host.CreateApplicationBuilder(args);
            // MongoDB client
            builder.Services.AddSingleton<IMongoClient>(sp =>
            {
                var cfg = sp.GetRequiredService<IConfiguration>();
                var conn = cfg.GetConnectionString("MongoDb") ?? cfg["MongoDb:ConnectionString"] ?? "mongodb://localhost:27017";
                return new MongoClient(conn);
            });

            // Markdown monitor
            builder.Services.AddSingleton<IMarkdownMonitor, MarkdownMonitor>();

            // Worker
            builder.Services.AddHostedService<Worker>();

            var host = builder.Build();
            host.Run();
        }
    }
}
