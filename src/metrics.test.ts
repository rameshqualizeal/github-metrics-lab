import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  aiAuthoredPercentage,
  deployMatchRatio,
  formatThroughputLine,
  prThroughput,
  throughputSummary,
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
