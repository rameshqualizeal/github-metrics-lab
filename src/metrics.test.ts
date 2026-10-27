import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  aiAuthoredPercentage,
  buildLiveMetricsSnapshot,
  defectEscapePct,
  deployMatchRatio,
  formatLiveMetricsLine,
  formatThroughputLine,
  medianHours,
  prThroughput,
  suggestionAcceptancePct,
  throughputSummary,
  tokenCostPer1kLines,
  type LiveMetricsInput,
} from './metrics.ts';

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

test('suggestionAcceptancePct reports the accepted share', () => {
  assert.equal(suggestionAcceptancePct(3, 1), 75);
  assert.equal(suggestionAcceptancePct(1, 2), 33.33);
  assert.equal(suggestionAcceptancePct(1, 2, 0), 33);
  assert.equal(suggestionAcceptancePct(0, 0), 0);
  assert.throws(() => suggestionAcceptancePct(-1, 2), RangeError);
  assert.throws(() => suggestionAcceptancePct(1, Number.NaN), TypeError);
  assert.throws(() => suggestionAcceptancePct(1, 2, 1.5), RangeError);
});

test('tokenCostPer1kLines scales cost to 1,000 lines', () => {
  assert.equal(tokenCostPer1kLines(1.5, 500), 3);
  assert.equal(tokenCostPer1kLines(1, 3), 333.3333);
  assert.equal(tokenCostPer1kLines(5, 0), 0);
  assert.throws(() => tokenCostPer1kLines(-1, 10), RangeError);
  assert.throws(() => tokenCostPer1kLines(1, Number.POSITIVE_INFINITY), TypeError);
  assert.throws(() => tokenCostPer1kLines(1, 10, -1), RangeError);
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
    aiLines: 45,
    totalLines: 120,
    mergedPrs: 3,
    days: 30,
    matchedPrs: 2,
    mergedBeforeDeploy: 3,
    acceptedSuggestions: 3,
    rejectedSuggestions: 1,
    costUsd: 1.5,
    linesAdded: 500,
    reviewHours: [1, 2, 6],
    escapedDefects: 1,
    linkedDefects: 4,
  };
  const snapshot = buildLiveMetricsSnapshot(input);
  assert.deepEqual(snapshot, {
    aiAuthoredPct: 37.5,
    throughputPrsPerDay: 0.1,
    deployMatchPct: 66.67,
    suggestionAcceptancePct: 75,
    tokenCostPer1kLines: 3,
    medianReviewHours: 2,
    defectEscapePct: 25,
  });
  assert.equal(
    formatLiveMetricsLine(snapshot),
    'ai_authored_pct=37.5, merged_prs_per_day=0.1, deploy_match_pct=66.67, ' +
      'suggestion_acceptance_pct=75, token_cost_per_1k_lines=3, median_review_hours=2, defect_escape_pct=25',
  );
  assert.throws(() => buildLiveMetricsSnapshot({ ...input, aiLines: 999 }), RangeError);
  const empty = buildLiveMetricsSnapshot({ ...input, reviewHours: [] });
  assert.equal(empty.medianReviewHours, null);
  assert.match(formatLiveMetricsLine(empty), /median_review_hours=null/);
});
