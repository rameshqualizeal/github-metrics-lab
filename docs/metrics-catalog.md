# The fifteen metrics

`src/metrics.ts` implements the release-1 catalogue (M01-M15) as pure
functions. Every helper returns a number (or `null` for an empty series) and
accepts an optional `ndigits` argument that defaults to two decimal places
(four for M04).

| Code | Metric | Helper | Formula | Unit |
| --- | --- | --- | --- | --- |
| M01 | AI adoption rate | `adoptionPct` | `engineersWithSession / activeEngineers * 100` | % of roster |
| M02 | Suggestion acceptance | `suggestionAcceptancePct` | `accepted / (accepted + rejected) * 100` | % |
| M03 | AI sessions per engineer | `sessionsPerEngineerPerWeek` | `interactiveSessions / activeEngineers * (7 / days)` | sessions/week |
| M04 | Token efficiency | `tokenCostPer1kLines` | `costUsd / linesAdded * 1000` | USD per 1K lines |
| M05 | Ingest lag p95 | `ingestLagP95Seconds` | 95th percentile with linear interpolation | seconds |
| M06 | PII scrub violations | `piiScrubViolationPct` | `violations / recordsScanned * 100` | % of records |
| M07 | AI-authored code | `aiAuthoredPercentage` | `aiLines / totalLines * 100` | % of merged lines |
| M08 | PR throughput | `prThroughput` | `mergedPrs / days` | PRs/day |
| M09 | Review wait | `medianHours` | median of `reviewHours` | hours |
| M10 | Rework rate | `reworkRatePct` | `reworkedPrs / mergedPrs * 100` | % of merged PRs |
| M11 | Lead time for changes | `medianLeadTimeHours` | median of commit-to-deploy hours | hours |
| M12 | Deploy frequency | `deployFrequencyPerWeek` | `successfulDeploys * 7 / days` | deploys/week |
| M13 | Attribution mapping | `attributionMappingPct` | `mappedEvents / totalEvents * 100` | % of events |
| M14 | Cycle time | `medianCycleTimeDays` | median of work-start-to-merge days | days |
| M15 | Defect escape rate | `defectEscapePct` | `escaped / linkedDefects * 100` | % of linked defects |

## Snapshot keys

`buildLiveMetricsSnapshot` returns one object with these keys, in catalogue
order plus two supporting values:

| Code | Snapshot key |
| --- | --- |
| M01 | `adoptionPct` |
| M02 | `suggestionAcceptancePct` |
| M03 | `sessionsPerEngineerWeek` |
| M04 | `tokenCostPer1kLines` |
| M05 | `ingestLagP95Seconds` |
| M06 | `piiViolationPct` |
| M07 | `aiAuthoredPct` |
| M08 | `mergedPrs` |
| M09 | `medianReviewHours` |
| M10 | `reworkRatePct` |
| M11 | `leadTimeMedianHours` |
| M12 | `deployFrequencyPerWeek` |
| M13 | `attributionMappingPct` |
| M14 | `cycleTimeMedianDays` |
| M15 | `defectEscapePct` |
| — | `throughputPrsPerDay` (supporting) |
| — | `deployMatchPct` (supporting) |

## Edge cases

- A zero denominator returns `0` rather than `NaN`.
- An empty series (M05, M09, M11, M14) returns `null`.
- Counts must be finite and non-negative; impossible shares (for example more
  adopted engineers than active engineers) throw `RangeError`.
- M08 is exposed twice: `prThroughput` is the per-day rate, while the snapshot
  key `mergedPrs` is the count for the window.
