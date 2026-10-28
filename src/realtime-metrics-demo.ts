/**
 * Demo: compute all fifteen metrics and trigger the deployment in one run.
 *
 * Local runs print the full snapshot and skip the deployment. In GitHub
 * Actions the workflow supplies GITHUB_TOKEN, GITHUB_REPOSITORY and
 * GITHUB_SHA, so the same command also creates a deployment and a success
 * status for the commit that produced the metrics.
 *
 * Run with `npm run demo:realtime`.
 */
import { LIVE_METRICS } from './metrics.ts';
import { deploymentTriggerFromEnv, runRealtimeMetricsDeploy } from './realtime-deploy.ts';
import { SAMPLE_LIVE_INPUT } from './sample-input.ts';

const result = await runRealtimeMetricsDeploy(SAMPLE_LIVE_INPUT, deploymentTriggerFromEnv());

console.log(`Realtime window: rolling 60 minutes · ${new Date().toISOString()}`);
for (const metric of LIVE_METRICS) {
  console.log(`${metric.code}  ${metric.label.padEnd(26)} ${result.snapshot[metric.key]} ${metric.unit}`);
}
console.log(result.metricsLine);

if (result.deployment) {
  console.log(
    `deployment=created id=${result.deployment.id} ` +
      `environment=${result.deployment.environment} ref=${result.deployment.ref}`,
  );
} else if (result.deploymentError) {
  console.error(`deployment=failed ${result.deploymentError.message}`);
  process.exitCode = 1;
} else {
  console.log(
    'deployment=skipped (set GITHUB_TOKEN and GITHUB_REPOSITORY, or run in GitHub Actions)',
  );
}
