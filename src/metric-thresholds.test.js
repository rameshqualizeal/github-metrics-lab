import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_THRESHOLDS,
  evaluateThresholds,
  formatThresholdBreaches,
  validateRule,
} from './metric-thresholds.js';

test('limits are inclusive at the boundary', () => {
  const atMax = evaluateThresholds({ lag: 300, acceptance: 60 }, [
    { metric: 'lag', max: 300 },
    { metric: 'acceptance', min: 60 },
  ]);
  assert.equal(atMax.ok, true);
  assert.equal(atMax.checked, 2);
  assert.deepEqual(atMax.breaches, []);

  const inside = evaluateThresholds({ lag: 299.9 }, [{ metric: 'lag', max: 300 }]);
  assert.equal(inside.ok, true);
});

test('reports max and min breaches with their limits', () => {
  const result = evaluateThresholds({ lag: 301.5, acceptance: 12 }, [
    { metric: 'lag', max: 300, label: 'ingest lag p95 (s)' },
    { metric: 'acceptance', min: 40, label: 'acceptance (%)' },
  ]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.breaches, [
    { metric: 'lag', label: 'ingest lag p95 (s)', value: 301.5, kind: 'max', limit: 300 },
    { metric: 'acceptance', label: 'acceptance (%)', value: 12, kind: 'min', limit: 40 },
  ]);
});

test('missing keys and null values are skipped, not failed', () => {
  const result = evaluateThresholds(
    { medianReviewHours: null },
    [
      { metric: 'medianReviewHours', max: 24 },
      { metric: 'medianCycleTimeDays', max: 10 },
    ],
  );
  assert.equal(result.ok, true);
  assert.equal(result.checked, 0);
  assert.deepEqual(result.skipped, [
    { metric: 'medianReviewHours', reason: 'no-data' },
    { metric: 'medianCycleTimeDays', reason: 'missing' },
  ]);
});

test('non-numeric snapshot values are rejected', () => {
  assert.throws(() => evaluateThresholds({ reworkRatePct: '14' }, [{ metric: 'reworkRatePct', max: 20 }]), TypeError);
  assert.throws(() => evaluateThresholds({ reworkRatePct: Number.NaN }, [{ metric: 'reworkRatePct', max: 20 }]), TypeError);
});

test('malformed rules are rejected', () => {
  assert.throws(() => validateRule({ metric: 'lag' }), RangeError);
  assert.throws(() => validateRule({ metric: '', max: 1 }), TypeError);
  assert.throws(() => validateRule({ metric: 'lag', max: Number.POSITIVE_INFINITY }), TypeError);
  assert.throws(() => validateRule({ metric: 'lag', min: 10, max: 1 }), RangeError);
  assert.throws(() => evaluateThresholds({ lag: 1 }, 'not-an-array'), TypeError);
  assert.throws(() => evaluateThresholds(null), TypeError);
});

test('falls back to the metric key when a min rule has no label', () => {
  const result = evaluateThresholds({ acceptancePct: 12 }, [{ metric: 'acceptancePct', min: 40 }]);
  assert.deepEqual(result.breaches, [
    { metric: 'acceptancePct', label: 'acceptancePct', value: 12, kind: 'min', limit: 40 },
  ]);
  assert.equal(formatThresholdBreaches(result), 'acceptancePct=12 < 40');
});

test('accepts a value equal to a min-only limit', () => {
  const result = evaluateThresholds({ acceptancePct: 40 }, [{ metric: 'acceptancePct', min: 40 }]);
  assert.equal(result.ok, true);
  assert.equal(result.checked, 1);
  assert.deepEqual(result.breaches, []);
});

test('reports the correct breach kind when a rule has min and max', () => {
  const over = evaluateThresholds({ reviewHours: 25 }, [{ metric: 'reviewHours', min: 1, max: 24 }]);
  assert.equal(over.breaches[0].kind, 'max');
  assert.equal(over.breaches[0].limit, 24);

  const under = evaluateThresholds({ reviewHours: 0.5 }, [{ metric: 'reviewHours', min: 1, max: 24 }]);
  assert.equal(under.breaches[0].kind, 'min');
  assert.equal(under.breaches[0].limit, 1);

  const inside = evaluateThresholds({ reviewHours: 12 }, [{ metric: 'reviewHours', min: 1, max: 24 }]);
  assert.equal(inside.ok, true);
});

test('default thresholds flag the sample live window', () => {
  const result = evaluateThresholds({
    ingestLagP95Seconds: 48,
    piiViolationPct: 2,
    reworkRatePct: 14.29,
    leadTimeMedianHours: 4,
    cycleTimeMedianDays: 2,
    defectEscapePct: 25,
  });

  assert.equal(DEFAULT_THRESHOLDS.length, 6);
  assert.equal(result.ok, false);
  assert.equal(result.checked, 6);
  assert.deepEqual(
    result.breaches.map((breach) => breach.metric),
    ['piiViolationPct', 'defectEscapePct'],
  );
});

test('formats a summary when clean and one line per breach otherwise', () => {
  const clean = evaluateThresholds({ lag: 10, missing: null }, [
    { metric: 'lag', max: 300 },
    { metric: 'medianReviewHours', max: 24 },
  ]);
  assert.equal(formatThresholdBreaches(clean), 'ok: 1 threshold(s) within limits, 1 skipped');

  const failed = evaluateThresholds({ piiViolationPct: 2, defectEscapePct: 25 });
  assert.equal(
    formatThresholdBreaches(failed),
    'PII scrub violations (%)=2 > 0.5\n' + 'defect escape rate (%)=25 > 10',
  );
});
