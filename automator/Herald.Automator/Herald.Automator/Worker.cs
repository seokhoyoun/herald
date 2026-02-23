using Microsoft.Extensions.Options;

namespace Herald.Automator
{
    public class Worker(
        ILogger<Worker> logger,
        IOptions<BlogSettings> blogSettings,
        RuntimeFlags runtimeFlags,
        BlogGenerator generator,
        GitAutomationService git) : BackgroundService
    {
        private readonly BlogSettings _settings = blogSettings.Value;
        private readonly string _repoPath = string.IsNullOrWhiteSpace(blogSettings.Value.RepoPath)
            ? throw new ArgumentNullException("RepoPath is not configured.")
            : blogSettings.Value.RepoPath;
        private readonly bool _runOnceOnStartup = blogSettings.Value.RunOnceOnStartup;
        private readonly bool _runNow = runtimeFlags.RunNow;
        private readonly string _scheduleMode = blogSettings.Value.ScheduleMode ?? "Daily";
        private readonly int _dailyRunHour = Math.Clamp(blogSettings.Value.DailyRunHour, 0, 23);
        private readonly int _intervalSeconds = Math.Max(1, blogSettings.Value.IntervalSeconds);

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_runNow)
            {
                logger.LogInformation("Run-now mode enabled. Executing one job and exiting.");
                await RunJobAsync(stoppingToken);
                return;
            }

            if (_runOnceOnStartup)
            {
                logger.LogInformation("RunOnceOnStartup enabled. Executing one job and exiting.");
                await RunJobAsync(stoppingToken);
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                var nextRun = ResolveNextRun(now);
                var delay = nextRun - now;
                if (delay < TimeSpan.Zero)
                {
                    delay = TimeSpan.Zero;
                }

                logger.LogInformation(
                    "Next run scheduled at {NextRun} (mode: {ScheduleMode})",
                    nextRun,
                    _scheduleMode);

                await Task.Delay(delay, stoppingToken);
                if (stoppingToken.IsCancellationRequested)
                {
                    break;
                }

                await RunJobAsync(stoppingToken);
            }
        }

        private DateTime ResolveNextRun(DateTime now)
        {
            if (string.Equals(_scheduleMode, "Interval", StringComparison.OrdinalIgnoreCase))
            {
                return now.AddSeconds(_intervalSeconds);
            }

            var todayRun = now.Date.AddHours(_dailyRunHour);
            return now < todayRun ? todayRun : todayRun.AddDays(1);
        }

        private async Task RunJobAsync(CancellationToken stoppingToken)
        {
            try
            {
                var result = await generator.GeneratePostAsync();
                var directoryPath = Path.Combine(_repoPath, "src", "routes", "posts", result.Slug);
                var filePath = Path.Combine(directoryPath, "index.mdx");

                if (_settings.DryRun)
                {
                    logger.LogInformation(
                        "DryRun enabled. Generated slug {Slug}. File write and git push skipped. Target path: {Path}",
                        result.Slug,
                        filePath);
                    return;
                }

                Directory.CreateDirectory(directoryPath);
                await File.WriteAllTextAsync(filePath, result.Content, stoppingToken);

                if (_settings.SkipPush)
                {
                    logger.LogInformation(
                        "SkipPush enabled. File written for slug {Slug}, git push skipped.",
                        result.Slug);
                    return;
                }

                git.CommitAndPush(result.Slug);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while generating or publishing a blog post.");
            }
        }
    }
}
