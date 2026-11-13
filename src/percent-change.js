/**
 * Period-over-period change for metric tiles ("+12% vs last week").
 *
 * Plain JavaScript, no dependencies. Returns a number (percent) or a label for
 * the cases a percentage cannot describe, so the UI never shows "+Infinity%".
 */

/**
 * @param {number | null | undefined} current
 * @param {number | null | undefined} prior
 * @returns {{ kind: 'pct', value: number } | { kind: 'new' } | { kind: 'flat' } | { kind: 'na' }}
 */
export function percentChange(current, prior) {
  if (!Number.isFinite(current) || !Number.isFinite(prior)) return { kind: 'na' };
  if (prior === 0) return current === 0 ? { kind: 'flat' } : { kind: 'new' };
  return { kind: 'pct', value: ((current - prior) / Math.abs(prior)) * 100 };
}

/**
 * Formats a change for a tile, e.g. "+12.5%", "−3.0%", "±0%", "new", "n/a".
 * @param {ReturnType<typeof percentChange>} change
 * @param {number} [digits=1]
 */
export function formatChange(change, digits = 1) {
  switch (change.kind) {
    case 'na': return 'n/a';
    case 'new': return 'new';
    case 'flat': return '±0%';
    default: {
      const v = change.value;
      const shown = Math.abs(v).toFixed(digits);
      // Treat changes that round to zero as flat, so a tile never shows "−0.0%".
      if (Number(shown) === 0) return '±0%';
      return `${v > 0 ? '+' : '−'}${shown}%`;
    }
  }
}
