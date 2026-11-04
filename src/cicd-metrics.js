/**
 * Summarize CI/CD workflow runs: [{ conclusion: 'success' | 'failure' | ..., durationSeconds }]
 */
export function summarizeRuns(runs) {
  const total = runs.length;
  const successful = runs.filter(r => r.conclusion === 'success').length;
  const failed = runs.filter(r => r.conclusion === 'failure').length;
  const totalSeconds = runs.reduce((a, r) => a + (r.durationSeconds ?? 0), 0);
  return {
    totalRuns: total,
    successfulRuns: successful,
    failedRuns: failed,
    avgDurationSeconds: total ? totalSeconds / total : 0,
    successRate: total ? successful / total : 0,
  };
}
