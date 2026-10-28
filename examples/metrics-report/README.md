# Metrics report example

Render the full M01-M15 live snapshot as a Markdown table that can be pasted
into a PR, a runbook or a weekly note.

```powershell
# Print the report
node examples/metrics-report/demo.ts

# Write it to a file
node examples/metrics-report/demo.ts --out metrics-report.md

# Run the example tests
node --test examples/metrics-report/report.test.ts
```

The demo uses the sample window in `sample.ts`. Replace `SAMPLE_LIVE_INPUT`
with the input your collector already builds, then call
`buildLiveMetricsSnapshot()` and `buildMetricsReport()`.

`report.ts` reads the existing `LIVE_METRICS` catalogue, so the table always
has one row per release-1 metric:

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

Percentiles and medians with no samples render as `n/a` instead of `null`.
