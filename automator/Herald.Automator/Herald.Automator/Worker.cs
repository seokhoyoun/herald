namespace Herald.Automator
{
    public class Worker(
        ILogger<Worker> logger,
        IConfiguration configuration,
        BlogGenerator generator,
        GitAutomationService git) : BackgroundService
    {
        private readonly string _repoPath = configuration.GetValue<string>("BlogSettings:RepoPath") ?? throw new ArgumentNullException("블로그 저장소 경로(RepoPath)가 설정되지 않았습니다.");
        private readonly bool _runOnceOnStartup = configuration.GetValue<bool>("BlogSettings:RunOnceOnStartup");

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_runOnceOnStartup)
            {
                await RunJobAsync(stoppingToken);
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                // 매일 오전 9시에 실행되도록 설정
                var now = DateTime.Now;
                var nextRun = now.Date.AddDays(1).AddHours(9);
                var delay = nextRun - now;

                await Task.Delay(delay, stoppingToken);

                await RunJobAsync(stoppingToken);
            }
        }

        private async Task RunJobAsync(CancellationToken stoppingToken)
        {
            try
            {
                var result = await generator.GeneratePostAsync();

                // 파일 저장 경로 설정 (src/routes/posts/{slug}/index.mdx)
                string directoryPath = Path.Combine(_repoPath, "src", "routes", "posts", result.Slug);
                Directory.CreateDirectory(directoryPath);
                await File.WriteAllTextAsync(Path.Combine(directoryPath, "index.mdx"), result.Content, stoppingToken);

                git.CommitAndPush(result.Slug);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "블로그 게시물 생성 중 오류가 발생했습니다.");
            }
        }
    }
}