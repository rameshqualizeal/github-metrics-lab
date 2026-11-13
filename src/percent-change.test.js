import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatChange, percentChange } from './percent-change.js';

test('regular increase and decrease', () => {
  assert.deepEqual(percentChange(110, 100), { kind: 'pct', value: 10 });
  assert.equal(formatChange(percentChange(110, 100)), '+10.0%');
  assert.equal(formatChange(percentChange(97, 100)), '−3.0%');
});

test('zero prior is "new", both zero is flat', () => {
  assert.deepEqual(percentChange(5, 0), { kind: 'new' });
  assert.equal(formatChange(percentChange(0, 0)), '±0%');
});

test('missing values are n/a', () => {
  assert.equal(formatChange(percentChange(null, 4)), 'n/a');
  assert.equal(formatChange(percentChange(4, undefined)), 'n/a');
});
