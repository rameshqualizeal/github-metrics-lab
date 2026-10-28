/**
 * Demo: export all fifteen metrics as CSV.
 *
 *   node examples/metrics-csv/demo.ts
 *   node examples/metrics-csv/demo.ts --out metrics.csv
 */
import { writeFileSync } from 'node:fs';
import { buildLiveMetricsSnapshot } from '../../src/metrics.ts';
import { buildMetricsCsv } from './csv.ts';
import { SAMPLE_LIVE_INPUT } from './sample.ts';

const csv = buildMetricsCsv(buildLiveMetricsSnapshot(SAMPLE_LIVE_INPUT));

const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
if (outIndex === -1) {
  process.stdout.write(csv);
} else {
  const path = args[outIndex + 1];
  if (!path) {
    console.error('--out needs a file path');
    process.exitCode = 1;
  } else {
    writeFileSync(path, csv, 'utf8');
    console.log(`Wrote ${path}`);
  }
}
