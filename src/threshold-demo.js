/**
 * Demo: check the sample live window against the default thresholds.
 *
 * Run with `npm run demo:alerts`. The sample window deliberately breaches two
 * limits so the output shows both a pass and a failure path.
 */
import { buildLiveMetricsSnapshot } from './metrics.ts';
import { SAMPLE_LIVE_INPUT } from './sample-input.ts';
import { DEFAULT_THRESHOLDS, evaluateThresholds, formatThresholdBreaches } from './metric-thresholds.js';

const snapshot = buildLiveMetricsSnapshot(SAMPLE_LIVE_INPUT);
const result = evaluateThresholds(snapshot);

console.log(`Checking ${DEFAULT_THRESHOLDS.length} thresholds against the sample live window`);
console.log(formatThresholdBreaches(result));
for (const skip of result.skipped) {
  console.log(`skip ${skip.metric} (${skip.reason})`);
}
