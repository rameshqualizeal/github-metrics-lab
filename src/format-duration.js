/**
 * Compact duration labels for metric tiles ("2d 3h", "45m", "<1m").
 *
 * Plain JavaScript, no dependencies. Shows at most the two largest units so
 * tiles stay short, and returns "n/a" for missing or negative input.
 */

const UNITS = [
  ['d', 24 * 60 * 60 * 1000],
  ['h', 60 * 60 * 1000],
  ['m', 60 * 1000],
];

/**
 * @param {number | null | undefined} ms duration in milliseconds
 * @returns {string}
 */
export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return 'n/a';
  if (ms < 60 * 1000) return '<1m';

  const parts = [];
  let rest = ms;
  for (const [label, size] of UNITS) {
    const count = Math.floor(rest / size);
    rest -= count * size;
    if (count > 0 || parts.length > 0) parts.push([count, label]);
    if (parts.length === 2) break;
  }
  return parts
    .filter(([count]) => count > 0)
    .map(([count, label]) => `${count}${label}`)
    .join(' ');
}
