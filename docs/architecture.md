# Architecture

The lab is deliberately small: pure metric formulas, a sample input, two
demos, and a deployment trigger. Webhook delivery, storage, and dashboards
live outside this repository.

## Flow

```text
 GitHub / Jira / telemetry events
              |
              v
      collector (external)
              |  LiveMetricsInput
              v
   buildLiveMetricsSnapshot()        src/metrics.ts
              |  LiveMetricsSnapshot
      +-------+-------------+----------------+
      v                     v                v
 formatLiveMetricsLine  evaluateThresholds  createGithubDeployment
   (key=value line)      (alerts, JS)        (deployment events)
```

## Components

| Path | Role |
| --- | --- |
| `src/metrics.ts` | Fifteen formulas, `LiveMetricsInput`, `LiveMetricsSnapshot`, `LIVE_METRICS`, `buildLiveMetricsSnapshot`, `formatLiveMetricsLine` |
| `src/sample-input.ts` | One representative input shared by the demos and tests |
| `src/live-metrics-demo.ts` | Prints the snapshot; no network |
| `src/live-metrics-json.ts` | Prints the same snapshot as JSON for pipelines |
| `src/realtime-deploy.ts` | Computes the snapshot and creates a deployment plus success status |
| `src/realtime-metrics-demo.ts` | Entry point for `npm run demo:realtime` and the workflow |
| `src/metric-thresholds.js` | Min/max checks and breach formatting for alert demos |
| `src/snapshot-diff.js` | Deltas between two snapshots |
| `.github/workflows/realtime-metrics-deploy.yml` | Runs tests, prints metrics, creates one deployment per run |
| `.github/workflows/deploy.yml` | Placeholder production deploy that fires `deployment` events |

## Structured output

`npm run demo:json` prints the snapshot from the sample window as JSON. Use it
when a pipeline needs to parse metrics with `jq`, feed a dashboard importer, or
archive a window alongside a deployment record. `demo:live` remains the
human-readable view; both commands read the same `SAMPLE_LIVE_INPUT`.

## Deployment trigger

`deploymentTriggerFromEnv` reads the standard Actions environment:

- `DEPLOY_ENABLED=false` disables the trigger (used for fork pull requests).
- `GITHUB_TOKEN` or `GH_TOKEN` plus `GITHUB_REPOSITORY` are required.
- `GITHUB_SHA` (or `GITHUB_REF_NAME`) selects the ref.
- `DEPLOY_ENVIRONMENT` defaults to `preview` for pull requests and
  `production` for pushes.

The deployment is created with `required_contexts: []` and immediately marked
`success`, which produces the `deployment_status` webhook used by M11 and M12.
A failed deployment never hides the snapshot: `runRealtimeMetricsDeploy`
returns both the metrics and the error.
