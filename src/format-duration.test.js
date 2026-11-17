import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDuration } from './format-duration.js';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

test('shows the two largest units', () => {
  assert.equal(formatDuration(2 * DAY + 3 * HOUR + 15 * MIN), '2d 3h');
  assert.equal(formatDuration(5 * HOUR + 20 * MIN), '5h 20m');
  assert.equal(formatDuration(45 * MIN), '45m');
});

test('skips a zero second unit', () => {
  assert.equal(formatDuration(DAY + 30 * MIN), '1d');
  assert.equal(formatDuration(3 * HOUR), '3h');
});

test('under a minute is "<1m"', () => {
  assert.equal(formatDuration(0), '<1m');
  assert.equal(formatDuration(59 * 1000), '<1m');
});

test('missing or negative input is n/a', () => {
  assert.equal(formatDuration(null), 'n/a');
  assert.equal(formatDuration(undefined), 'n/a');
  assert.equal(formatDuration(-1), 'n/a');
  assert.equal(formatDuration(NaN), 'n/a');
});
