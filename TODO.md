# TODO (2026-02-19)

## Content & Navigation
- [ ] Ensure post listing stays consistent with MDX frontmatter ordering/fallback rules

## SEO
## Supabase
- [ ] Finalize schema for post views and comments
- [ ] Decide auth strategy (anonymous vs login) and moderation rules
- [ ] Implement read/write API integration with rate limiting

## Automator
- [ ] Harden git automation error handling: capture exit codes/stdout/stderr and stop on failed command (`automator/Herald.Automator/Herald.Automator/GitAutomationService.cs`)
- [ ] Replace broad `git add .` with path-scoped staging for generated post files only (`automator/Herald.Automator/Herald.Automator/GitAutomationService.cs`)
- [ ] Make push target configurable (remote/branch) instead of hard-coded `origin main` (`automator/Herald.Automator/Herald.Automator/GitAutomationService.cs`)
- [ ] Prevent slug/file overwrite when the job runs multiple times in one day (`automator/Herald.Automator/Herald.Automator/BlogGenerator.cs`, `automator/Herald.Automator/Herald.Automator/Worker.cs`)
- [ ] Move schedule/model settings to configuration (`run time`, `time zone`, `model id`) instead of hard-coded values (`automator/Herald.Automator/Herald.Automator/Worker.cs`, `automator/Herald.Automator/Herald.Automator/BlogGenerator.cs`)
