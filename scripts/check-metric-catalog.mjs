#!/usr/bin/env node
/**
 * Check that the M01-M15 catalogue stays in sync across its three homes:
 *
 * - LIVE_METRICS in src/metrics.ts
 * - the formula and snapshot-key tables in docs/metrics-catalog.md
 * - the metric list in README.md
 *
 * Run with `npm run check:catalog`. The script uses only Node built-ins and
 * exits non-zero with a readable list when anything drifts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIVE_METRICS } from '../src/metrics.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const expectedCodes = Array.from({ length: 15 }, (_, index) => `M${String(index + 1).padStart(2, '0')}`);
const errors = [];

function codesIn(text) {
  return [...text.matchAll(/^\|\s*(M\d{2})\s*\|/gm)].map((match) => match[1]);
}

function snapshotKeysIn(text) {
  return [...text.matchAll(/^\|\s*(M\d{2})\s*\|\s*`([^`]+)`\s*\|/gm)].map((match) => ({
    code: match[1],
    key: match[2],
  }));
}

// README: the fifteen-metric table must list every code once, in order.
const readme = read('README.md');
const readmeSection = readme.slice(readme.indexOf('## The fifteen metrics'));
const readmeCodes = codesIn(readmeSection);
if (readmeCodes.join(',') !== expectedCodes.join(',')) {
  errors.push(`README.md lists ${readmeCodes.length} metric codes: ${readmeCodes.join(', ') || '(none)'}`);
}

// docs/metrics-catalog.md: split the formula table from the snapshot-key table.
const catalog = read('docs/metrics-catalog.md');
const snapshotHeading = catalog.indexOf('## Snapshot keys');
if (snapshotHeading === -1) {
  errors.push('docs/metrics-catalog.md is missing the "## Snapshot keys" section');
} else {
  const formulaCodes = codesIn(catalog.slice(0, snapshotHeading));
  if (formulaCodes.join(',') !== expectedCodes.join(',')) {
    errors.push(`docs/metrics-catalog.md formula table lists: ${formulaCodes.join(', ') || '(none)'}`);
  }

  const documented = snapshotKeysIn(catalog.slice(snapshotHeading));
  const documentedKeys = new Map(documented.map(({ code, key }) => [code, key]));
  for (const metric of LIVE_METRICS) {
    if (!documentedKeys.has(metric.code)) {
      errors.push(`docs/metrics-catalog.md snapshot table is missing ${metric.code}`);
    } else if (documentedKeys.get(metric.code) !== metric.key) {
      errors.push(
        `docs/metrics-catalog.md maps ${metric.code} to "${documentedKeys.get(metric.code)}", expected "${metric.key}"`,
      );
    }
  }
}

// src/metrics.ts: LIVE_METRICS must expose M01-M15 once each with unique keys.
const liveCodes = LIVE_METRICS.map((metric) => metric.code);
if (liveCodes.join(',') !== expectedCodes.join(',')) {
  errors.push(`src/metrics.ts LIVE_METRICS lists: ${liveCodes.join(', ') || '(none)'}`);
}
const uniqueKeys = new Set(LIVE_METRICS.map((metric) => metric.key));
if (uniqueKeys.size !== LIVE_METRICS.length) {
  errors.push('src/metrics.ts LIVE_METRICS contains duplicate snapshot keys');
}

if (errors.length > 0) {
  console.error('Metric catalogue is out of sync:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`catalogue ok: ${LIVE_METRICS.length} metrics, ${uniqueKeys.size} snapshot keys`);
