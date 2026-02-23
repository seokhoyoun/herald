# TODO (2026-02-19)

## Immediate
- [x] Resolve `useVisibleTask$` lint warnings in `src/routes/layout.tsx:59`, `src/routes/layout.tsx:67`, `src/routes/workouts/index.tsx:84`
- [x] Add test setup and `test` script in `package.json` (Node `node:test` + `tests/smoke.test.js`)

## Content & Navigation
- [x] Add search and tag/category filtering for posts
- [x] Add stable pagination with page URLs
- [ ] Ensure post listing stays consistent with MDX frontmatter ordering/fallback rules

## SEO
- [x] Add `sitemap.xml` generation
- [x] Confirm `robots.txt` policy is production-ready
- [x] Add/verify custom 404 route in QwikCity

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
