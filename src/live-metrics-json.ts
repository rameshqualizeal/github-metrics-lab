/**
 * Demo: print the live metrics snapshot as JSON.
 *
 * Run with `npm run demo:json`. Use this when a pipeline needs structured
 * output instead of the human-readable table from `demo:live`.
 */
import { buildLiveMetricsSnapshot } from './metrics.ts';
import { SAMPLE_LIVE_INPUT } from './sample-input.ts';

console.log(JSON.stringify(buildLiveMetricsSnapshot(SAMPLE_LIVE_INPUT), null, 2));
