# Contributing

Thanks for helping with the GitHub metrics lab. The repository is small on
purpose: most changes add one helper, one demo, or one test at a time.

## Prerequisites

- Node.js 22.18.0 or newer (`nvm use` or `fnm use` reads `.nvmrc`)
- Git
- No runtime dependencies, so `npm install` is only needed for tooling you add

## Workflow

1. Branch from `main` as `AT-<ticket>-<slug>` (for example
   `AT-10-rework-rate`) or `feature/<slug>`.
2. Keep each pull request focused on one metric, helper, or document.
3. Run `npm test` before pushing. New formulas need a `node:test` case.
4. Open the pull request against `main` with a short summary and the test
   result.
5. Pull requests are squash-merged; delete the branch afterwards.

## Commands

| Command | What it does |
| --- | --- |
| `npm test` | Runs every `node:test` suite |
| `npm run demo:live` | Prints all fifteen metrics for the sample window |
| `npm run demo:realtime` | Prints the snapshot and creates a deployment when `GITHUB_TOKEN` and `GITHUB_REPOSITORY` are set |
| `npm run demo:alerts` | Checks the sample window against the threshold defaults |

## Style

- Two-space indentation, single quotes, semicolons.
- Keep metric helpers pure; put GitHub API calls in `realtime-deploy.ts`.
- Never commit `.env` files or tokens. Workflows use the job `GITHUB_TOKEN`.
