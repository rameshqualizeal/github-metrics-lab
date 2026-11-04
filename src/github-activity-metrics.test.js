import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeActivity } from './github-activity-metrics.js';

test('empty input gives zero totals', () => {
  const s = summarizeActivity([]);
  assert.equal(s.commits, 0);
  assert.equal(s.contributorCount, 0);
});

test('aggregates totals and per-contributor activity', () => {
  const s = summarizeActivity([
    { type: 'commit', actor: 'ana' }, { type: 'commit', actor: 'ana' }, { type: 'commit', actor: 'bo' },
    { type: 'pr_opened', actor: 'ana' }, { type: 'pr_reviewed', actor: 'bo' }, { type: 'pr_merged', actor: 'ana' },
    { type: 'unknown', actor: 'zed' },
  ]);
  assert.equal(s.commits, 3);
  assert.equal(s.prsCreated, 1);
  assert.equal(s.prsReviewed, 1);
  assert.equal(s.prsMerged, 1);
  assert.equal(s.contributorCount, 2);
  assert.deepEqual(s.contributors.ana, { commits: 2, prsCreated: 1, prsReviewed: 0, prsMerged: 1 });
});
