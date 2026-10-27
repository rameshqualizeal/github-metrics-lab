/**
 * Typed metrics helpers for the GitHub metrics lab.
 *
 * These mirror the Python helpers in `metrics_demo.py` and
 * `throughput_demo.py` so the same numbers can be produced from
 * TypeScript tooling.
 */

/** Round to a fixed number of decimal places. */
function round(value: number, ndigits: number): number {
  const factor = 10 ** ndigits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Percentage of changed lines that were AI-authored.
 *
 * @param aiLines Lines attributed to an AI assistant.
 * @param totalLines Total changed lines in the same scope.
 * @param ndigits Decimal places to round to.
 */
export function aiAuthoredPercentage(aiLines: number, totalLines: number, ndigits = 2): number {
  if (totalLines === 0) return 0;
  return round((aiLines / totalLines) * 100, ndigits);
}

/** Average merged pull requests per day over the window. */
export function prThroughput(mergedPrs: number, days: number, ndigits = 2): number {
  if (days <= 0) return 0;
  return round(mergedPrs / days, ndigits);
}

/** Share of merged PRs linked to the next successful deploy (0-100). */
export function deployMatchRatio(matchedPrs: number, mergedBeforeDeploy: number, ndigits = 2): number {
  if (mergedBeforeDeploy === 0) return 0;
  return round((matchedPrs / mergedBeforeDeploy) * 100, ndigits);
}
