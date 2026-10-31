import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const repository = 'jamesmontemagno/ohmyposh-configurator';
export const upstreamRepository = 'JanDeDobbeleer/oh-my-posh';
export const predecessorName = 'Weekly Oh My Posh Segment Synchronization';
export const predecessorId = 325089338;

export function isAuditEvent(eventName, event, currentRepository) {
  const run = event.workflow_run;
  return eventName === 'workflow_run' && currentRepository === repository &&
    event.action === 'completed' && event.repository?.full_name === repository &&
    event.repository?.default_branch === 'main' &&
    run?.repository?.full_name === repository && run?.head_repository?.full_name === repository &&
    run?.head_branch === 'main' && run?.event === 'schedule' && run?.status === 'completed' &&
    run?.name === predecessorName && run?.workflow_id === predecessorId &&
    run?.path === '.github/workflows/weekly-segment-sync.lock.yml' && run?.run_attempt === 1;
}

export function githubApi(endpoint) {
  return JSON.parse(execFileSync('gh', ['api', '--method', 'GET', endpoint], {
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }));
}

export async function fetchPages(endpoint, api = githubApi) {
  const items = [];
  const seen = new Set();
  for (let page = 1; page <= 100; page++) {
    const rows = await api(`${endpoint}${endpoint.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    if (!Array.isArray(rows) || rows.length > 100) throw new Error(`Invalid page ${page}: ${endpoint}`);
    for (const row of rows) {
      if (!Number.isSafeInteger(row.number) || row.number <= 0 || seen.has(row.number)) {
        throw new Error(`Missing or repeated item on page ${page}: ${endpoint}; recapture the snapshot`);
      }
      seen.add(row.number);
      items.push(row);
    }
    if (rows.length < 100) return { items, pages: page, complete: true, endpoint };
  }
  throw new Error(`Pagination exceeded 100 pages: ${endpoint}; no complete report produced`);
}

export async function captureSnapshot(event, api = githubApi) {
  if (!isAuditEvent('workflow_run', event, repository)) throw new Error('Untrusted or duplicate predecessor event');
  if (!Number.isSafeInteger(event.workflow_run.id) || event.workflow_run.id <= 0 ||
    typeof event.workflow_run.conclusion !== 'string' || !event.workflow_run.conclusion) {
    throw new Error('Missing completed predecessor identity or conclusion');
  }
  const startedAt = new Date().toISOString();
  const commit = await api(`repos/${upstreamRepository}/commits/main`);
  if (!/^[a-f0-9]{40}$/.test(commit.sha ?? '')) throw new Error('Invalid upstream commit SHA');
  const [issues, pulls] = await Promise.all([
    fetchPages(`repos/${repository}/issues?state=open&labels=theme%3Asubmission&sort=created&direction=asc`, api),
    fetchPages(`repos/${repository}/pulls?state=open&sort=created&direction=asc`, api),
  ]);
  return {
    schemaVersion: 1, repository, startedAt, capturedAt: new Date().toISOString(),
    upstream: { repository: upstreamRepository, ref: commit.sha },
    predecessor: {
      id: event.workflow_run.id, attempt: event.workflow_run.run_attempt,
      url: `https://github.com/${repository}/actions/runs/${event.workflow_run.id}`,
      conclusion: event.workflow_run.conclusion,
    },
    issues, pulls,
  };
}

async function main() {
  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
  if (!isAuditEvent(process.env.GITHUB_EVENT_NAME, event, process.env.GITHUB_REPOSITORY)) {
    throw new Error('Untrusted or duplicate predecessor event');
  }
  process.stdout.write(`${JSON.stringify(await captureSnapshot(event), null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
