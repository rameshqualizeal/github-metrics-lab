/**
 * Render the fifteen release-1 metrics as a Markdown table.
 *
 * The example reuses LIVE_METRICS and LiveMetricsSnapshot, so the table
 * follows the catalogue automatically when a metric is added or renamed.
 */
import { LIVE_METRICS, type LiveMetricsSnapshot } from '../../src/metrics.ts';

export interface MetricsReportOptions {
  /** Heading shown above the table. */
  title?: string;
  /** Optional ISO timestamp; left out of the report when not supplied. */
  generatedAt?: string;
}

/** Render a metric value, using `n/a` when a percentile or median has no samples. */
export function formatMetricValue(value: number | null): string {
  return value === null ? 'n/a' : String(value);
}

/** Build a deterministic Markdown report for one live snapshot. */
export function buildMetricsReport(
  snapshot: LiveMetricsSnapshot,
  options: MetricsReportOptions = {},
): string {
  const title = options.title ?? 'AI Engineering Metrics - Live Snapshot';
  const lines: string[] = [`# ${title}`, ''];
  if (options.generatedAt) lines.push(`Generated: ${options.generatedAt}`, '');
  lines.push(
    '| Code | Metric | Value | Unit |',
    '| --- | --- | ---: | --- |',
    ...LIVE_METRICS.map(
      (metric) =>
        `| ${metric.code} | ${metric.label} | ${formatMetricValue(snapshot[metric.key])} | ${metric.unit} |`,
    ),
    '',
    `_${LIVE_METRICS.length} of 15 metrics included._`,
    '',
  );
  return lines.join('\n');
}
