# github-metrics-lab

Health check: the service is healthy when the home page loads.

## Realtime metrics + deployment

`src/realtime-deploy.ts` computes the full M01-M15 snapshot and creates a
GitHub deployment for the same commit in one run. The deployment fires the
`deployment` / `deployment_status` webhooks that the telemetry collector uses
for M11 (lead time) and M12 (deploy frequency).

```powershell
npm test               # 27 node:test cases
npm run demo:live      # print all 15 metrics, no network
npm run demo:realtime  # print all 15 metrics + trigger the deploy
```

Local `demo:realtime` runs skip the deployment unless `GITHUB_TOKEN` and
`GITHUB_REPOSITORY` are set:

```powershell
$env:GITHUB_TOKEN = "..."
$env:GITHUB_REPOSITORY = "rameshqualizeal/github-metrics-lab"
$env:GITHUB_SHA = (git rev-parse HEAD)
$env:DEPLOY_ENVIRONMENT = "production"
npm run demo:realtime
```

The `realtime-metrics-deploy` workflow runs `npm test`, prints all fifteen
metrics, and creates one deployment per run:

| Trigger | Environment |
| --- | --- |
| Pull request | `preview` |
| Push to `main` | `production` |
| Manual dispatch | selected (`production` by default) |

Fork pull requests keep the deployment disabled because their token is
read-only. To hand the event to AWS, point an EventBridge rule or a CodeDeploy
deployment group at this repository's deployment events; the workflow itself
does not need AWS credentials.

## The fifteen metrics

| Code | Metric |
| --- | --- |
| M01 | AI adoption rate |
| M02 | Suggestion acceptance |
| M03 | AI sessions per engineer |
| M04 | Token efficiency |
| M05 | Ingest lag p95 |
| M06 | PII scrub violations |
| M07 | AI-authored code |
| M08 | PR throughput |
| M09 | Review wait |
| M10 | Rework rate |
| M11 | Lead time for changes |
| M12 | Deploy frequency |
| M13 | Attribution mapping |
| M14 | Cycle time |
| M15 | Defect escape rate |
