/**
 * Threshold checks for the live metrics snapshot.
 *
 * Plain JavaScript, no dependencies. Feed any object of metric values (such as
 * the snapshot from `buildLiveMetricsSnapshot`) plus a list of rules and get
 * back the breaches, so the webhook demos can flag a bad window without
 * pulling in a monitoring stack.
 *
 * Rules are inclusive: a value equal to its `max` or `min` passes.
 */

/**
 * @typedef {object} ThresholdRule
 * @property {string} metric Key to read from the snapshot.
 * @property {number} [max] Highest allowed value (inclusive).
 * @property {number} [min] Lowest allowed value (inclusive).
 * @property {string} [label] Human-readable name used in output.
 */

/**
 * @typedef {object} ThresholdBreach
 * @property {string} metric
 * @property {string} label
 * @property {number} value
 * @property {'max' | 'min'} kind
 * @property {number} limit
 */

/**
 * @typedef {object} ThresholdResult
 * @property {boolean} ok True when no rule was breached.
 * @property {number} checked Rules that had a numeric value to evaluate.
 * @property {ThresholdBreach[]} breaches
 * @property {{ metric: string, reason: 'missing' | 'no-data' }[]} skipped
 */

/** Default limits used by the demos and the realtime workflow. */
export const DEFAULT_THRESHOLDS = Object.freeze(
  [
    { metric: 'ingestLagP95Seconds', max: 300, label: 'ingest lag p95 (s)' },
    { metric: 'piiViolationPct', max: 0.5, label: 'PII scrub violations (%)' },
    { metric: 'reworkRatePct', max: 20, label: 'rework rate (%)' },
    { metric: 'leadTimeMedianHours', max: 72, label: 'lead time median (h)' },
    { metric: 'cycleTimeMedianDays', max: 10, label: 'cycle time median (d)' },
    { metric: 'defectEscapePct', max: 10, label: 'defect escape rate (%)' },
  ].map((rule) => Object.freeze(rule)),
);

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

/**
 * Validate one rule, throwing on malformed input.
 *
 * @param {ThresholdRule} rule
 * @returns {ThresholdRule} The same rule, for chaining.
 */
export function validateRule(rule) {
  if (rule === null || typeof rule !== 'object') {
    throw new TypeError('rule must be an object');
  }
  if (typeof rule.metric !== 'string' || rule.metric.trim() === '') {
    throw new TypeError('rule.metric must be a non-empty string');
  }
  const hasMin = rule.min !== undefined;
  const hasMax = rule.max !== undefined;
  if (!hasMin && !hasMax) {
    throw new RangeError(`rule ${rule.metric} needs a min or max`);
  }
  if (hasMin && !Number.isFinite(rule.min)) {
    throw new TypeError(`rule.min for ${rule.metric} must be a finite number`);
  }
  if (hasMax && !Number.isFinite(rule.max)) {
    throw new TypeError(`rule.max for ${rule.metric} must be a finite number`);
  }
  if (hasMin && hasMax && rule.min > rule.max) {
    throw new RangeError(`rule.min cannot exceed rule.max for ${rule.metric}`);
  }
  return rule;
}

/**
 * Compare a metrics object against threshold rules.
 *
 * Missing keys and `null`/`undefined` values are reported as skipped rather
 * than failing, because medians are `null` for an empty window. Any other
 * non-numeric value throws.
 *
 * @param {Record<string, number | null | undefined>} snapshot
 * @param {readonly ThresholdRule[]} [rules]
 * @returns {ThresholdResult}
 */
export function evaluateThresholds(snapshot, rules = DEFAULT_THRESHOLDS) {
  if (snapshot === null || typeof snapshot !== 'object') {
    throw new TypeError('snapshot must be an object');
  }
  if (!Array.isArray(rules)) {
    throw new TypeError('rules must be an array');
  }

  /** @type {ThresholdBreach[]} */
  const breaches = [];
  /** @type {{ metric: string, reason: 'missing' | 'no-data' }[]} */
  const skipped = [];
  let checked = 0;

  for (const rule of rules) {
    validateRule(rule);

    if (!hasOwn(snapshot, rule.metric)) {
      skipped.push({ metric: rule.metric, reason: 'missing' });
      continue;
    }

    const value = snapshot[rule.metric];
    if (value === null || value === undefined) {
      skipped.push({ metric: rule.metric, reason: 'no-data' });
      continue;
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(`snapshot.${rule.metric} must be a finite number`);
    }

    checked += 1;
    const label = rule.label ?? rule.metric;
    if (rule.max !== undefined && value > rule.max) {
      breaches.push({ metric: rule.metric, label, value, kind: 'max', limit: rule.max });
    } else if (rule.min !== undefined && value < rule.min) {
      breaches.push({ metric: rule.metric, label, value, kind: 'min', limit: rule.min });
    }
  }

  return { ok: breaches.length === 0, checked, breaches, skipped };
}

/**
 * One line per breach, plus a one-line summary when everything passes.
 *
 * @param {ThresholdResult} result
 * @returns {string}
 */
export function formatThresholdBreaches(result) {
  if (result.breaches.length === 0) {
    return `ok: ${result.checked} threshold(s) within limits, ${result.skipped.length} skipped`;
  }
  return result.breaches
    .map((breach) => `${breach.label}=${breach.value} ${breach.kind === 'max' ? '>' : '<'} ${breach.limit}`)
    .join('\n');
}
