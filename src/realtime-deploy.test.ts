import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { LIVE_METRICS, type LiveMetricsSnapshot } from './metrics.ts';
import {
  createGithubDeployment,
  deploymentTriggerFromEnv,
  parseRepository,
  runRealtimeMetricsDeploy,
} from './realtime-deploy.ts';
import { SAMPLE_LIVE_INPUT } from './sample-input.ts';

interface CapturedRequest {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  body: any;
}

async function startMockGithub(options: { fail?: boolean } = {}) {
  const requests: CapturedRequest[] = [];
  const server = createServer((request, response) => {
    let raw = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      raw += chunk;
    });
    request.on('end', () => {
      const body = raw ? JSON.parse(raw) : null;
      requests.push({
        method: request.method ?? '',
        path: request.url ?? '',
        headers: request.headers,
        body,
      });
      response.setHeader('Content-Type', 'application/json');
      if (options.fail) {
        response.statusCode = 403;
        response.end(JSON.stringify({ message: 'Resource not accessible by integration' }));
        return;
      }
      if (request.url?.endsWith('/deployments')) {
        response.statusCode = 201;
        response.end(
          JSON.stringify({
            id: 42,
            url: 'https://api.github.com/repos/acme/lab/deployments/42',
            environment: body.environment,
            ref: body.ref,
          }),
        );
        return;
      }
      response.statusCode = 201;
      response.end(JSON.stringify({ id: 99, state: 'success' }));
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('mock server has no port');
  return {
    apiUrl: `http://127.0.0.1:${address.port}`,
    requests,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
}

test('parseRepository validates the owner/repo value', () => {
  assert.deepEqual(parseRepository('acme/lab'), { owner: 'acme', repo: 'lab' });
  assert.throws(() => parseRepository('acme'), /owner\/repo/);
  assert.throws(() => parseRepository('acme/lab/extra'), /owner\/repo/);
  assert.throws(() => parseRepository('/lab'), /owner\/repo/);
});

test('createGithubDeployment posts the deployment and a success status', async () => {
  const mock = await startMockGithub();
  try {
    const result = await createGithubDeployment({
      owner: 'acme',
      repo: 'lab',
      ref: 'abc123',
      environment: 'production',
      description: '15/15 live metrics',
      token: 'secret',
      logUrl: 'https://github.com/acme/lab/actions/runs/7',
      apiUrl: mock.apiUrl,
    });

    assert.deepEqual(result, {
      id: 42,
      url: 'https://api.github.com/repos/acme/lab/deployments/42',
      environment: 'production',
      ref: 'abc123',
      status: 'success',
    });
    assert.equal(mock.requests.length, 2);

    const [deployment, status] = mock.requests;
    assert.equal(deployment.method, 'POST');
    assert.equal(deployment.path, '/repos/acme/lab/deployments');
    assert.equal(deployment.headers.authorization, 'Bearer secret');
    assert.deepEqual(deployment.body, {
      ref: 'abc123',
      environment: 'production',
      description: '15/15 live metrics',
      auto_merge: false,
      required_contexts: [],
    });

    assert.equal(status.path, '/repos/acme/lab/deployments/42/statuses');
    assert.equal(status.body.state, 'success');
    assert.equal(status.body.environment, 'production');
    assert.equal(status.body.log_url, 'https://github.com/acme/lab/actions/runs/7');
    assert.equal(status.body.auto_inactive, false);
  } finally {
    await mock.close();
  }
});

test('createGithubDeployment reports GitHub API errors', async () => {
  const mock = await startMockGithub({ fail: true });
  try {
    await assert.rejects(
      createGithubDeployment({
        owner: 'acme',
        repo: 'lab',
        ref: 'abc123',
        environment: 'production',
        description: '15/15 live metrics',
        token: 'secret',
        apiUrl: mock.apiUrl,
      }),
      /GitHub API 403 Forbidden: .*Resource not accessible/,
    );
  } finally {
    await mock.close();
  }
});

test('deploymentTriggerFromEnv is opt-in and reads Actions variables', async () => {
  assert.equal(deploymentTriggerFromEnv({}), null);
  assert.equal(
    deploymentTriggerFromEnv({
      GITHUB_TOKEN: 'secret',
      GITHUB_REPOSITORY: 'acme/lab',
      GITHUB_SHA: 'abc123',
      DEPLOY_ENABLED: 'false',
    }),
    null,
  );

  const mock = await startMockGithub();
  try {
    const trigger = deploymentTriggerFromEnv({
      GITHUB_TOKEN: 'secret',
      GITHUB_REPOSITORY: 'acme/lab',
      GITHUB_SHA: 'abc123',
      GITHUB_EVENT_NAME: 'pull_request',
      GITHUB_API_URL: mock.apiUrl,
      GITHUB_SERVER_URL: 'https://github.com',
      GITHUB_RUN_ID: '77',
    });
    assert.ok(trigger);

    const result = await runRealtimeMetricsDeploy(SAMPLE_LIVE_INPUT, trigger);
    assert.equal(result.deploymentError, null);
    assert.equal(result.deployment?.environment, 'preview');

    const [deployment, status] = mock.requests;
    assert.equal(deployment.body.ref, 'abc123');
    assert.equal(status.body.log_url, 'https://github.com/acme/lab/actions/runs/77');
    assert.match(status.body.description, /15\/15 live metrics/);
  } finally {
    await mock.close();
  }
});

test('runRealtimeMetricsDeploy computes all fifteen metrics and triggers once', async () => {
  let calls = 0;
  let received: LiveMetricsSnapshot | null = null;

  const result = await runRealtimeMetricsDeploy(SAMPLE_LIVE_INPUT, async (snapshot) => {
    calls += 1;
    received = snapshot;
    return {
      id: 1,
      url: 'https://example.test/deployments/1',
      environment: 'production',
      ref: 'abc123',
      status: 'success',
    };
  });

  assert.equal(calls, 1);
  assert.equal(received, result.snapshot);
  assert.equal(LIVE_METRICS.length, 15);
  for (const metric of LIVE_METRICS) {
    assert.ok(metric.key in result.snapshot, `${metric.code} is missing`);
  }
  assert.equal(Object.keys(result.snapshot).length, 17);
  assert.equal(result.metricsLine.split(', ').length, 17);
  assert.match(result.metricsLine, /ai_adoption_pct=75/);
  assert.equal(result.deployment?.id, 1);
  assert.equal(result.deploymentError, null);
});

test('runRealtimeMetricsDeploy keeps the snapshot when the deploy fails', async () => {
  const result = await runRealtimeMetricsDeploy(SAMPLE_LIVE_INPUT, async () => {
    throw new Error('deploy unavailable');
  });

  assert.equal(result.deployment, null);
  assert.equal(result.deploymentError?.message, 'deploy unavailable');
  assert.equal(result.snapshot.adoptionPct, 75);
  assert.match(result.metricsLine, /ai_adoption_pct=75/);
});

test('runRealtimeMetricsDeploy skips the deploy when no trigger is configured', async () => {
  const result = await runRealtimeMetricsDeploy(SAMPLE_LIVE_INPUT, null);

  assert.equal(result.deployment, null);
  assert.equal(result.deploymentError, null);
  assert.equal(result.snapshot.mergedPrs, 7);
  assert.equal(Object.keys(result.snapshot).length, 17);
});
