/**
 * Demo: the exact M10 rework sequence.
 *
 * Run with `npm run demo:rework`.
 *
 *   1. push code and open a PR
 *   2. a reviewer chooses "Request changes" and writes a comment
 *   3. the author pushes a new commit to the same PR
 *   4. the reviewer merges the PR
 */
import { isReworkedPullRequest, summarizeRework, type PullRequestTimeline } from './rework.ts';

const pr: PullRequestTimeline = {
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

console.log(`PR #${pr.number} by ${pr.author}`);
for (const event of pr.events) {
  const comment = event.comment ? ` — ${event.comment}` : '';
  console.log(`${event.at}  ${event.type.padEnd(18)} ${event.actor}${comment}`);
}
console.log(`merged at ${pr.mergedAt}`);
console.log(`reworked=${isReworkedPullRequest(pr)}`);
const summary = summarizeRework([pr]);
console.log(
  `merged_prs=${summary.mergedPrs}, reworked_prs=${summary.reworkedPrs}, rework_rate_pct=${summary.ratePct}`,
);
