# Weekly PR throughput example

Use this shape when you need throughput per week instead of one number for the
whole period.

```js
const weekOf = ms => {
  const d = new Date(ms);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)));
  return monday.toISOString().slice(0, 10);
};

const counts = new Map();
for (const pr of snapshot.pullRequests) {
  if (!pr.mergedAt || pr.bot) continue;
  const week = weekOf(pr.mergedAt);
  counts.set(week, (counts.get(week) ?? 0) + 1);
}
console.table([...counts].sort().map(([week, merged]) => ({ week, merged })));
```

## Reading the result

- Compare full weeks. A partial first or last week is not a drop in delivery.
- Per-engineer throughput is a coaching input, not a ranking: one large PR can
  dominate a week.
- Bots are excluded; a dependency-update burst should not look like team output.
- A week with no merges is `0`, not `null`. Only a period with no data at all is
  reported as `—`.