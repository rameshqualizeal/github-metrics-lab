import type { LiveMetricsInput } from '../../src/metrics.ts';

/** One representative live window used by the report demo and tests. */
export const SAMPLE_LIVE_INPUT: LiveMetricsInput = {
  // M01 adoption
  engineersWithSession: 3,
  activeEngineers: 4,
  // M02 suggestion acceptance
  acceptedSuggestions: 3,
  rejectedSuggestions: 1,
  // M03 sessions per engineer
  interactiveSessions: 4,
  // M04 token efficiency
  costUsd: 1.5,
  linesAdded: 500,
  // M05 ingest lag
  ingestLagSeconds: [10, 20, 30, 40, 50],
  // M06 PII scrub
  piiViolations: 2,
  recordsScanned: 100,
  // M07 AI-authored code
  aiLines: 45,
  totalLines: 120,
  // M08 PR throughput
  mergedPrs: 7,
  // M09 review wait
  reviewHours: [1, 2, 6],
  // M10 rework
  reworkedPrs: 1,
  // M11 lead time
  leadTimeHours: [2, 4, 6],
  // M12 deploy frequency
  successfulDeploys: 7,
  // M13 attribution mapping
  mappedEvents: 8,
  totalEvents: 10,
  // M14 cycle time
  cycleTimeDays: [1, 2, 4],
  // M15 defect escape
  escapedDefects: 1,
  linkedDefects: 4,
  // Live window and supporting values
  days: 7,
  matchedPrs: 2,
  mergedBeforeDeploy: 3,
};
