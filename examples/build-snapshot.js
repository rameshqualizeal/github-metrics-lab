/**
 * Build a metrics snapshot from a JSON `LiveMetricsInput` file.
 *
 * Usage:
 *   node examples/build-snapshot.js examples/live-window.sample.json
 */
import { readFileSync } from 'node:fs';
import { buildLiveMetricsSnapshot, formatLiveMetricsLine, LIVE_METRICS } from '../src/metrics.ts';

const path = process.argv[2] ?? new URL('./live-window.sample.json', import.meta.url);
const input = JSON.parse(readFileSync(path, 'utf8'));
const snapshot = buildLiveMetricsSnapshot(input);

for (const metric of LIVE_METRICS) {
  console.log(`${metric.code}  ${metric.label.padEnd(26)} ${snapshot[metric.key]} ${metric.unit}`);
}
console.log(formatLiveMetricsLine(snapshot));
