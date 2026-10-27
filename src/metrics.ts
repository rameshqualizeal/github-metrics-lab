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

function assertCount(name: string, value: number): void {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
  if (value < 0) throw new RangeError(`${name} must be non-negative`);
}

function assertNd(ndigits: number): void {
  if (!Number.isInteger(ndigits) || ndigits < 0) {
    throw new RangeError('ndigits must be a non-negative integer');
  }
}

/**
 * Percentage of changed lines that were AI-authored.
 *
 * @param aiLines Lines attributed to an AI assistant.
 * @param totalLines Total changed lines in the same scope.
 * @param ndigits Decimal places to round to.
 * @throws TypeError if a count is not a finite number.
 * @throws RangeError if a count is negative or aiLines exceeds totalLines.
 */
export function aiAuthoredPercentage(aiLines: number, totalLines: number, ndigits = 2): number {
  assertCount('aiLines', aiLines);
  assertCount('totalLines', totalLines);
  assertNd(ndigits);
  if (aiLines > totalLines) throw new RangeError('aiLines cannot exceed totalLines');
  if (totalLines === 0) return 0;
  return round((aiLines / totalLines) * 100, ndigits);
}

/** Average merged pull requests per day over the window. */
export function prThroughput(mergedPrs: number, days: number, ndigits = 2): number {
  assertCount('mergedPrs', mergedPrs);
  assertCount('days', days);
  assertNd(ndigits);
  if (days === 0) return 0;
  return round(mergedPrs / days, ndigits);
}

/** Share of merged PRs linked to the next successful deploy (0-100). */
export function deployMatchRatio(matchedPrs: number, mergedBeforeDeploy: number, ndigits = 2): number {
  assertCount('matchedPrs', matchedPrs);
  assertCount('mergedBeforeDeploy', mergedBeforeDeploy);
  assertNd(ndigits);
  if (matchedPrs > mergedBeforeDeploy) throw new RangeError('matchedPrs cannot exceed mergedBeforeDeploy');
  if (mergedBeforeDeploy === 0) return 0;
  return round((matchedPrs / mergedBeforeDeploy) * 100, ndigits);
}

export interface ThroughputSummary {
  throughputPrsPerDay: number;
  deployMatchPct: number;
}

/** One-line summary for AT-10 telemetry webhook checks. */
export function throughputSummary(
  mergedPrs: number,
  days: number,
  matchedPrs: number,
  mergedBeforeDeploy: number,
): ThroughputSummary {
  return {
    throughputPrsPerDay: prThroughput(mergedPrs, days),
    deployMatchPct: deployMatchRatio(matchedPrs, mergedBeforeDeploy),
  };
}

/** Human-readable line for demo scripts and logs. */
export function formatThroughputLine(summary: ThroughputSummary): string {
  return `merged_prs_per_day=${summary.throughputPrsPerDay}, deploy_match_pct=${summary.deployMatchPct}`;
}
