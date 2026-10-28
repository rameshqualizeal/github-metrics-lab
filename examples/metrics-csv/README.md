# Metrics CSV example

Export the full M01-M15 live snapshot as CSV for Excel, Google Sheets or a
data warehouse import.

```powershell
# Print the CSV
node examples/metrics-csv/demo.ts

# Write it to a file
node examples/metrics-csv/demo.ts --out metrics.csv

# Run the example tests
node --test examples/metrics-csv/csv.test.ts
```

Example output:

```csv
code,metric,value,unit
M01,AI ADOPTION RATE,75,of roster
M02,SUGGESTION ACCEPTANCE,75,accepted
M03,AI SESSIONS / ENGINEER,1,per week
M04,TOKEN EFFICIENCY,3,per 1K lines
M05,INGEST LAG p95,48,worst source
M06,PII SCRUB VIOLATIONS,2,of records
M07,AI-AUTHORED CODE,37.5,of merged lines
M08,PR THROUGHPUT,7,merged
M09,REVIEW WAIT,2,to first review
M10,REWORK RATE,14.29,of merged PRs
M11,LEAD TIME FOR CHANGES,4,commit → prod
M12,DEPLOY FREQUENCY,7,per week
M13,ATTRIBUTION MAPPING,80,events mapped
M14,CYCLE TIME,2,work start → merge
M15,DEFECT ESCAPE RATE,25,of linked defects
```

The demo uses the sample window in `sample.ts`. Replace `SAMPLE_LIVE_INPUT`
with the input your collector builds, then call `buildLiveMetricsSnapshot()`
and `buildMetricsCsv()`.

Percentiles and medians with no samples render as `n/a` instead of `null`.
Fields containing a comma, quote or line break are quoted per CSV rules.
