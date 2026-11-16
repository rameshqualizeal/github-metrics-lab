import assert from 'node:assert/strict';
import { test } from 'node:test';
import { safeDivide } from './safe-divide.js';

test('normal division', () => {
  assert.equal(safeDivide(10, 4), 2.5);
  assert.equal(safeDivide(-9, 3), -3);
});

test('zero divisor is null', () => {
  assert.equal(safeDivide(5, 0), null);
  assert.equal(safeDivide(0, 0), null);
});

test('NaN input is null', () => {
  assert.equal(safeDivide(NaN, 2), null);
  assert.equal(safeDivide(2, NaN), null);
});
