import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildLiveMetricsSnapshot, LIVE_METRICS } from '../../src/metrics.ts';
import { buildMetricsReport, formatMetricValue } from './report.ts';
import { SAMPLE_LIVE_INPUT } from './sample.ts';

test('buildMetricsReport renders all fifteen metrics in catalogue order', () => {
  const snapshot = buildLiveMetricsSnapshot(SAMPLE_LIVE_INPUT);
  const report = buildMetricsReport(snapshot);

  for (const metric of LIVE_METRICS) {
    const row = `| ${metric.code} | ${metric.label} | ${snapshot[metric.key]} | ${metric.unit} |`;
    assert.ok(report.includes(row), `${metric.code} row is missing`);
  }

  assert.equal(report.split('\n').filter((line) => line.startsWith('| M')).length, 15);
  assert.match(report, /_15 of 15 metrics included\._/);
});

test('buildMetricsReport accepts a title and generated timestamp', () => {
  const snapshot = buildLiveMetricsSnapshot(SAMPLE_LIVE_INPUT);
  const report = buildMetricsReport(snapshot, {
    title: 'Sprint 42',
    generatedAt: '2026-10-28T00:00:00Z',
  });

  assert.match(report, /^# Sprint 42$/m);
  assert.match(report, /^Generated: 2026-10-28T00:00:00Z$/m);
});

test('buildMetricsReport renders missing percentile and median values as n/a', () => {
  const snapshot = buildLiveMetricsSnapshot({
    ...SAMPLE_LIVE_INPUT,
    ingestLagSeconds: [],
    reviewHours: [],
    leadTimeHours: [],
    cycleTimeDays: [],
  });
  const report = buildMetricsReport(snapshot);

  assert.match(report, /\| M05 \| INGEST LAG p95 \| n\/a \| worst source \|/);
  assert.match(report, /\| M09 \| REVIEW WAIT \| n\/a \| to first review \|/);
  assert.match(report, /\| M11 \| LEAD TIME FOR CHANGES \| n\/a \| commit → prod \|/);
  assert.match(report, /\| M14 \| CYCLE TIME \| n\/a \| work start → merge \|/);
});

test('formatMetricValue keeps numbers and prints n/a for null', () => {
  assert.equal(formatMetricValue(0), '0');
  assert.equal(formatMetricValue(37.5), '37.5');
  assert.equal(formatMetricValue(null), 'n/a');
});
