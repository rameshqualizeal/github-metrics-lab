// Print CI/CD metrics for this repository from the GitHub Actions API.
// Usage: GITHUB_TOKEN=... node scripts/cicd-metrics-report.mjs owner/repo
import { summarizeRuns } from '../src/cicd-metrics.js';

const repo = process.argv[2] ?? process.env.GITHUB_REPOSITORY;
if (!repo) throw new Error('Pass owner/repo or set GITHUB_REPOSITORY');
const headers = { Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
const res = await fetch(`https://api.github.com/repos/${repo}/actions/runs?per_page=100&status=completed`, { headers });
if (!res.ok) throw new Error(`GitHub API ${res.status}`);
const { workflow_runs: runs } = await res.json();
const summary = summarizeRuns(runs.map(r => ({
  conclusion: r.conclusion,
  durationSeconds: (Date.parse(r.updated_at) - Date.parse(r.run_started_at)) / 1000,
})));
console.log(JSON.stringify(summary, null, 2));
