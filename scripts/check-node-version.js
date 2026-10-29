#!/usr/bin/env node
/**
 * Fail fast when the running Node.js is older than the version in package.json.
 *
 * Usage:
 *   node scripts/check-node-version.js
 *
 * Exits 0 when the version is supported, 1 otherwise.
 */
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const required = String(pkg.engines?.node ?? '>=22.18.0').replace(/^[^\d]*/, '');
const current = process.versions.node;

function parts(version) {
  return version.split('.').map((part) => Number.parseInt(part, 10) || 0);
}

function compare(leftVersion, rightVersion) {
  const left = parts(leftVersion);
  const right = parts(rightVersion);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

if (compare(current, required) < 0) {
  console.error(`Node.js ${required} or newer is required; running ${current}.`);
  console.error('Install the version from .nvmrc, then retry.');
  process.exitCode = 1;
} else {
  console.log(`Node.js ${current} satisfies >=${required}.`);
}
