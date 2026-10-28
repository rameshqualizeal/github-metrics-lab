/**
 * Export the fifteen release-1 metrics as CSV.
 *
 * The rows come from LIVE_METRICS, so the file always follows the catalogue.
 * Import it into Excel, Google Sheets or any other CSV consumer.
 */
import { LIVE_METRICS, type LiveMetricsSnapshot } from '../../src/metrics.ts';

/** Quote a field only when it contains a comma, quote or line break. */
export function csvEscape(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Render a metric value, using `n/a` when a percentile or median has no samples. */
export function formatMetricValue(value: number | null): string {
  return value === null ? 'n/a' : String(value);
}

/** Build a CSV file with a header and one row per release-1 metric. */
export function buildMetricsCsv(snapshot: LiveMetricsSnapshot): string {
  const rows: string[][] = [
    ['code', 'metric', 'value', 'unit'],
    ...LIVE_METRICS.map((metric) => [
      metric.code,
      metric.label,
      formatMetricValue(snapshot[metric.key]),
      metric.unit,
    ]),
  ];
  return `${rows.map((row) => row.map(csvEscape).join(',')).join('\n')}\n`;
}
