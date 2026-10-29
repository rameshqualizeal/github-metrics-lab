/**
 * Demo: compare two live metric windows with the snapshot diff helpers.
 *
 * Run with `npm run demo:diff`. The values are sample windows so the output
 * shape is visible without a live collector.
 */
import { diffSnapshots, formatSnapshotDiff } from '../src/snapshot-diff.js';

const previousWindow = {
  adoptionPct: 62.5,
  suggestionAcceptancePct: 71.4,
  sessionsPerEngineerWeek: 4.2,
  tokenCostPer1kLines: 2.85,
  ingestLagP95Seconds: 240,
  piiViolationPct: 0.4,
  aiAuthoredPct: 38.2,
  mergedPrs: 9,
  medianReviewHours: 5.5,
  reworkRatePct: 16.67,
  leadTimeMedianHours: 36,
  deployFrequencyPerWeek: 5,
  attributionMappingPct: 96,
  cycleTimeMedianDays: null,
  defectEscapePct: 4,
};

const currentWindow = {
  ...previousWindow,
  adoptionPct: 75,
  suggestionAcceptancePct: 78.6,
  sessionsPerEngineerWeek: 4.2,
  tokenCostPer1kLines: 2.85,
  ingestLagP95Seconds: 48,
  piiViolationPct: 0.2,
  aiAuthoredPct: 37.5,
  mergedPrs: 12,
  medianReviewHours: 2,
  reworkRatePct: 14.29,
  leadTimeMedianHours: 24,
  deployFrequencyPerWeek: 7,
  attributionMappingPct: 100,
  cycleTimeMedianDays: 2.5,
  defectEscapePct: 2.5,
};

console.log('Snapshot diff: previous 60 minutes -> current 60 minutes');
console.log(formatSnapshotDiff(diffSnapshots(previousWindow, currentWindow)));
