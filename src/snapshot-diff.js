/**
 * Compare two live metrics snapshots.
 *
 * Plain JavaScript, no dependencies. Useful for "what changed since the last
 * window" output next to the threshold checks in `metric-thresholds.js`.
 *
 * A snapshot is any object of metric values (the shape returned by
 * `buildLiveMetricsSnapshot`). Only keys present in both objects are compared.
 * Values may be numbers or `null`; `null` marks a series with no data, so its
 * delta is unknown rather than zero.
 */

/**
 * @typedef {object} SnapshotDiff
 * @property {string} key
 * @property {number | null} previous
 * @property {number | null} current
 * @property {number | null} delta `current - previous`, or null without data.
 * @property {number | null} pctChange Percent change, or null when the
 * previous value was zero or missing.
 */

function round(value, ndigits = 2) {
  const factor = 10 ** ndigits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function assertValue(name, value) {
  if (value === null || value === undefined) return;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number or null`);
  }
}

/**
 * @param {Record<string, number | null | undefined>} previous
 * @param {Record<string, number | null | undefined>} current
 * @returns {SnapshotDiff[]} One row per shared key, in `current` order.
 */
export function diffSnapshots(previous, current) {
  if (!isObject(previous) || !isObject(current)) {
    throw new TypeError('previous and current must be objects');
  }

  /** @type {SnapshotDiff[]} */
  const rows = [];

  for (const key of Object.keys(current)) {
    if (!Object.prototype.hasOwnProperty.call(previous, key)) continue;

    const before = previous[key];
    const after = current[key];
    assertValue(`previous.${key}`, before);
    assertValue(`current.${key}`, after);

    const hasData = before !== null && before !== undefined && after !== null && after !== undefined;
    const delta = hasData ? round(after - before) : null;
    const pctChange = hasData && before !== 0 ? round(((after - before) / before) * 100) : null;

    rows.push({
      key,
      previous: hasData ? before : (before ?? null),
      current: hasData ? after : (after ?? null),
      delta,
      pctChange,
    });
  }

  return rows;
}

function signed(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

/**
 * Format diff rows for logs.
 *
 * @param {SnapshotDiff[]} rows
 * @returns {string}
 */
export function formatSnapshotDiff(rows) {
  if (rows.length === 0) return 'no comparable metrics';

  return rows
    .map((row) => {
      const before = row.previous ?? 'n/a';
      const after = row.current ?? 'n/a';
      if (row.delta === null) return `${row.key}: ${before} -> ${after} (no data)`;
      const pct = row.pctChange === null ? 'n/a' : `${signed(row.pctChange)}%`;
      return `${row.key}: ${before} -> ${after} ${signed(row.delta)} (${pct})`;
    })
    .join('\n');
}
