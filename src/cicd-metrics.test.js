import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeRuns } from './cicd-metrics.js';

test('no runs gives zeros', () => {
  assert.deepEqual(summarizeRuns([]), { totalRuns: 0, successfulRuns: 0, failedRuns: 0, avgDurationSeconds: 0, successRate: 0 });
});

test('computes counts, duration and success rate', () => {
  const s = summarizeRuns([
    { conclusion: 'success', durationSeconds: 60 },
    { conclusion: 'success', durationSeconds: 120 },
    { conclusion: 'failure', durationSeconds: 90 },
    { conclusion: 'cancelled', durationSeconds: 30 },
  ]);
  assert.equal(s.totalRuns, 4);
  assert.equal(s.successfulRuns, 2);
  assert.equal(s.failedRuns, 1);
  assert.equal(s.avgDurationSeconds, 75);
  assert.equal(s.successRate, 0.5);
});
