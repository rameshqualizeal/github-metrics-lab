import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diffSnapshots, formatSnapshotDiff } from './snapshot-diff.js';

test('computes deltas and percent change for shared numeric keys', () => {
  const rows = diffSnapshots(
    { adoptionPct: 10, reworkRatePct: 20 },
    { adoptionPct: 12.5, reworkRatePct: 15 },
  );

  assert.deepEqual(rows, [
    { key: 'adoptionPct', previous: 10, current: 12.5, delta: 2.5, pctChange: 25 },
    { key: 'reworkRatePct', previous: 20, current: 15, delta: -5, pctChange: -25 },
  ]);
});

test('reports a null percent change when the previous value was zero', () => {
  const [row] = diffSnapshots({ mergedPrs: 0 }, { mergedPrs: 3 });
  assert.equal(row.delta, 3);
  assert.equal(row.pctChange, null);
});

test('keeps null values as no-data instead of zero', () => {
  const [row] = diffSnapshots({ medianReviewHours: null }, { medianReviewHours: 4 });
  assert.deepEqual(row, {
    key: 'medianReviewHours',
    previous: null,
    current: 4,
    delta: null,
    pctChange: null,
  });
});

test('ignores keys that are not shared', () => {
  const rows = diffSnapshots({ oldMetric: 1, mergedPrs: 2 }, { mergedPrs: 4, newMetric: 9 });
  assert.deepEqual(
    rows.map((row) => row.key),
    ['mergedPrs'],
  );
});

test('rejects non-object snapshots and non-numeric values', () => {
  assert.throws(() => diffSnapshots(null, {}), TypeError);
  assert.throws(() => diffSnapshots({}, 'nope'), TypeError);
  assert.throws(() => diffSnapshots({ mergedPrs: '2' }, { mergedPrs: 3 }), TypeError);
  assert.throws(() => diffSnapshots({ mergedPrs: 2 }, { mergedPrs: Number.NaN }), TypeError);
});

test('reports zero change for identical snapshots', () => {
  const rows = diffSnapshots(
    { adoptionPct: 75, medianReviewHours: 2 },
    { adoptionPct: 75, medianReviewHours: 2 },
  );
  assert.deepEqual(rows, [
    { key: 'adoptionPct', previous: 75, current: 75, delta: 0, pctChange: 0 },
    { key: 'medianReviewHours', previous: 2, current: 2, delta: 0, pctChange: 0 },
  ]);
});

test('keeps negative deltas and percentage changes signed', () => {
  const [row] = diffSnapshots({ reworkRatePct: 25 }, { reworkRatePct: 10 });
  assert.deepEqual(row, {
    key: 'reworkRatePct',
    previous: 25,
    current: 10,
    delta: -15,
    pctChange: -60,
  });
});

test('treats undefined values as no-data', () => {
  assert.deepEqual(diffSnapshots({ medianReviewHours: undefined }, { medianReviewHours: 4 }), [
    { key: 'medianReviewHours', previous: null, current: 4, delta: null, pctChange: null },
  ]);
  assert.deepEqual(diffSnapshots({ medianReviewHours: 4 }, { medianReviewHours: undefined }), [
    { key: 'medianReviewHours', previous: 4, current: null, delta: null, pctChange: null },
  ]);
});

test('returns an empty diff for empty snapshots', () => {
  assert.deepEqual(diffSnapshots({}, {}), []);
});

test('formats deltas, zero change, and no-data rows', () => {
  const rows = diffSnapshots(
    { adoptionPct: 10, mergedPrs: 0, medianReviewHours: null },
    { adoptionPct: 12.5, mergedPrs: 3, medianReviewHours: 4 },
  );

  assert.equal(
    formatSnapshotDiff(rows),
    [
      'adoptionPct: 10 -> 12.5 +2.5 (+25%)',
      'mergedPrs: 0 -> 3 +3 (n/a)',
      'medianReviewHours: n/a -> 4 (no data)',
    ].join('\n'),
  );
});

test('formats an empty diff', () => {
  assert.equal(formatSnapshotDiff([]), 'no comparable metrics');
  assert.equal(formatSnapshotDiff(diffSnapshots({ a: 1 }, { b: 2 })), 'no comparable metrics');
});
