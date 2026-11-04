import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiMetrics } from './api-metrics.js';

test('empty tracker reports zeros', () => {
  assert.deepEqual(new ApiMetrics().snapshot(), {
    totalRequests: 0, successful2xx: 0, clientErrors4xx: 0, serverErrors5xx: 0, avgResponseMs: 0,
  });
});

test('counts requests by status class and averages response time', () => {
  const m = new ApiMetrics();
  m.record(200, 100);
  m.record(201, 200);
  m.record(404, 50);
  m.record(500, 150);
  assert.deepEqual(m.snapshot(), {
    totalRequests: 4, successful2xx: 2, clientErrors4xx: 1, serverErrors5xx: 1, avgResponseMs: 125,
  });
});
