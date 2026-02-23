namespace Herald.Automator;

public sealed class BlogSettings
{
    public string RepoPath { get; init; } = "";
    public bool RunOnceOnStartup { get; init; }
    public string ScheduleMode { get; init; } = "Daily";
    public int DailyRunHour { get; init; } = 9;
    public int IntervalSeconds { get; init; } = 60;
    public bool DryRun { get; init; }
    public bool SkipPush { get; init; }
}

public sealed record RuntimeFlags(bool RunNow);
