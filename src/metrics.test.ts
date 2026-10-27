import assert from 'node:assert/strict';
import { test } from 'node:test';
import { aiAuthoredPercentage, deployMatchRatio, prThroughput } from './metrics.ts';

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
