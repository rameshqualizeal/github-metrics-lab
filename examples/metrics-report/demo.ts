/**
 * Demo: render all fifteen metrics as a Markdown table.
 *
 *   node examples/metrics-report/demo.ts
 *   node examples/metrics-report/demo.ts --out metrics-report.md
 */
import { writeFileSync } from 'node:fs';
import { buildLiveMetricsSnapshot } from '../../src/metrics.ts';
import { buildMetricsReport } from './report.ts';
import { SAMPLE_LIVE_INPUT } from './sample.ts';

const report = buildMetricsReport(buildLiveMetricsSnapshot(SAMPLE_LIVE_INPUT), {
  generatedAt: new Date().toISOString(),
});

const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
if (outIndex === -1) {
  process.stdout.write(report);
} else {
  const path = args[outIndex + 1];
  if (!path) {
    console.error('--out needs a file path');
    process.exitCode = 1;
  } else {
    writeFileSync(path, report, 'utf8');
    console.log(`Wrote ${path}`);
  }
}
