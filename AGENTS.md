# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Qwik app source. Key entry points live in `src/entry.dev.tsx`, `src/entry.ssr.tsx`, and `src/entry.preview.tsx`.
- `src/routes/`: QwikCity file-based routing. Pages are `index.tsx` files under each route folder.
- `src/components/`: Reusable UI components (for example `src/components/router-head/`).
- `src/global.css`: Global styles.
- `public/`: Static assets served as-is (for example `public/favicon.svg`).

## Build, Test, and Development Commands
- `npm install`: Install dependencies (Node `^18.17.0 || ^20.3.0 || >=21.0.0`).
- `npm run dev`: Start the Vite SSR dev server.
- `npm start`: Same as dev, opens the browser.
- `npm run build`: Production build (client + SSR) via Qwik.
- `npm run preview`: Build and preview the production output locally.
- `npm run build.types`: Type check with `tsc --noEmit`.
- `npm run lint`: Lint `src/**/*.ts*` with ESLint.
- `npm run fmt` / `npm run fmt.check`: Format or verify formatting with Prettier.

## Coding Style & Naming Conventions
- Language: TypeScript + TSX.
- Formatting: Prettier with `prettier-plugin-tailwindcss` (class sorting). Prefer running `npm run fmt` instead of manual formatting.
- Linting: ESLint with Qwik and TypeScript rules; no explicit custom rules beyond defaults.
- Routes: Use QwikCity conventions (`src/routes/<route>/index.tsx`).

## .NET Guidelines
- Avoid tuple return types in C#; use named records or classes instead.

## Testing Guidelines
- No test runner or scripts are configured yet. If you add tests, also add a `test` script to `package.json` and document the framework here.

## Commit & Pull Request Guidelines
- This checkout does not include Git history, so no local commit conventions are available. Use short, imperative commit subjects and add a scope if helpful (example: `routes: add post list`).
- PRs should include a brief summary, testing notes (commands and results), and screenshots for UI changes.

## Configuration Notes
- Key config files: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `prettier.config.js`.