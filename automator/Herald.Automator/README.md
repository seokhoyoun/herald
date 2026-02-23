# Herald Automator

`Herald.Automator` is a worker service that generates AI-written MDX posts and publishes them into the `herald` repository.

## Project Purpose

- Generate blog content automatically with Gemini.
- Save generated content into Qwik route structure (`src/routes/posts/...`).
- Commit and push changes so the main site can deploy updated content.

## Runtime Flow

1. `Program.cs` loads `.env` (`Env.Load()`).
2. Host is built with:
   - `Worker`
   - `BlogGenerator`
   - `GitAutomationService`
3. `Worker` decides run mode:
   - `--run-now` argument: run once immediately and exit.
   - `BlogSettings:RunOnceOnStartup = true`: run once immediately and exit.
   - Otherwise: run by schedule (`Daily` or `Interval`).
4. `BlogGenerator` calls Gemini (`gemini-3-flash-preview`) and returns MDX content + slug.
5. `Worker` writes post file to:
   - `<RepoPath>/src/routes/posts/{slug}/index.mdx`
6. `GitAutomationService` runs:
   - `git add .`
   - `git commit -m "feat: add daily post {slug}"`
   - `git push origin main`

## Configuration

`appsettings.json`:

```json
{
  "BlogSettings": {
    "RepoPath": "C:\\git\\herald",
    "RunOnceOnStartup": true,
    "ScheduleMode": "Daily",
    "DailyRunHour": 9,
    "IntervalSeconds": 60,
    "DryRun": false,
    "SkipPush": false
  }
}
```

`BlogSettings` fields:

- `RepoPath`: local path to `herald` repo.
- `RunOnceOnStartup`: one-shot run on process start.
- `ScheduleMode`: `Daily` or `Interval`.
- `DailyRunHour`: hour for daily mode (`0-23`, local server time).
- `IntervalSeconds`: repeat interval for interval mode.
- `DryRun`: generate only; skip file write and git push.
- `SkipPush`: write file, but skip git push.

Environment variable / secret:

- Prefer `GEMINI_API_KEY`.
- Fallback to `BlogSettings:GeminiApiKey`.

## Fast Testing Without Waiting For Daily Schedule

Use one of these:

1. Run once immediately:

```bash
dotnet run --project automator/Herald.Automator/Herald.Automator/Herald.Automator.csproj -- --run-now
```

2. Use interval mode in Development (`appsettings.Development.json`):
   - `ScheduleMode = "Interval"`
   - `IntervalSeconds = 30`

3. Use safe mode while testing:
   - `DryRun = true` to avoid writing files and pushing.
   - `SkipPush = true` to write file but avoid push.

Current `appsettings.Development.json` already sets:

- `RunOnceOnStartup = false`
- `ScheduleMode = "Interval"`
- `IntervalSeconds = 30`
- `DryRun = true`
- `SkipPush = true`

## Commands

Run:

```bash
dotnet run --project automator/Herald.Automator/Herald.Automator/Herald.Automator.csproj
```

Build:

```bash
dotnet build automator/Herald.Automator/Herald.Automator.slnx
```

Windows Service mode:

- If detected as Windows Service, service name is `Herald Automator`.

## Operational Notes

- Slug is currently date-based (`auto-yyyy-MM-dd`), so multiple runs on same day can overwrite the same file.
- Git target is currently fixed to `origin main`.
- Git command failure handling is currently minimal (no stdout/stderr capture).
