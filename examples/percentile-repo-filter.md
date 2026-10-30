# Percentile summary with a repository filter

The dashboard scopes the percentile summary by repository. The same view can
be reproduced from a snapshot in two steps:

```js
const merged = snapshot.pullRequests.filter(pr => pr.mergedAt && pr.repo === 'rameshqualizeal/github-metrics-lab');
const cycleDays = merged.map(pr => (pr.mergedAt - pr.workStartedAt) / 86_400_000).sort((a, b) => a - b);
const p = q => cycleDays[Math.min(cycleDays.length - 1, Math.floor(q * cycleDays.length))];
console.log({ repo: 'rameshqualizeal/github-metrics-lab', n: cycleDays.length, p50: p(0.5), p85: p(0.85) });
```

Guidance:

- Filter before computing percentiles; filtering after aggregation mixes repos.
- Keep `n` next to every percentile. A p85 over three PRs is not a trend.
- Repos with no merged PRs in the period return `null`, not `0`.

This mirrors the **Repository** selector in the dashboard: Claude Code and Jira
metrics are not per repository, so they stay unchanged.