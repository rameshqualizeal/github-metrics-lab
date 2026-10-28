/**
 * Realtime all-metrics snapshot + deployment trigger.
 *
 * One call:
 *   1. computes all fifteen release-1 metrics (M01-M15),
 *   2. formats the key=value line the telemetry collector consumes, and
 *   3. creates a GitHub deployment and marks it successful for the same
 *      commit, which fires the deployment webhooks used by M11 and M12.
 *
 * The deployment is opt-in: without `GITHUB_TOKEN` and `GITHUB_REPOSITORY`
 * the snapshot is still computed and the trigger is skipped. A failed
 * deployment never hides the metrics; the error is returned alongside the
 * complete snapshot so the caller can log both.
 */

import {
  buildLiveMetricsSnapshot,
  formatLiveMetricsLine,
  type LiveMetricsInput,
  type LiveMetricsSnapshot,
} from './metrics.ts';

const DEFAULT_API_URL = 'https://api.github.com';

export interface DeploymentRequest {
  owner: string;
  repo: string;
  ref: string;
  environment: string;
  description: string;
  token: string;
  logUrl?: string;
  apiUrl?: string;
}

export interface DeploymentResult {
  id: number;
  url: string;
  environment: string;
  ref: string;
  status: 'success';
}

export interface RealtimeMetricsResult {
  snapshot: LiveMetricsSnapshot;
  metricsLine: string;
  deployment: DeploymentResult | null;
  deploymentError: Error | null;
}

/** Called with the finished snapshot; returns null when no deploy is wanted. */
export type DeploymentTrigger = (
  snapshot: LiveMetricsSnapshot,
  metricsLine: string,
) => Promise<DeploymentResult | null>;

/** Split the `owner/repo` value used by GitHub Actions. */
export function parseRepository(fullName: string): { owner: string; repo: string } {
  const parts = fullName.trim().split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`GITHUB_REPOSITORY must be owner/repo, got "${fullName}"`);
  }
  return { owner: parts[0], repo: parts[1] };
}

function deploymentDescription(snapshot: LiveMetricsSnapshot): string {
  const text =
    `15/15 live metrics · ${snapshot.mergedPrs} merged PRs · ` +
    `${snapshot.aiAuthoredPct}% AI-authored · ${snapshot.deployFrequencyPerWeek} deploys/wk`;
  return text.length <= 140 ? text : `${text.slice(0, 137)}...`;
}

async function githubJson<T>(url: string, token: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'github-metrics-lab',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

/** Create a deployment and immediately mark it successful. */
export async function createGithubDeployment(request: DeploymentRequest): Promise<DeploymentResult> {
  const apiUrl = (request.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, '');
  const repoUrl =
    `${apiUrl}/repos/${encodeURIComponent(request.owner)}/${encodeURIComponent(request.repo)}`;

  const deployment = await githubJson<{
    id: number;
    url: string;
    environment?: string;
    ref?: string;
  }>(`${repoUrl}/deployments`, request.token, {
    ref: request.ref,
    environment: request.environment,
    description: request.description,
    auto_merge: false,
    required_contexts: [],
  });

  await githubJson(`${repoUrl}/deployments/${deployment.id}/statuses`, request.token, {
    state: 'success',
    environment: request.environment,
    description: request.description,
    log_url: request.logUrl,
    auto_inactive: false,
  });

  return {
    id: deployment.id,
    url: deployment.url,
    environment: deployment.environment ?? request.environment,
    ref: deployment.ref ?? request.ref,
    status: 'success',
  };
}

/**
 * Build the trigger used by the workflow from the standard GitHub Actions
 * environment. Returns null when the deploy is disabled or unconfigured.
 */
export function deploymentTriggerFromEnv(
  env: Record<string, string | undefined> = process.env,
): DeploymentTrigger | null {
  if (env.DEPLOY_ENABLED === 'false') return null;
  const token = env.GITHUB_TOKEN ?? env.GH_TOKEN;
  const repository = env.GITHUB_REPOSITORY;
  if (!token || !repository) return null;

  const { owner, repo } = parseRepository(repository);
  const ref = env.GITHUB_SHA ?? env.GITHUB_REF_NAME;
  if (!ref) return null;

  const environment =
    env.DEPLOY_ENVIRONMENT ??
    (env.GITHUB_EVENT_NAME === 'pull_request' ? 'preview' : 'production');
  const logUrl =
    env.GITHUB_SERVER_URL && env.GITHUB_RUN_ID
      ? `${env.GITHUB_SERVER_URL}/${repository}/actions/runs/${env.GITHUB_RUN_ID}`
      : undefined;

  return (snapshot) =>
    createGithubDeployment({
      owner,
      repo,
      ref,
      environment,
      description: deploymentDescription(snapshot),
      token,
      logUrl,
      apiUrl: env.GITHUB_API_URL ?? DEFAULT_API_URL,
    });
}

/**
 * Compute the full snapshot and run the deployment trigger in one pass.
 *
 * The snapshot is always returned, even when the deployment fails. The
 * trigger is optional so local runs and tests can skip the network.
 */
export async function runRealtimeMetricsDeploy(
  input: LiveMetricsInput,
  trigger: DeploymentTrigger | null,
): Promise<RealtimeMetricsResult> {
  const snapshot = buildLiveMetricsSnapshot(input);
  const metricsLine = formatLiveMetricsLine(snapshot);

  let deployment: DeploymentResult | null = null;
  let deploymentError: Error | null = null;
  if (trigger) {
    try {
      deployment = await trigger(snapshot, metricsLine);
    } catch (error) {
      deploymentError = error instanceof Error ? error : new Error(String(error));
    }
  }

  return { snapshot, metricsLine, deployment, deploymentError };
}
