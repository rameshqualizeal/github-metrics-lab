# Threshold alert examples

`npm run demo:alerts` compares the live snapshot with the limits in
`src/metric-thresholds.js`. The checks are inclusive: a value at the limit
passes, and only a value beyond it is printed.

## Worked examples

| Command output | Meaning | Action |
| --- | --- | --- |
| `ingest lag p95 (s)=420 > 300` | Events are arriving late. | Check the relay and the collector queue; a restore can explain a one-off spike. |
| `rework rate (%)=24 > 20` | More than one in five merged PRs needed changes after review. | Look at the PR list for repeated review churn; confirm the `refactor` label is applied where relevant. |
| `lead time median (hours)=80 > 72` | Merged work takes more than three days to reach production. | Check deploy frequency and whether releases, rather than deployments, are the source. |
| `cycle time median (days)=12 > 10` | PRs wait too long between work start and merge. | Compare review wait and coding stages; the Jira key in the PR title or branch supplies the start time. |

A metric with no data is skipped, so an empty window never produces a false
breach. The source label printed after each line names the rule that fired.