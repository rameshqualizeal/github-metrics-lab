# github-metrics-lab

Health check: the service is healthy when the home page loads.

## Rework rate (M10)

A merged PR counts as rework when:

1. someone other than the author reviews it and chooses **Request changes**,
2. the author pushes a new commit to the same PR after that review, and
3. the PR is merged.

Self-reviews, unmerged PRs and events after the merge are ignored. A separate
follow-up PR is not rework. Run the sequence with:

```powershell
npm run demo:rework
npm test
```

`src/rework.ts` exposes `isReworkedPullRequest()` and `summarizeRework()`; feed
the summary into `buildLiveMetricsSnapshot()` as `reworkedPrs` / `mergedPrs`.
