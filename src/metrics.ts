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

/**
 * Share of AI suggestions that were accepted (0-100).
 *
 * @param accepted Suggestions the developer accepted.
 * @param rejected Suggestions the developer rejected.
 * @param ndigits Decimal places to round to.
 * @returns 0 when there were no suggestions.
 * @throws TypeError if a count is not a finite number.
 * @throws RangeError if a count is negative or ndigits is invalid.
 */
export function suggestionAcceptancePct(accepted: number, rejected: number, ndigits = 2): number {
  assertCount('accepted', accepted);
  assertCount('rejected', rejected);
  assertNd(ndigits);
  const total = accepted + rejected;
  if (total === 0) return 0;
  return round((accepted / total) * 100, ndigits);
}

/**
 * Token cost in USD per 1,000 added lines.
 *
 * @param costUsd Total token spend in USD.
 * @param linesAdded Lines added in the same scope.
 * @param ndigits Decimal places to round to.
 * @returns 0 when no lines were added.
 * @throws TypeError if a value is not a finite number.
 * @throws RangeError if a value is negative or ndigits is invalid.
 */
export function tokenCostPer1kLines(costUsd: number, linesAdded: number, ndigits = 4): number {
  assertCount('costUsd', costUsd);
  assertCount('linesAdded', linesAdded);
  assertNd(ndigits);
  if (linesAdded === 0) return 0;
  return round((costUsd / linesAdded) * 1000, ndigits);
}

/**
 * Median of a list of durations in hours.
 *
 * @param values Durations in hours.
 * @param ndigits Decimal places to round to.
 * @returns null for an empty list.
 * @throws TypeError if a value is not a finite number.
 * @throws RangeError if a value is negative or ndigits is invalid.
 */
export function medianHours(values: number[], ndigits = 2): number | null {
  values.forEach((value) => assertCount('values[]', value));
  assertNd(ndigits);
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return round(median, ndigits);
}

/**
 * Share of linked defects that escaped to production (0-100).
 *
 * @param escaped Defects found after release.
 * @param linkedDefects Defects linked to the changes in scope.
 * @param ndigits Decimal places to round to.
 * @returns 0 when there are no linked defects.
 * @throws TypeError if a count is not a finite number.
 * @throws RangeError if a count is negative, escaped exceeds linkedDefects, or ndigits is invalid.
 */
export function defectEscapePct(escaped: number, linkedDefects: number, ndigits = 2): number {
  assertCount('escaped', escaped);
  assertCount('linkedDefects', linkedDefects);
  assertNd(ndigits);
  if (escaped > linkedDefects) throw new RangeError('escaped cannot exceed linkedDefects');
  if (linkedDefects === 0) return 0;
  return round((escaped / linkedDefects) * 100, ndigits);
}

export interface LiveMetricsInput {
  aiLines: number;
  totalLines: number;
  mergedPrs: number;
  days: number;
  matchedPrs: number;
  mergedBeforeDeploy: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  costUsd: number;
  linesAdded: number;
  reviewHours: number[];
  escapedDefects: number;
  linkedDefects: number;
}

export interface LiveMetricsSnapshot {
  aiAuthoredPct: number;
  throughputPrsPerDay: number;
  deployMatchPct: number;
  suggestionAcceptancePct: number;
  tokenCostPer1kLines: number;
  medianReviewHours: number | null;
  defectEscapePct: number;
}

/** Combine every live metric into one snapshot. */
export function buildLiveMetricsSnapshot(input: LiveMetricsInput): LiveMetricsSnapshot {
  return {
    aiAuthoredPct: aiAuthoredPercentage(input.aiLines, input.totalLines),
    throughputPrsPerDay: prThroughput(input.mergedPrs, input.days),
    deployMatchPct: deployMatchRatio(input.matchedPrs, input.mergedBeforeDeploy),
    suggestionAcceptancePct: suggestionAcceptancePct(input.acceptedSuggestions, input.rejectedSuggestions),
    tokenCostPer1kLines: tokenCostPer1kLines(input.costUsd, input.linesAdded),
    medianReviewHours: medianHours(input.reviewHours),
    defectEscapePct: defectEscapePct(input.escapedDefects, input.linkedDefects),
  };
}

/** Human-readable key=value line for the live snapshot. */
export function formatLiveMetricsLine(snapshot: LiveMetricsSnapshot): string {
  return [
    `ai_authored_pct=${snapshot.aiAuthoredPct}`,
    `merged_prs_per_day=${snapshot.throughputPrsPerDay}`,
    `deploy_match_pct=${snapshot.deployMatchPct}`,
    `suggestion_acceptance_pct=${snapshot.suggestionAcceptancePct}`,
    `token_cost_per_1k_lines=${snapshot.tokenCostPer1kLines}`,
    `median_review_hours=${snapshot.medianReviewHours}`,
    `defect_escape_pct=${snapshot.defectEscapePct}`,
  ].join(', ');
}
