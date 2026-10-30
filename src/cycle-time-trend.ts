/**
 * Groups merged PR cycle times into ISO week buckets for the metrics report.
 *
 * Cycle time is `merged_at - work_start`; a PR without a Jira work start is
 * omitted rather than counted as zero.
 */
export interface CycleSample {
  mergedAt: string | number | Date;
  workStartedAt: string | number | Date;
}

export interface WeeklyCycleTime {
  week: string;
  medianDays: number | null;
  samples: number;
}

const DAY_MS = 86_400_000;

function time(value: string | number | Date): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

/** Monday 00:00 UTC of the week containing `ms`, as YYYY-MM-DD. */
export function weekStart(ms: number): string {
  const d = new Date(ms);
  const day = (d.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day)).toISOString().slice(0, 10);
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function weeklyCycleTime(samples: CycleSample[]): WeeklyCycleTime[] {
  const buckets = new Map<string, number[]>();
  for (const sample of samples) {
    const merged = time(sample.mergedAt);
    const started = time(sample.workStartedAt);
    if (!Number.isFinite(merged) || !Number.isFinite(started) || merged < started) continue;
    const week = weekStart(merged);
    (buckets.get(week) ?? buckets.set(week, []).get(week)!).push((merged - started) / DAY_MS);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, values]) => ({ week, medianDays: median(values), samples: values.length }));
}