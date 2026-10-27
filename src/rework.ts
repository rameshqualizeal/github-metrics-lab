/**
 * M10 rework rate from pull-request timelines.
 *
 * A merged PR counts as rework when all three things happen:
 *   1. someone other than the author submits a "changes requested" review,
 *   2. a new commit is pushed to the same PR after that review, and
 *   3. the PR is merged.
 *
 * Opening a second PR is not rework. Self-reviews and events after the merge
 * are ignored. The rate is reworked merged PRs / all merged PRs.
 *
 * Feed the summary into the live snapshot:
 *
 *   const rework = summarizeRework(timelines);
 *   buildLiveMetricsSnapshot({
 *     ...input,
 *     mergedPrs: rework.mergedPrs,
 *     reworkedPrs: rework.reworkedPrs,
 *   });
 */
import { reworkRatePct } from './metrics.ts';

export type PullRequestEventType =
  | 'opened'
  | 'changes_requested'
  | 'approved'
  | 'commented'
  | 'synchronize'
  | 'closed';

export interface PullRequestEvent {
  type: PullRequestEventType;
  /** ISO-8601 timestamp from the GitHub webhook. */
  at: string;
  /** GitHub login that produced the event. */
  actor: string;
  comment?: string;
}

export interface PullRequestTimeline {
  number: number;
  author: string;
  /** Merge timestamp, or null while the PR is still open or was closed unmerged. */
  mergedAt: string | null;
  events: PullRequestEvent[];
}

export interface ReworkSummary {
  mergedPrs: number;
  reworkedPrs: number;
  ratePct: number;
  reworkedNumbers: number[];
}

function timeOf(iso: string): number {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) throw new TypeError(`invalid ISO timestamp: ${iso}`);
  return time;
}

/**
 * True when a merged PR has a synchronize event after a changes-requested
 * review from somebody other than the author.
 */
export function isReworkedPullRequest(pr: PullRequestTimeline): boolean {
  if (!pr.mergedAt) return false;
  const mergedAt = timeOf(pr.mergedAt);
  const events = pr.events
    .map((event) => ({ ...event, time: timeOf(event.at) }))
    .filter((event) => event.time < mergedAt)
    .sort((a, b) => a.time - b.time);
  const review = events.find(
    (event) => event.type === 'changes_requested' && event.actor !== pr.author,
  );
  if (!review) return false;
  return events.some((event) => event.type === 'synchronize' && event.time > review.time);
}

/** Rework rate across merged PRs, plus the PR numbers that needed rework. */
export function summarizeRework(prs: PullRequestTimeline[]): ReworkSummary {
  const merged = prs.filter((pr) => pr.mergedAt !== null);
  const reworked = merged.filter(isReworkedPullRequest);
  return {
    mergedPrs: merged.length,
    reworkedPrs: reworked.length,
    ratePct: reworkRatePct(reworked.length, merged.length),
    reworkedNumbers: reworked.map((pr) => pr.number),
  };
}
