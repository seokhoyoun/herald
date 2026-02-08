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