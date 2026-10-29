import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  adoptionPct,
  aiAuthoredPercentage,
  attributionMappingPct,
  buildLiveMetricsSnapshot,
  defectEscapePct,
  deployFrequencyPerWeek,
  deployMatchRatio,
  formatLiveMetricsLine,
  formatThroughputLine,
  ingestLagP95Seconds,
  LIVE_METRICS,
  medianCycleTimeDays,
  medianHours,
  medianLeadTimeHours,
  percentile,
  piiScrubViolationPct,
  prThroughput,
  reworkRatePct,
  sessionsPerEngineerPerWeek,
  suggestionAcceptancePct,
  throughputSummary,
  tokenCostPer1kLines,
  type LiveMetricsInput,
} from './metrics.ts';

test('LIVE_METRICS covers all fifteen release-1 metrics', () => {
  assert.equal(LIVE_METRICS.length, 15);
  assert.deepEqual(
    LIVE_METRICS.map((metric) => metric.code),
    Array.from({ length: 15 }, (_, index) => `M${String(index + 1).padStart(2, '0')}`),
  );
  assert.equal(new Set(LIVE_METRICS.map((metric) => metric.key)).size, 15);
});

test('aiAuthoredPercentage matches the Python helper', () => {
  assert.equal(aiAuthoredPercentage(45, 120), 37.5);
  assert.equal(aiAuthoredPercentage(1, 3), 33.33);
  assert.equal(aiAuthoredPercentage(0, 0), 0);
  assert.equal(aiAuthoredPercentage(50, 50), 100);
});

test('prThroughput averages merged PRs per day', () => {
  assert.equal(prThroughput(3, 30), 0.1);
  assert.equal(prThroughput(0, 7), 0);
  assert.equal(prThroughput(1, 0), 0);
});

test('deployMatchRatio reports the matched share', () => {
  assert.equal(deployMatchRatio(2, 3), 66.67);
  assert.equal(deployMatchRatio(0, 0), 0);
});

test('counts must be finite and non-negative', () => {
  assert.throws(() => aiAuthoredPercentage(-1, 10), RangeError);
  assert.throws(() => aiAuthoredPercentage(5, 3), RangeError);
  assert.throws(() => aiAuthoredPercentage(Number.NaN, 10), TypeError);
  assert.throws(() => deployMatchRatio(4, 3), RangeError);
  assert.throws(() => prThroughput(3, -1), RangeError);
  assert.throws(() => prThroughput(3, 30, -1), RangeError);
});

test('throughputSummary matches the Python output', () => {
  assert.deepEqual(throughputSummary(3, 30, 2, 3), {
    throughputPrsPerDay: 0.1,
    deployMatchPct: 66.67,
  });
  assert.equal(
    formatThroughputLine(throughputSummary(3, 30, 2, 3)),
    'merged_prs_per_day=0.1, deploy_match_pct=66.67',
  );
});

test('adoptionPct reports engineers with a session', () => {
  assert.equal(adoptionPct(3, 4), 75);
  assert.equal(adoptionPct(0, 0), 0);
  assert.equal(adoptionPct(4, 4), 100);
  assert.throws(() => adoptionPct(5, 4), RangeError);
  assert.throws(() => adoptionPct(-1, 4), RangeError);
  assert.throws(() => adoptionPct(3, 4, -1), RangeError);
});

test('suggestionAcceptancePct reports the accepted share', () => {
  assert.equal(suggestionAcceptancePct(3, 1), 75);
  assert.equal(suggestionAcceptancePct(1, 2), 33.33);
  assert.equal(suggestionAcceptancePct(1, 2, 0), 33);
  assert.equal(suggestionAcceptancePct(0, 0), 0);
  assert.throws(() => suggestionAcceptancePct(-1, 2), RangeError);
  assert.throws(() => suggestionAcceptancePct(1, Number.NaN), TypeError);
  assert.throws(() => suggestionAcceptancePct(1, 2, 1.5), RangeError);
});

test('sessionsPerEngineerPerWeek normalises to a week', () => {
  assert.equal(sessionsPerEngineerPerWeek(6, 2, 7), 3);
  assert.equal(sessionsPerEngineerPerWeek(4, 4, 7), 1);
  assert.equal(sessionsPerEngineerPerWeek(3, 2, 14), 0.75);
  assert.equal(sessionsPerEngineerPerWeek(10, 0, 7), 0);
  assert.equal(sessionsPerEngineerPerWeek(10, 2, 0), 0);
  assert.throws(() => sessionsPerEngineerPerWeek(-1, 2, 7), RangeError);
});

test('tokenCostPer1kLines scales cost to 1,000 lines', () => {
  assert.equal(tokenCostPer1kLines(1.5, 500), 3);
  assert.equal(tokenCostPer1kLines(1, 3), 333.3333);
  assert.equal(tokenCostPer1kLines(5, 0), 0);
  assert.throws(() => tokenCostPer1kLines(-1, 10), RangeError);
  assert.throws(() => tokenCostPer1kLines(1, Number.POSITIVE_INFINITY), TypeError);
  assert.throws(() => tokenCostPer1kLines(1, 10, -1), RangeError);
});

test('percentile and ingestLagP95Seconds handle the live lag series', () => {
  assert.equal(percentile([10, 20, 30, 40, 50], 95), 48);
  assert.equal(percentile([1, 2, 3, 4], 95), 3.85);
  assert.equal(percentile([], 95), null);
  assert.equal(ingestLagP95Seconds([10, 20, 30, 40, 50]), 48);
  assert.equal(ingestLagP95Seconds([]), null);
  assert.throws(() => percentile([1], 101), RangeError);
  assert.throws(() => percentile([1], -1), RangeError);
  assert.throws(() => percentile([1], 50, -1), RangeError);
});

test('percentile protects the p=0 and p=100 boundaries', () => {
  assert.equal(percentile([10, 20, 30], 0), 10);
  assert.equal(percentile([10, 20, 30], 100), 30);
  assert.equal(percentile([42], 0), 42);
  assert.equal(percentile([42], 50), 42);
  assert.equal(percentile([42], 100), 42);
  assert.equal(percentile([1, 2, 3, 4], 95, 1), 3.9);
  assert.equal(ingestLagP95Seconds([42]), 42);
});

test('piiScrubViolationPct reports the post-redaction share', () => {
  assert.equal(piiScrubViolationPct(2, 100), 2);
  assert.equal(piiScrubViolationPct(0, 0), 0);
  assert.throws(() => piiScrubViolationPct(5, 3), RangeError);
  assert.throws(() => piiScrubViolationPct(-1, 10), RangeError);
});

test('medianHours handles odd, even and empty input', () => {
  assert.equal(medianHours([5, 1, 3]), 3);
  assert.equal(medianHours([4, 1, 2, 3]), 2.5);
  assert.equal(medianHours([1, 2, 2.345], 1), 2);
  assert.equal(medianHours([]), null);
  const input = [3, 1, 2];
  medianHours(input);
  assert.deepEqual(input, [3, 1, 2]);
  assert.throws(() => medianHours([1, -2]), RangeError);
  assert.throws(() => medianHours([1, Number.NaN]), TypeError);
  assert.throws(() => medianHours([1], -1), RangeError);
});

test('reworkRatePct reports merged PRs that needed rework', () => {
  assert.equal(reworkRatePct(1, 4), 25);
  assert.equal(reworkRatePct(0, 0), 0);
  assert.throws(() => reworkRatePct(5, 3), RangeError);
  assert.throws(() => reworkRatePct(-1, 4), RangeError);
});

test('medianLeadTimeHours covers the live lead-time series', () => {
  assert.equal(medianLeadTimeHours([1, 2, 3]), 2);
  assert.equal(medianLeadTimeHours([2, 4, 6]), 4);
  assert.equal(medianLeadTimeHours([]), null);
  assert.throws(() => medianLeadTimeHours([1, -2]), RangeError);
});

test('deployFrequencyPerWeek normalises deploys to a week', () => {
  assert.equal(deployFrequencyPerWeek(4, 14), 2);
  assert.equal(deployFrequencyPerWeek(3, 7), 3);
  assert.equal(deployFrequencyPerWeek(0, 0), 0);
  assert.throws(() => deployFrequencyPerWeek(-1, 7), RangeError);
});

test('attributionMappingPct reports mapped events', () => {
  assert.equal(attributionMappingPct(8, 10), 80);
  assert.equal(attributionMappingPct(0, 0), 0);
  assert.throws(() => attributionMappingPct(11, 10), RangeError);
  assert.throws(() => attributionMappingPct(-1, 10), RangeError);
});

test('medianCycleTimeDays handles odd, even and empty input', () => {
  assert.equal(medianCycleTimeDays([1, 2, 4]), 2);
  assert.equal(medianCycleTimeDays([1, 2, 3, 4]), 2.5);
  assert.equal(medianCycleTimeDays([]), null);
  assert.throws(() => medianCycleTimeDays([1, -2]), RangeError);
});

test('defectEscapePct reports the escaped share', () => {
  assert.equal(defectEscapePct(1, 4), 25);
  assert.equal(defectEscapePct(2, 3), 66.67);
  assert.equal(defectEscapePct(0, 0), 0);
  assert.throws(() => defectEscapePct(5, 3), RangeError);
  assert.throws(() => defectEscapePct(-1, 3), RangeError);
  assert.throws(() => defectEscapePct(Number.NaN, 3), TypeError);
});

test('buildLiveMetricsSnapshot and formatLiveMetricsLine combine every metric', () => {
  const input: LiveMetricsInput = {
    engineersWithSession: 3,
    activeEngineers: 4,
    acceptedSuggestions: 3,
    rejectedSuggestions: 1,
    interactiveSessions: 4,
    costUsd: 1.5,
    linesAdded: 500,
    ingestLagSeconds: [10, 20, 30, 40, 50],
    piiViolations: 2,
    recordsScanned: 100,
    aiLines: 45,
    totalLines: 120,
    mergedPrs: 7,
    reviewHours: [1, 2, 6],
    reworkedPrs: 1,
    leadTimeHours: [2, 4, 6],
    successfulDeploys: 7,
    mappedEvents: 8,
    totalEvents: 10,
    cycleTimeDays: [1, 2, 4],
    escapedDefects: 1,
    linkedDefects: 4,
    days: 7,
    matchedPrs: 2,
    mergedBeforeDeploy: 3,
  };
  const snapshot = buildLiveMetricsSnapshot(input);
  assert.deepEqual(snapshot, {
    adoptionPct: 75,
    suggestionAcceptancePct: 75,
    sessionsPerEngineerWeek: 1,
    tokenCostPer1kLines: 3,
    ingestLagP95Seconds: 48,
    piiViolationPct: 2,
    aiAuthoredPct: 37.5,
    mergedPrs: 7,
    medianReviewHours: 2,
    reworkRatePct: 14.29,
    leadTimeMedianHours: 4,
    deployFrequencyPerWeek: 7,
    attributionMappingPct: 80,
    cycleTimeMedianDays: 2,
    defectEscapePct: 25,
    throughputPrsPerDay: 1,
    deployMatchPct: 66.67,
  });
  assert.equal(
    formatLiveMetricsLine(snapshot),
    'ai_adoption_pct=75, suggestion_acceptance_pct=75, sessions_per_engineer_week=1, ' +
      'token_cost_per_1k_lines=3, ingest_lag_p95_seconds=48, pii_violation_pct=2, ' +
      'ai_authored_pct=37.5, merged_prs=7, median_review_hours=2, rework_rate_pct=14.29, ' +
      'lead_time_median_hours=4, deploy_frequency_per_week=7, attribution_mapping_pct=80, ' +
      'cycle_time_median_days=2, defect_escape_pct=25, merged_prs_per_day=1, deploy_match_pct=66.67',
  );
  assert.throws(() => buildLiveMetricsSnapshot({ ...input, aiLines: 999 }), RangeError);
  assert.throws(() => buildLiveMetricsSnapshot({ ...input, mergedPrs: -1 }), RangeError);

  const empty = buildLiveMetricsSnapshot({
    ...input,
    ingestLagSeconds: [],
    reviewHours: [],
    leadTimeHours: [],
    cycleTimeDays: [],
  });
  assert.equal(empty.ingestLagP95Seconds, null);
  assert.equal(empty.medianReviewHours, null);
  assert.equal(empty.leadTimeMedianHours, null);
  assert.equal(empty.cycleTimeMedianDays, null);
  assert.match(formatLiveMetricsLine(empty), /ingest_lag_p95_seconds=null/);
});
