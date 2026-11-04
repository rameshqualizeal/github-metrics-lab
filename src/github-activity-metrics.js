/**
 * Summarize GitHub engineering activity from a list of simplified events:
 *   { type: 'commit' | 'pr_opened' | 'pr_reviewed' | 'pr_merged', actor: 'login' }
 */
export function summarizeActivity(events) {
  const totals = { commits: 0, prsCreated: 0, prsReviewed: 0, prsMerged: 0 };
  const contributors = {};
  const key = { commit: 'commits', pr_opened: 'prsCreated', pr_reviewed: 'prsReviewed', pr_merged: 'prsMerged' };
  for (const { type, actor } of events) {
    const field = key[type];
    if (!field) continue;
    totals[field] += 1;
    contributors[actor] ??= { commits: 0, prsCreated: 0, prsReviewed: 0, prsMerged: 0 };
    contributors[actor][field] += 1;
  }
  return { ...totals, contributorCount: Object.keys(contributors).length, contributors };
}
