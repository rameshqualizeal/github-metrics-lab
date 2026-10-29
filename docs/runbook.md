# Metric alert runbook

This runbook covers the six limits in `DEFAULT_THRESHOLDS`
(`src/metric-thresholds.js`). It is the first-response guide when
`npm run demo:alerts` or a scheduled threshold check reports a breach.

## Before you start

- Reproduce the result with `npm run demo:alerts` and note every reported
  breach. The command checks the sample live window, so use the collector's
  snapshot when investigating a real window.
- Limits are inclusive: a value equal to its limit passes. Only a value
  strictly beyond the limit appears in the output.
- A `null` median means the window had no data. It is skipped, not a breach.
- The formula and owner-facing definition for each metric live in
  [metrics-catalog.md](metrics-catalog.md).

| Metric | Snapshot key | Limit | Owner |
| --- | --- | --- | --- |
| Ingest lag p95 | `ingestLagP95Seconds` | 300 s | Data platform on-call |
| PII scrub violations | `piiViolationPct` | 0.5% | Security engineering |
| Rework rate | `reworkRatePct` | 20% | Metrics lab on-call |
| Lead time median | `leadTimeMedianHours` | 72 h | Delivery lead |
| Cycle time median | `cycleTimeMedianDays` | 10 days | Delivery lead |
| Defect escape rate | `defectEscapePct` | 10% | Quality engineering |

## Ingest lag p95 above 300 seconds

**Likely causes:** collector backlog, a slow upstream webhook source, a stalled
queue consumer, or a burst of retried deliveries.

**First checks:**

1. Compare the per-source lags in the collector to find the worst source.
2. Check queue depth and consumer lag for the ingest pipeline.
3. Look for a spike in retried or duplicate `X-GitHub-Delivery` ids.

**Escalate to:** Data platform on-call.

## PII scrub violations above 0.5%

**Likely causes:** a new event field bypassing the redaction rules, a parser
change that stores raw payloads, or a regression in the scrubber.

**First checks:**

1. Identify the record type and field that still contains PII; do not paste
   the value into a ticket.
2. Confirm the scrubber version deployed to production.
3. Quarantine the affected records and re-run redaction.

**Escalate to:** Security engineering immediately, then the collector owner.

## Rework rate above 20%

**Likely causes:** unclear acceptance criteria, reviews arriving after
substantial rework, or a burst of follow-up fixes in the same window.

**First checks:**

1. List merged PRs with `pull_request.synchronize` events after review.
2. Compare rework across repositories to separate a team issue from a
   repository-specific one.
3. Check whether the window includes an incident follow-up.

**Escalate to:** Metrics lab on-call, then the delivery lead for the affected
team.

## Lead time median above 72 hours

**Likely causes:** deployments batched at the end of a sprint, a deployment
pipeline waiting on manual approval, or commits merged without a matching
deployment.

**First checks:**

1. Compare commit-to-merge time with merge-to-deploy time.
2. Check the deployment workflow for queued or cancelled runs.
3. Confirm that `deployment_status: success` events are arriving for the same
   commit.

**Escalate to:** Delivery lead; involve the release owner if deployments are
stuck.

## Cycle time median above 10 days

**Likely causes:** work waiting in review, Jira status transitions not emitted,
or a long-lived branch that was merged late.

**First checks:**

1. Compare work-start-to-PR-open time with PR-open-to-merge time.
2. Verify that Jira status transitions reach the collector for the same keys.
3. Look for linked items that sat in `In Progress` beyond the window.

**Escalate to:** Delivery lead.

## Defect escape rate above 10%

**Likely causes:** linked defects found after release, missing pre-release
checks, or defects linked to the wrong change.

**First checks:**

1. List escaped defects and confirm each is linked to a change in scope.
2. Check whether the defect was found by a customer or by monitoring.
3. Review the pre-release test evidence for the linked changes.

**Escalate to:** Quality engineering and the delivery lead for the affected
team.

## After the breach

- Record the breach, the root cause, and the corrective action on the Jira
  ticket that owns the change.
- If the limit is wrong rather than the metric, change
  `DEFAULT_THRESHOLDS` in a focused pull request and note the new rationale in
  the README.
- Re-run `npm run demo:alerts` after the fix and attach the clean output.
