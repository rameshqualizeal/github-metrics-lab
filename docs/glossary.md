# Metrics glossary

Plain-language definitions for the terms used by the M01-M15 catalogue. The
exact formulas and units live in
[metrics-catalog.md](metrics-catalog.md); this page explains what each number
means to the person reading a snapshot.

## Window and data terms

| Term | Meaning |
| --- | --- |
| Live window | The rolling period covered by one snapshot. The sample uses seven days, but the collector chooses the window and passes it as `days`. |
| Active engineer | A person on the team roster who is expected to produce work in the window. Inactive accounts are excluded before the snapshot is built. |
| Roster | The list of active engineers used as the denominator for adoption and session metrics. |
| No data (`null`) | The series was empty, so a median or percentile has no value. It is not the same as zero. Threshold checks skip it. |
| Zero | A real measured value of zero, such as zero violations out of 100 scanned records. It counts as evidence and is evaluated against thresholds. |
| Merged line | A line added by a pull request that was merged in the window, after excluding generated and vendored files. |
| Linked defect | A defect associated with a change in scope. A defect with no link is outside the M15 numerator and denominator. |

## The fifteen metrics

### M01 - AI adoption rate

The percentage of active engineers who had at least one AI assistant session
during the window. It answers "how much of the team is trying the tool", not
"how much value the tool produced".

### M02 - Suggestion acceptance

The percentage of AI suggestions that developers accepted, out of accepted
plus rejected suggestions. Suggestions that were ignored without an explicit
reject action are not in the denominator.

### M03 - AI sessions per engineer

Interactive AI sessions divided by active engineers, normalised to a
seven-day week. It measures engagement intensity and complements M01, which
only records whether someone used the tool at all.

### M04 - Token efficiency

Token spend in US dollars per 1,000 added lines. A rising value may mean
longer prompts, more retries, or a more expensive model; pair it with M07 to
see whether the extra spend produced more AI-authored code.

### M05 - Ingest lag p95

The 95th percentile delay between an event occurring and the collector
storing it, in seconds. The p95 emphasises the worst source instead of hiding
it behind a healthy average.

### M06 - PII scrub violations

The percentage of stored records that still contain PII after redaction. Any
non-zero value is a security concern; the default alert limit is deliberately
much tighter than the other thresholds.

### M07 - AI-authored code

The percentage of merged changed lines attributed to an AI assistant. It is a
line share, not a judgement of quality, and it depends on reliable attribution
metadata from the editor or agent.

### M08 - PR throughput

Merged pull requests per day over the window. The snapshot also exposes the
raw merged count as `mergedPrs`, and the supporting
`throughputPrsPerDay` value repeats the rate for dashboards.

### M09 - Review wait

The median hours between opening a pull request and receiving its first
review. Reviews by the author or by bots are excluded so the number reflects
the wait for a human reviewer.

### M10 - Rework rate

The percentage of merged pull requests that needed rework, such as a
`synchronize` event after review or a follow-up fix in the same scope. It
flags churn that throughput and cycle time can hide.

### M11 - Lead time for changes

The median hours from the first commit in a change to the production
deployment that shipped it. It measures the whole path, including review and
release queues.

### M12 - Deploy frequency

Successful production deployments per week. Preview deployments and failed
deployments are excluded, and each deployment id is counted once.

### M13 - Attribution mapping

The percentage of events mapped to a known engineer and team. Low values mean
dashboards are missing people or teams, which weakens every metric that groups
by ownership.

### M14 - Cycle time

The median days from Jira work start to pull request merge. It starts when the
ticket moves into active work, not when the ticket was created, so backlog age
does not inflate the number.

### M15 - Defect escape rate

The percentage of linked defects that escaped to production rather than being
caught before release. It is a quality signal for the changes in scope, not a
count of every production incident.

## Supporting values

| Key | Meaning |
| --- | --- |
| `throughputPrsPerDay` | M08 expressed as a per-day rate, repeated in the snapshot for dashboard consumers. |
| `deployMatchPct` | The share of merged pull requests that match the next successful deploy, used to judge M11 and M12 coverage. |
| `mergedPrs` | The raw merged pull request count for the window; M08's rate is derived from it. |
