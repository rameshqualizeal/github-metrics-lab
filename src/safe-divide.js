/**
 * Division that never yields Infinity or NaN, for ratios like "deploys per day".
 *
 * Plain JavaScript, no dependencies.
 */

/**
 * @param {number} a
 * @param {number} b
 * @returns {number | null} a / b, or null when b is 0 or either argument is not a finite number
 */
export function safeDivide(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return a / b;
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {number | null} safeDivide(a, b) as a percentage, or null when safeDivide returns null
 */
export function safeRatioPercent(a, b) {
  const ratio = safeDivide(a, b);
  return ratio === null ? null : ratio * 100;
}
