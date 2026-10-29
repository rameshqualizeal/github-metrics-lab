# github-metrics-lab

Health check: the service is healthy when the home page loads.

## Local setup

Requires Node.js 22.18 or newer. The demos run directly from TypeScript with
no build step and no runtime dependencies.

```powershell
git clone https://github.com/rameshqualizeal/github-metrics-lab.git
cd github-metrics-lab
npm test               # run the node:test suite
npm run demo:live      # print all 15 metrics, no network
```

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

## Threshold alerts

`npm run demo:alerts` checks the sample live window against the default limits
in `src/metric-thresholds.js`:

| Metric | Snapshot key | Limit |
| --- | --- | --- |
| Ingest lag p95 | `ingestLagP95Seconds` | 300 s |
| PII scrub violations | `piiViolationPct` | 0.5% |
| Rework rate | `reworkRatePct` | 20% |
| Lead time median | `leadTimeMedianHours` | 72 h |
| Cycle time median | `cycleTimeMedianDays` | 10 days |
| Defect escape rate | `defectEscapePct` | 10% |

Limits are inclusive: a value equal to its limit passes, and only a value
strictly beyond the limit is reported. Medians are `null` for an empty window,
so a metric with no data is skipped instead of being treated as a breach.

A failed check prints one line per breach followed by the source label from the
rule:

```text
PII scrub violations (%)=2 > 0.5
defect escape rate (%)=25 > 10
```

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
