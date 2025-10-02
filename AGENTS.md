# Repository Guidelines

## Project Structure & Module Organization
- `src/Herald.sln` — primary solution.
- `src/Herald/` — Worker service (`Program.cs`, `Worker.cs`, `appsettings*.json`, `Dockerfile`).
- `tests/` — add test projects here (e.g., `tests/Herald.Tests/`).
- Ignore IDE artifacts (`.vs/`, `*.user`) and do not commit secrets.

## Build, Test, and Development Commands
- Restore and build: `dotnet restore`, `dotnet build src/Herald.sln`.
- Run locally: `DOTNET_ENVIRONMENT=Development dotnet run --project src/Herald/Herald.csproj`.
- Tests (once added): `dotnet test`.
- Format code: `dotnet format`.
- Docker build/run: `docker build -f src/Herald/Dockerfile -t herald:dev src/Herald` then `docker run --rm -e DOTNET_ENVIRONMENT=Production herald:dev`.

## Coding Style & Naming Conventions
- Language: C# with 4‑space indentation.
- Naming: PascalCase for public types/members, camelCase for locals/params, `_camelCase` for private fields, and suffix `Async` for async methods.
- File per public type; filename matches type name.
- Prefer explicit access modifiers; avoid `var` for unclear types.
- Keep namespaces aligned to folder structure under `src/Herald`.

## Testing Guidelines
- Framework: xUnit (recommended). Create with `dotnet new xunit -o tests/Herald.Tests` and add to solution: `dotnet sln src/Herald.sln add tests/Herald.Tests/Herald.Tests.csproj`.
- Naming: `ClassName_MethodName_ShouldExpectedBehavior`.
- Run: `dotnet test`. Optional coverage via coverlet if configured.

## Commit & Pull Request Guidelines
- Commits: short, imperative subject (≤72 chars). Example: `feat(worker): add graceful shutdown hooks`.
- Prefer Conventional Commits (`feat|fix|chore|docs|refactor|test`), include scope when useful.
- PRs: clear description, motivation, testing steps, and linked issues. Include logs or screenshots when behavior changes.
- Ensure builds pass and code is formatted before requesting review.

## Language
- Korean is welcome for docs, PRs, and commit messages. Keep code identifiers, namespaces, and public API in English.

## Security & Configuration Tips
- Do not commit secrets; use env vars or `dotnet user-secrets` for local dev.
- Use `appsettings.Development.json` for local overrides; production via environment variables or mounted config.
- Set environment with `DOTNET_ENVIRONMENT` (`Development`, `Staging`, `Production`).
