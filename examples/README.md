# Examples

`live-window.sample.json` is the JSON form of `SAMPLE_LIVE_INPUT` from
`src/sample-input.ts`. Run it through the snapshot builder to see the same
numbers as `npm run demo:live`:

```powershell
node examples/build-snapshot.js examples/live-window.sample.json
```

The builder imports the TypeScript helpers directly, so Node.js 22.18 or newer
is required. Add a field to `LiveMetricsInput` first if a new example needs it.

`snapshot-diff-demo.js` compares two representative live windows with the
helpers in `src/snapshot-diff.js` and prints one line per metric:

```powershell
npm run demo:diff
```

A `null` value means the window has no data for that series, so the demo shows
`(no data)` instead of a fabricated zero delta.

The JSON shape mirrors the input object exactly: one field per metric input,
plus `days` and the two deploy-matching values used by the supporting rates.
