# Webhook events and the metrics they feed

The helpers in `src/metrics.ts` are pure: they take counts, durations, and
samples. A collector turns GitHub, Jira, and telemetry events into those
inputs. This page records the mapping the lab assumes so new event handlers
stay compatible with the catalogue.

## GitHub events

| Event | Fields used | Feeds |
| --- | --- | --- |
| `pull_request` (`opened`, `reopened`) | `number`, `created_at`, `user.login` | M08 window start, M14 when linked to a Jira key |
| `pull_request` (`synchronize`) | `number`, `updated_at`, `additions`, `deletions` | M10 rework detection, M07 AI-authored line counts |
| `pull_request` (`closed`) | `merged`, `merged_at`, `base.ref` | M08 merged count, M10, M14 |
| `pull_request_review` (`submitted`) | `pull_request.number`, `submitted_at` | M09 review wait |
| `deployment` | `sha`, `environment`, `created_at` | M11 lead-time start, M12 candidate |
| `deployment_status` (`success`) | `deployment.sha`, `created_at` | M11 lead-time end, M12 deploy count |
| `push` to `main` | `after`, `commits[]` | Deployment trigger, M11 commit timestamp |
| `issues` / Jira link events | issue key, status transitions | M14 cycle time |
| telemetry ingest | session, suggestion, token, and PII fields | M01-M07, M13 |
| defect events (Jira or incidents) | escaped flag, linked change | M15 |

## Counting rules

- A pull request counts towards M08 only when `pull_request.merged` is `true`.
  A closed but unmerged PR is not throughput.
- Review wait is `review.submitted_at - pull_request.created_at`; ignore
  reviews authored by the PR author or by bots.
- Count a deployment once, on the `deployment_status` transition to `success`,
  keyed by deployment id.
- Deduplicate deliveries on the `X-GitHub-Delivery` header; retries are common.
- Verify `X-Hub-Signature-256` against the shared secret before parsing.
- Payloads are snapshots, not deltas. Recompute each window from stored events
  instead of incrementing counters, so late or duplicate deliveries converge.

## Boundaries

The collector, storage, and PII scrubbing pipeline live outside this
repository. The lab owns the formulas and the snapshot shape; the collector
owns delivery, retries, and persistence.
