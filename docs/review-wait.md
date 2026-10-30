# Review wait (M09)

Review wait is the median time between a pull request becoming ready for review
and its first review by someone other than the author.

- **Start:** `ready_at` when GitHub reports it, otherwise `created_at`.
- **End:** the first non-author, non-bot review submission.
- **Excluded:** draft time before ready, author self-reviews, bot reviews.

## Percentiles

The dashboard shows p50 and p85. Use p85 for the "slow tail" conversation and
p50 for the typical experience.

| p50 | p85 | Reading |
| --- | --- | --- |
| 0.5 h | 2.1 h | Healthy: most reviews start within the hour. |
| 4.0 h | 26.0 h | The median is acceptable but a quarter of PRs wait more than a day. |

A PR with no review has no end timestamp and is excluded from the median rather
than counted as zero. If the tile shows `—`, check that reviews are being
delivered (webhook or poller) for that repository.