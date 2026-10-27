/**
 * Typed metrics helpers for the GitHub metrics lab.
 *
 * These mirror the Python helpers in `metrics_demo.py` and
 * `throughput_demo.py` so the same numbers can be produced from
 * TypeScript tooling.
 *
 * The release-1 catalogue (M01–M15) is exposed through LIVE_METRICS and
 * buildLiveMetricsSnapshot. All fifteen values are computed for the live
 * rolling window only; historical period windows are intentionally out of scope.
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

/** M01: share of active engineers with at least one Claude Code session (0-100). */
export function adoptionPct(engineersWithSession: number, activeEngineers: number, ndigits = 2): number {
  assertCount('engineersWithSession', engineersWithSession);
  assertCount('activeEngineers', activeEngineers);
  assertNd(ndigits);
  if (engineersWithSession > activeEngineers) {
    throw new RangeError('engineersWithSession cannot exceed activeEngineers');
  }
  if (activeEngineers === 0) return 0;
  return round((engineersWithSession / activeEngineers) * 100, ndigits);
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

/** M03: interactive sessions per active engineer, normalised to a week. */
export function sessionsPerEngineerPerWeek(
  interactiveSessions: number,
  activeEngineers: number,
  days: number,
  ndigits = 2,
): number {
  assertCount('interactiveSessions', interactiveSessions);
  assertCount('activeEngineers', activeEngineers);
  assertCount('days', days);
  assertNd(ndigits);
  if (activeEngineers === 0 || days === 0) return 0;
  return round((interactiveSessions / activeEngineers) * (7 / days), ndigits);
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
 * Percentile of a list of numbers, using linear interpolation.
 *
 * @param values Numbers to summarise.
 * @param p Percentile between 0 and 100.
 * @param ndigits Decimal places to round to.
 * @returns null for an empty list.
 * @throws RangeError if p is outside 0-100 or ndigits is invalid.
 */
export function percentile(values: number[], p: number, ndigits = 2): number | null {
  values.forEach((value) => assertCount('values[]', value));
  assertNd(ndigits);
  if (!Number.isFinite(p) || p < 0 || p > 100) throw new RangeError('p must be between 0 and 100');
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const k = ((sorted.length - 1) * p) / 100;
  const low = Math.floor(k);
  const high = Math.min(low + 1, sorted.length - 1);
  return round(sorted[low] + (sorted[high] - sorted[low]) * (k - low), ndigits);
}

/** M05: 95th percentile ingest lag in seconds (worst source). */
export function ingestLagP95Seconds(lagsSeconds: number[], ndigits = 2): number | null {
  return percentile(lagsSeconds, 95, ndigits);
}

/** M06: share of stored records that still contain PII after redaction (0-100). */
export function piiScrubViolationPct(violations: number, recordsScanned: number, ndigits = 2): number {
  assertCount('violations', violations);
  assertCount('recordsScanned', recordsScanned);
  assertNd(ndigits);
  if (violations > recordsScanned) throw new RangeError('violations cannot exceed recordsScanned');
  if (recordsScanned === 0) return 0;
  return round((violations / recordsScanned) * 100, ndigits);
}

function medianOf(name: string, values: number[], ndigits: number): number | null {
  values.forEach((value) => assertCount(name, value));
  assertNd(ndigits);
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return round(median, ndigits);
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
  return medianOf('values[]', values, ndigits);
}

/** M10: share of merged PRs that needed rework (0-100). */
export function reworkRatePct(reworkedPrs: number, mergedPrs: number, ndigits = 2): number {
  assertCount('reworkedPrs', reworkedPrs);
  assertCount('mergedPrs', mergedPrs);
  assertNd(ndigits);
  if (reworkedPrs > mergedPrs) throw new RangeError('reworkedPrs cannot exceed mergedPrs');
  if (mergedPrs === 0) return 0;
  return round((reworkedPrs / mergedPrs) * 100, ndigits);
}

/** M11: median hours from first commit to the production deploy that shipped it. */
export function medianLeadTimeHours(hours: number[], ndigits = 2): number | null {
  return medianOf('hours[]', hours, ndigits);
}

/** M12: successful production deployments per week. */
export function deployFrequencyPerWeek(successfulDeploys: number, days: number, ndigits = 2): number {
  assertCount('successfulDeploys', successfulDeploys);
  assertCount('days', days);
  assertNd(ndigits);
  if (days === 0) return 0;
  return round((successfulDeploys * 7) / days, ndigits);
}

/** M13: share of events mapped to a known engineer and team (0-100). */
export function attributionMappingPct(mappedEvents: number, totalEvents: number, ndigits = 2): number {
  assertCount('mappedEvents', mappedEvents);
  assertCount('totalEvents', totalEvents);
  assertNd(ndigits);
  if (mappedEvents > totalEvents) throw new RangeError('mappedEvents cannot exceed totalEvents');
  if (totalEvents === 0) return 0;
  return round((mappedEvents / totalEvents) * 100, ndigits);
}

/** M14: median days from Jira work start to PR merge. */
export function medianCycleTimeDays(values: number[], ndigits = 2): number | null {
  return medianOf('cycleTimeDays[]', values, ndigits);
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
  // M01
  engineersWithSession: number;
  activeEngineers: number;
  // M02
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  // M03
  interactiveSessions: number;
  // M04
  costUsd: number;
  linesAdded: number;
  // M05
  ingestLagSeconds: number[];
  // M06
  piiViolations: number;
  recordsScanned: number;
  // M07
  aiLines: number;
  totalLines: number;
  // M08
  mergedPrs: number;
  // M09
  reviewHours: number[];
  // M10
  reworkedPrs: number;
  // M11
  leadTimeHours: number[];
  // M12
  successfulDeploys: number;
  // M13
  mappedEvents: number;
  totalEvents: number;
  // M14
  cycleTimeDays: number[];
  // M15
  escapedDefects: number;
  linkedDefects: number;
  // Window used by the rate metrics.
  days: number;
  // Supporting pipeline values, not part of the fifteen release-1 metrics.
  matchedPrs: number;
  mergedBeforeDeploy: number;
}

export interface LiveMetricsSnapshot {
  adoptionPct: number; // M01
  suggestionAcceptancePct: number; // M02
  sessionsPerEngineerWeek: number; // M03
  tokenCostPer1kLines: number; // M04
  ingestLagP95Seconds: number | null; // M05
  piiViolationPct: number; // M06
  aiAuthoredPct: number; // M07
  mergedPrs: number; // M08
  medianReviewHours: number | null; // M09
  reworkRatePct: number; // M10
  leadTimeMedianHours: number | null; // M11
  deployFrequencyPerWeek: number; // M12
  attributionMappingPct: number; // M13
  cycleTimeMedianDays: number | null; // M14
  defectEscapePct: number; // M15
  // Supporting values.
  throughputPrsPerDay: number;
  deployMatchPct: number;
}

export interface LiveMetricDef {
  code: string;
  key: keyof LiveMetricsSnapshot;
  label: string;
  unit: string;
}

/** All fifteen release-1 metrics, in catalogue order. */
export const LIVE_METRICS: LiveMetricDef[] = [
  { code: 'M01', key: 'adoptionPct', label: 'AI ADOPTION RATE', unit: 'of roster' },
  { code: 'M02', key: 'suggestionAcceptancePct', label: 'SUGGESTION ACCEPTANCE', unit: 'accepted' },
  { code: 'M03', key: 'sessionsPerEngineerWeek', label: 'AI SESSIONS / ENGINEER', unit: 'per week' },
  { code: 'M04', key: 'tokenCostPer1kLines', label: 'TOKEN EFFICIENCY', unit: 'per 1K lines' },
  { code: 'M05', key: 'ingestLagP95Seconds', label: 'INGEST LAG p95', unit: 'worst source' },
  { code: 'M06', key: 'piiViolationPct', label: 'PII SCRUB VIOLATIONS', unit: 'of records' },
  { code: 'M07', key: 'aiAuthoredPct', label: 'AI-AUTHORED CODE', unit: 'of merged lines' },
  { code: 'M08', key: 'mergedPrs', label: 'PR THROUGHPUT', unit: 'merged' },
  { code: 'M09', key: 'medianReviewHours', label: 'REVIEW WAIT', unit: 'to first review' },
  { code: 'M10', key: 'reworkRatePct', label: 'REWORK RATE', unit: 'of merged PRs' },
  { code: 'M11', key: 'leadTimeMedianHours', label: 'LEAD TIME FOR CHANGES', unit: 'commit → prod' },
  { code: 'M12', key: 'deployFrequencyPerWeek', label: 'DEPLOY FREQUENCY', unit: 'per week' },
  { code: 'M13', key: 'attributionMappingPct', label: 'ATTRIBUTION MAPPING', unit: 'events mapped' },
  { code: 'M14', key: 'cycleTimeMedianDays', label: 'CYCLE TIME', unit: 'work start → merge' },
  { code: 'M15', key: 'defectEscapePct', label: 'DEFECT ESCAPE RATE', unit: 'of linked defects' },
];

/** Combine every live metric into one snapshot. */
export function buildLiveMetricsSnapshot(input: LiveMetricsInput): LiveMetricsSnapshot {
  assertCount('mergedPrs', input.mergedPrs);
  return {
    adoptionPct: adoptionPct(input.engineersWithSession, input.activeEngineers),
    suggestionAcceptancePct: suggestionAcceptancePct(input.acceptedSuggestions, input.rejectedSuggestions),
    sessionsPerEngineerWeek: sessionsPerEngineerPerWeek(
      input.interactiveSessions,
      input.activeEngineers,
      input.days,
    ),
    tokenCostPer1kLines: tokenCostPer1kLines(input.costUsd, input.linesAdded),
    ingestLagP95Seconds: ingestLagP95Seconds(input.ingestLagSeconds),
    piiViolationPct: piiScrubViolationPct(input.piiViolations, input.recordsScanned),
    aiAuthoredPct: aiAuthoredPercentage(input.aiLines, input.totalLines),
    mergedPrs: input.mergedPrs,
    medianReviewHours: medianHours(input.reviewHours),
    reworkRatePct: reworkRatePct(input.reworkedPrs, input.mergedPrs),
    leadTimeMedianHours: medianLeadTimeHours(input.leadTimeHours),
    deployFrequencyPerWeek: deployFrequencyPerWeek(input.successfulDeploys, input.days),
    attributionMappingPct: attributionMappingPct(input.mappedEvents, input.totalEvents),
    cycleTimeMedianDays: medianCycleTimeDays(input.cycleTimeDays),
    defectEscapePct: defectEscapePct(input.escapedDefects, input.linkedDefects),
    throughputPrsPerDay: prThroughput(input.mergedPrs, input.days),
    deployMatchPct: deployMatchRatio(input.matchedPrs, input.mergedBeforeDeploy),
  };
}

/** Human-readable key=value line for the live snapshot. */
export function formatLiveMetricsLine(snapshot: LiveMetricsSnapshot): string {
  return [
    `ai_adoption_pct=${snapshot.adoptionPct}`,
    `suggestion_acceptance_pct=${snapshot.suggestionAcceptancePct}`,
    `sessions_per_engineer_week=${snapshot.sessionsPerEngineerWeek}`,
    `token_cost_per_1k_lines=${snapshot.tokenCostPer1kLines}`,
    `ingest_lag_p95_seconds=${snapshot.ingestLagP95Seconds}`,
    `pii_violation_pct=${snapshot.piiViolationPct}`,
    `ai_authored_pct=${snapshot.aiAuthoredPct}`,
    `merged_prs=${snapshot.mergedPrs}`,
    `median_review_hours=${snapshot.medianReviewHours}`,
    `rework_rate_pct=${snapshot.reworkRatePct}`,
    `lead_time_median_hours=${snapshot.leadTimeMedianHours}`,
    `deploy_frequency_per_week=${snapshot.deployFrequencyPerWeek}`,
    `attribution_mapping_pct=${snapshot.attributionMappingPct}`,
    `cycle_time_median_days=${snapshot.cycleTimeMedianDays}`,
    `defect_escape_pct=${snapshot.defectEscapePct}`,
    `merged_prs_per_day=${snapshot.throughputPrsPerDay}`,
    `deploy_match_pct=${snapshot.deployMatchPct}`,
  ].join(', ');
}
