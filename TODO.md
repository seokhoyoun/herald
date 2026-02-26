# TODO (2026-02-27)

## Top Priority
- [x] `P0` Fix auth/sign-in redirect flow issues (`src/routes/layout.tsx`, hosted Supabase redirect settings)
- [x] Prevent page reload on comment submit (`src/routes/posts/layout.tsx`)
- [x] Remove comment approval gating and align DB policies/migrations (`supabase/migrations/*post_comments*.sql`)
- [x] Change daily visitor rollover to KST midnight (`supabase/schema.sql`, `supabase/migrations/20260226000500_set_daily_view_rollover_kst.sql`)

## Content & Navigation
- [ ] Ensure post listing stays consistent with MDX frontmatter ordering/fallback rules
- [x] Add tmux intro post (`src/routes/posts/tmux-intro/index.mdx`)

## SEO
## Supabase
- [x] Finalize schema for post views and comments
- [x] Decide auth strategy (anonymous vs login) and moderation rules
- [ ] Implement comment anti-spam rate limiting without approval workflow

## Automator
- [ ] Harden git automation error handling: capture exit codes/stdout/stderr and stop on failed command (`automator/Herald.Automator/Herald.Automator/GitAutomationService.cs`)
- [ ] Replace broad `git add .` with path-scoped staging for generated post files only (`automator/Herald.Automator/Herald.Automator/GitAutomationService.cs`)
- [ ] Make push target configurable (remote/branch) instead of hard-coded `origin main` (`automator/Herald.Automator/Herald.Automator/GitAutomationService.cs`)
- [ ] Prevent slug/file overwrite when the job runs multiple times in one day (`automator/Herald.Automator/Herald.Automator/BlogGenerator.cs`, `automator/Herald.Automator/Herald.Automator/Worker.cs`)
- [ ] Move schedule/model settings to configuration (`run time`, `time zone`, `model id`) instead of hard-coded values (`automator/Herald.Automator/Herald.Automator/Worker.cs`, `automator/Herald.Automator/Herald.Automator/BlogGenerator.cs`)
