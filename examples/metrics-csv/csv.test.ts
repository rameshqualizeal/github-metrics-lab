import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildLiveMetricsSnapshot, LIVE_METRICS } from '../../src/metrics.ts';
import { buildMetricsCsv, csvEscape, formatMetricValue } from './csv.ts';
import { SAMPLE_LIVE_INPUT } from './sample.ts';

test('buildMetricsCsv writes a header and all fifteen metrics in order', () => {
  const csv = buildMetricsCsv(buildLiveMetricsSnapshot(SAMPLE_LIVE_INPUT));
  const lines = csv.trimEnd().split('\n');

  assert.equal(lines[0], 'code,metric,value,unit');
  assert.equal(lines.length, 16);

  for (const [index, metric] of LIVE_METRICS.entries()) {
    assert.ok(lines[index + 1].startsWith(`${metric.code},${metric.label},`), `${metric.code} is missing`);
  }
  assert.equal(lines[1], 'M01,AI ADOPTION RATE,75,of roster');
});

test('buildMetricsCsv renders missing percentile and median values as n/a', () => {
  const snapshot = buildLiveMetricsSnapshot({
    ...SAMPLE_LIVE_INPUT,
    ingestLagSeconds: [],
    reviewHours: [],
    leadTimeHours: [],
    cycleTimeDays: [],
  });
  const csv = buildMetricsCsv(snapshot);

  assert.match(csv, /^M05,INGEST LAG p95,n\/a,worst source$/m);
  assert.match(csv, /^M09,REVIEW WAIT,n\/a,to first review$/m);
  assert.match(csv, /^M11,LEAD TIME FOR CHANGES,n\/a,commit → prod$/m);
  assert.match(csv, /^M14,CYCLE TIME,n\/a,work start → merge$/m);
});

test('csvEscape quotes commas, quotes and line breaks', () => {
  assert.equal(csvEscape('plain'), 'plain');
  assert.equal(csvEscape('a,b'), '"a,b"');
  assert.equal(csvEscape('a"b'), '"a""b"');
  assert.equal(csvEscape('a\nb'), '"a\nb"');
  assert.equal(csvEscape('a\rb'), '"a\rb"');
});

test('formatMetricValue keeps numbers and prints n/a for null', () => {
  assert.equal(formatMetricValue(0), '0');
  assert.equal(formatMetricValue(37.5), '37.5');
  assert.equal(formatMetricValue(null), 'n/a');
});
