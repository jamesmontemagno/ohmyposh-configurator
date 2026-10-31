import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import {
  captureSnapshot, fetchPages, isAuditEvent, predecessorId, predecessorName, repository,
} from './capture-theme-gallery.mjs';

const event = () => ({
  action: 'completed',
  repository: { full_name: repository, default_branch: 'main' },
  workflow_run: {
    id: 40259618890, name: predecessorName, workflow_id: predecessorId,
    path: '.github/workflows/weekly-segment-sync.lock.yml',
    repository: { full_name: repository }, head_repository: { full_name: repository },
    head_branch: 'main', event: 'schedule', status: 'completed', conclusion: 'failure', run_attempt: 1,
  },
});
const workflow = yaml.load(readFileSync(resolve('.github/workflows/generate-theme-previews.yml'), 'utf8'));
const evaluate = (job, name, payload, repo = repository) => Boolean(runInNewContext(
  workflow.jobs[job].if, { github: { event_name: name, event: payload, repository: repo } },
));

describe('actual preview workflow event and permission boundary', () => {
  const cases = [
    ['success', 'workflow_run', (e) => { e.workflow_run.conclusion = 'success'; }, true, false],
    ['failure', 'workflow_run', () => {}, true, false],
    ['cancelled', 'workflow_run', (e) => { e.workflow_run.conclusion = 'cancelled'; }, true, false],
    ['wrong payload repo', 'workflow_run', (e) => { e.repository.full_name = 'other/repo'; }, false, false],
    ['wrong default branch', 'workflow_run', (e) => { e.repository.default_branch = 'develop'; }, false, false],
    ['wrong predecessor repo', 'workflow_run', (e) => { e.workflow_run.repository.full_name = 'other/repo'; }, false, false],
    ['fork head', 'workflow_run', (e) => { e.workflow_run.head_repository.full_name = 'other/repo'; }, false, false],
    ['wrong branch', 'workflow_run', (e) => { e.workflow_run.head_branch = 'feature'; }, false, false],
    ['manual predecessor', 'workflow_run', (e) => { e.workflow_run.event = 'workflow_dispatch'; }, false, false],
    ['PR predecessor', 'workflow_run', (e) => { e.workflow_run.event = 'pull_request'; }, false, false],
    ['wrong ID', 'workflow_run', (e) => { e.workflow_run.workflow_id++; }, false, false],
    ['wrong path', 'workflow_run', (e) => { e.workflow_run.path = '.github/workflows/other.yml'; }, false, false],
    ['wrong name', 'workflow_run', (e) => { e.workflow_run.name = 'Other'; }, false, false],
    ['incomplete', 'workflow_run', (e) => { e.workflow_run.status = 'in_progress'; }, false, false],
    ['wrong action', 'workflow_run', (e) => { e.action = 'requested'; }, false, false],
    ['duplicate predecessor attempt', 'workflow_run', (e) => { e.workflow_run.run_attempt = 2; }, false, false],
    ['original push', 'push', () => {}, false, true],
    ['original manual', 'workflow_dispatch', () => {}, false, true],
    ['unsupported event', 'pull_request', () => {}, false, false],
  ];
  it.each(cases)('%s', (_label, name, change, audit, writer) => {
    const payload = event();
    change(payload);
    expect(isAuditEvent(name, payload, repository)).toBe(audit);
    expect(evaluate('audit', name, payload)).toBe(audit);
    expect(evaluate('generate', name, payload)).toBe(writer);
  });

  it('does not audit a fork even with a forged expected payload', () => {
    expect(isAuditEvent('workflow_run', event(), 'other/repo')).toBe(false);
    expect(evaluate('audit', 'workflow_run', event(), 'other/repo')).toBe(false);
    expect(evaluate('generate', 'workflow_run', event(), 'other/repo')).toBe(false);
  });

  it('keeps an exact duplicate completion read-only, while rerun attempts are skipped', () => {
    for (const payload of [event(), event()]) {
      expect(evaluate('audit', 'workflow_run', payload)).toBe(true);
      expect(evaluate('generate', 'workflow_run', payload)).toBe(false);
    }
  });

  it('keeps all write grants in the original writer and does not add a cron', () => {
    expect(workflow.permissions).toEqual({});
    expect(workflow.jobs.audit.permissions).toEqual({ contents: 'read', issues: 'read', 'pull-requests': 'read' });
    expect(workflow.jobs.generate.permissions).toEqual({ contents: 'write', 'pull-requests': 'write' });
    expect(workflow.on.schedule).toBeUndefined();
    expect(workflow.on.workflow_run).toEqual({ workflows: [predecessorName], types: ['completed'], branches: ['main'] });
    expect(workflow.on.push).toEqual({ branches: ['main'], paths: [
      'public/configs/samples/*.json', 'public/configs/community/*.json',
      'scripts/fetch-official-themes.mjs', 'scripts/generate-theme-previews.mjs', 'public/studio/segment_data.json',
    ] });
    expect(workflow.on).toHaveProperty('workflow_dispatch');
    expect(workflow.jobs.audit.concurrency).toEqual({
      group: 'gallery-audit-${{ github.event.workflow_run.id }}', 'cancel-in-progress': false,
    });
  });

  it('checks out only trusted default-branch code and pinned data without credentials or artifact downloads', () => {
    const steps = workflow.jobs.audit.steps;
    const checkouts = steps.filter((step) => step.uses?.startsWith('actions/checkout@'));
    expect(checkouts.map((step) => step.with)).toEqual([
      { repository, ref: '${{ github.sha }}', 'persist-credentials': false },
      { repository: 'JanDeDobbeleer/oh-my-posh', ref: '${{ steps.capture.outputs.upstream_ref }}',
        path: '.gallery-upstream', 'persist-credentials': false },
    ]);
    for (const step of steps.filter((step) => step.uses)) expect(step.uses).toMatch(/@[a-f0-9]{40}$/);
    expect(steps.some((step) => step.uses?.includes('download-artifact'))).toBe(false);
    expect(steps.filter((step) => step.env?.GH_TOKEN)).toHaveLength(1);
    expect(steps.filter((step) => step.run).every((step) =>
      !/git push|gh pr create|gh issue|generate-theme-previews\.mjs|OMP_BIN/.test(step.run))).toBe(true);
    expect(steps.at(-1).with['if-no-files-found']).toBe('error');
    expect(steps.at(-1).with.path).toBe('${{ runner.temp }}/gallery-audit.json');
  });
});

describe('paginated read-only capture', () => {
  it('collects all pages, including the empty terminator after exactly 100 items', async () => {
    const calls = [];
    const result = await fetchPages('repos/example/repo/issues?state=open', async (endpoint) => {
      calls.push(endpoint);
      return calls.length === 1 ? Array.from({ length: 100 }, (_, i) => ({ number: i + 1 })) : [];
    });
    expect(result.items).toHaveLength(100);
    expect(result).toMatchObject({ pages: 2, complete: true });
    expect(calls[1]).toContain('&per_page=100&page=2');
  });

  it('collects a non-empty final page', async () => {
    const result = await fetchPages('items', async (endpoint) => endpoint.endsWith('page=1') ?
      Array.from({ length: 100 }, (_, i) => ({ number: i + 1 })) : [{ number: 101 }]);
    expect(result.items.at(-1).number).toBe(101);
  });

  it('fails rather than returning an empty success on API errors or malformed pages', async () => {
    await expect(fetchPages('items', async () => { throw new Error('403 inaccessible'); })).rejects.toThrow('403');
    await expect(fetchPages('items', async () => ({ message: 'denied' }))).rejects.toThrow('Invalid page');
    await expect(fetchPages('items', async () => [{ number: 1 }, { number: 1 }])).rejects.toThrow('repeated item');
  });

  it('fails explicitly on moving pagination and on the bounded pagination limit', async () => {
    await expect(fetchPages('items', async () =>
      Array.from({ length: 100 }, (_, i) => ({ number: i + 1 })))).rejects.toThrow('repeated item on page 2');
    await expect(fetchPages('items', async (endpoint) => {
      const page = Number(new URL(`https://example.test/${endpoint}`).searchParams.get('page'));
      return Array.from({ length: 100 }, (_, i) => ({ number: page * 100 + i + 1 }));
    })).rejects.toThrow('Pagination exceeded');
  });

  it('captures complete read-only provenance at one upstream commit and refuses duplicates before fetching', async () => {
    const calls = [];
    const api = async (endpoint) => {
      calls.push(endpoint);
      return endpoint.endsWith('/commits/main') ? { sha: 'a'.repeat(40) } : [];
    };
    const snapshot = await captureSnapshot(event(), api);
    expect(snapshot).toMatchObject({
      upstream: { ref: 'a'.repeat(40) }, issues: { complete: true }, pulls: { complete: true },
      predecessor: { id: 40259618890, conclusion: 'failure' },
    });
    expect(calls).toHaveLength(3);
    const duplicate = event();
    duplicate.workflow_run.run_attempt = 2;
    await expect(captureSnapshot(duplicate, api)).rejects.toThrow('duplicate predecessor');
    expect(calls).toHaveLength(3);
    await expect(captureSnapshot(event(), async () => ({ sha: 'main' }))).rejects.toThrow('Invalid upstream');
  });
});
