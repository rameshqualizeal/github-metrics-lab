import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isReworkedPullRequest, summarizeRework, type PullRequestTimeline } from './rework.ts';

const reviewCycle: PullRequestTimeline = {
  number: 42,
  author: 'SaiTeja8166',
  mergedAt: '2026-10-27T10:30:00Z',
  events: [
    { type: 'opened', at: '2026-10-27T10:00:00Z', actor: 'SaiTeja8166' },
    {
      type: 'changes_requested',
      at: '2026-10-27T10:10:00Z',
      actor: 'rameshqualizeal',
      comment: 'Please add a test for the empty case.',
    },
    {
      type: 'commented',
      at: '2026-10-27T10:12:00Z',
      actor: 'SaiTeja8166',
      comment: 'On it.',
    },
    { type: 'synchronize', at: '2026-10-27T10:20:00Z', actor: 'SaiTeja8166' },
  ],
};

test('a changes-requested review followed by a new commit and merge is rework', () => {
  assert.equal(isReworkedPullRequest(reviewCycle), true);
  assert.deepEqual(summarizeRework([reviewCycle]), {
    mergedPrs: 1,
    reworkedPrs: 1,
    ratePct: 100,
    reworkedNumbers: [42],
  });
});

test('a clean merge is not rework', () => {
  const pr: PullRequestTimeline = {
    ...reviewCycle,
    events: [
      { type: 'opened', at: '2026-10-27T10:00:00Z', actor: 'SaiTeja8166' },
      { type: 'approved', at: '2026-10-27T10:10:00Z', actor: 'rameshqualizeal' },
      { type: 'synchronize', at: '2026-10-27T10:20:00Z', actor: 'SaiTeja8166' },
    ],
  };
  assert.equal(isReworkedPullRequest(pr), false);
  assert.equal(summarizeRework([pr]).ratePct, 0);
});

test('changes requested without a later commit is not rework', () => {
  const pr: PullRequestTimeline = {
    ...reviewCycle,
    events: [
      { type: 'opened', at: '2026-10-27T10:00:00Z', actor: 'SaiTeja8166' },
      {
        type: 'changes_requested',
        at: '2026-10-27T10:10:00Z',
        actor: 'rameshqualizeal',
        comment: 'Please add a test.',
      },
    ],
  };
  assert.equal(isReworkedPullRequest(pr), false);
});

test('a commit before the changes-requested review is not rework', () => {
  const pr: PullRequestTimeline = {
    ...reviewCycle,
    events: [
      { type: 'opened', at: '2026-10-27T10:00:00Z', actor: 'SaiTeja8166' },
      { type: 'synchronize', at: '2026-10-27T10:05:00Z', actor: 'SaiTeja8166' },
      {
        type: 'changes_requested',
        at: '2026-10-27T10:10:00Z',
        actor: 'rameshqualizeal',
        comment: 'Please add a test.',
      },
    ],
  };
  assert.equal(isReworkedPullRequest(pr), false);
});

test('self-reviews do not count as rework', () => {
  const pr: PullRequestTimeline = {
    ...reviewCycle,
    events: [
      { type: 'opened', at: '2026-10-27T10:00:00Z', actor: 'SaiTeja8166' },
      {
        type: 'changes_requested',
        at: '2026-10-27T10:10:00Z',
        actor: 'SaiTeja8166',
        comment: 'Actually, let me redo this.',
      },
      { type: 'synchronize', at: '2026-10-27T10:20:00Z', actor: 'SaiTeja8166' },
    ],
  };
  assert.equal(isReworkedPullRequest(pr), false);
});

test('events after the merge are ignored', () => {
  const pr: PullRequestTimeline = {
    ...reviewCycle,
    events: [
      { type: 'opened', at: '2026-10-27T10:00:00Z', actor: 'SaiTeja8166' },
      { type: 'synchronize', at: '2026-10-27T10:20:00Z', actor: 'SaiTeja8166' },
      {
        type: 'changes_requested',
        at: '2026-10-27T11:00:00Z',
        actor: 'rameshqualizeal',
        comment: 'This should have been caught before merge.',
      },
    ],
  };
  assert.equal(isReworkedPullRequest(pr), false);
});

test('events are ordered by timestamp, not array order', () => {
  const pr: PullRequestTimeline = {
    ...reviewCycle,
    events: [
      { type: 'synchronize', at: '2026-10-27T10:20:00Z', actor: 'SaiTeja8166' },
      { type: 'opened', at: '2026-10-27T10:00:00Z', actor: 'SaiTeja8166' },
      {
        type: 'changes_requested',
        at: '2026-10-27T10:10:00Z',
        actor: 'rameshqualizeal',
        comment: 'Please add a test.',
      },
    ],
  };
  assert.equal(isReworkedPullRequest(pr), true);
});

test('unmerged PRs stay out of both numerator and denominator', () => {
  const open: PullRequestTimeline = {
    ...reviewCycle,
    number: 43,
    mergedAt: null,
  };
  assert.equal(isReworkedPullRequest(open), false);
  assert.deepEqual(summarizeRework([reviewCycle, open]), {
    mergedPrs: 1,
    reworkedPrs: 1,
    ratePct: 100,
    reworkedNumbers: [42],
  });
});

test('the rate is reworked merged PRs divided by all merged PRs', () => {
  const clean: PullRequestTimeline = {
    number: 44,
    author: 'SaiTeja8166',
    mergedAt: '2026-10-27T12:00:00Z',
    events: [
      { type: 'opened', at: '2026-10-27T11:30:00Z', actor: 'SaiTeja8166' },
      { type: 'approved', at: '2026-10-27T11:45:00Z', actor: 'rameshqualizeal' },
    ],
  };
  assert.deepEqual(summarizeRework([reviewCycle, clean]), {
    mergedPrs: 2,
    reworkedPrs: 1,
    ratePct: 50,
    reworkedNumbers: [42],
  });
});

test('invalid timestamps are rejected', () => {
  const pr: PullRequestTimeline = {
    ...reviewCycle,
    events: [
      { type: 'opened', at: 'not-a-date', actor: 'SaiTeja8166' },
    ],
  };
  assert.throws(() => isReworkedPullRequest(pr), TypeError);
});
