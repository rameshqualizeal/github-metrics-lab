/**
 * Demo: print all fifteen release-1 metrics for one live window.
 *
 * Run with `npm run demo:live`. The numbers are sample values so the output
 * shape is visible without a live webhook or telemetry feed.
 */
import { buildLiveMetricsSnapshot, formatLiveMetricsLine, LIVE_METRICS } from './metrics.ts';
import { SAMPLE_LIVE_INPUT } from './sample-input.ts';

const snapshot = buildLiveMetricsSnapshot(SAMPLE_LIVE_INPUT);

console.log('Live window: rolling 60 minutes');
for (const metric of LIVE_METRICS) {
  console.log(`${metric.code}  ${metric.label.padEnd(26)} ${snapshot[metric.key]} ${metric.unit}`);
}
console.log(formatLiveMetricsLine(snapshot));
