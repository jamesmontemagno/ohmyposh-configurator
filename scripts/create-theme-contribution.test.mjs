import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { createSchemaValidator } from './audit-theme-gallery.mjs';
import { repository } from './capture-theme-gallery.mjs';
import {
  buildContribution, contributionEvent, issueFingerprint, publishContribution, reviewSubmission,
} from './create-theme-contribution.mjs';

const baseSha = 'a'.repeat(40);
const body = (config = { $schema: 'https://example.invalid/never-fetch', blocks: [{}] }) =>
  `## Theme Details\n- **Theme Name:** New Theme\n- **Author:** Person\n- **Description:** Sample\n- **Icon:** misc-star\n- **Tags:** dark, Dark, git\n\n## Configuration\n\`\`\`json\n${JSON.stringify(config)}\n\`\`\`\n\n## License Confirmation\n- [x] I confirm this configuration is my original work or is properly attributed, and I contribute it under the MIT License.`;
const issue = () => ({
  number: 105, state: 'open', title: '[Theme] New Theme', body: body(),
  labels: [{ name: 'theme:submission' }, { name: 'theme:approved' }],
});
const event = () => ({
  action: 'labeled', label: { name: 'theme:approved' }, issue: issue(),
  repository: { full_name: repository, default_branch: 'main' },
});
const validation = {
  iconIds: new Set(['misc-star']),
  validateSchema: createSchemaValidator({
    $schema: 'https://json-schema.org/draft/2020-12/schema', type: 'object',
    properties: { blocks: { type: 'array', items: { type: 'object',
      properties: { foreground: { type: 'string', minLength: 1 } } } } },
  }),
};
const workflow = yaml.load(readFileSync(resolve('.github/workflows/create-theme-contribution-pr.yml'), 'utf8'));
const allowed = (name, payload, repo = repository, ref = 'refs/heads/main') => Boolean(runInNewContext(
  workflow.jobs.contribution.if, { github: { event_name: name, event: payload, repository: repo, ref } },
));

function mockApi({ current = issue(), permission = 'write', pulls = [], sha = baseSha, refs = [],
  failAt, mutateAtFinalCheck } = {}) {
  const calls = [];
  let issueReads = 0;
  const api = async (endpoint, method = 'GET', data) => {
    calls.push({ endpoint, method, data });
    if (endpoint === failAt) throw new Error('403 denied');
    if (endpoint.includes('/collaborators/')) return { permission };
    if (endpoint.endsWith('/commits/main')) return { sha };
    if (endpoint.endsWith('/issues/105')) {
      issueReads++;
      return issueReads > 1 && mutateAtFinalCheck ? mutateAtFinalCheck : current;
    }
    if (endpoint.includes('/pulls?')) return pulls;
    if (endpoint.includes('/matching-refs/')) return refs;
    if (endpoint.includes('/git/commits/') && method === 'GET') return { tree: { sha: 'b'.repeat(40) } };
    if (endpoint.endsWith('/pulls') && method === 'POST') return {
      number: 200, draft: true, html_url: `https://github.com/${repository}/pull/200`,
    };
    if (method === 'POST') return { sha: 'c'.repeat(40) };
    throw new Error(`Unexpected API: ${endpoint}`);
  };
  return { calls, api };
}
const context = (api) => ({
  eventName: 'issues', event: event(), repo: repository, ref: 'refs/heads/main',
  actor: 'maintainer', baseSha, api,
});
const plan = () => ({
  ...buildContribution(issue(), { version: '1', configs: [] }, validation),
  number: 105, baseSha, issueHash: issueFingerprint(issue()), schemaHash: 'd'.repeat(64),
});

describe('approval and retry boundaries', () => {
  it('accepts only main-branch approval events or explicit retries, not arbitrary labels', () => {
    expect(contributionEvent('issues', event(), repository, 'refs/heads/main')).toBe(105);
    expect(allowed('issues', event())).toBe(true);
    for (const change of [
      { label: { name: 'theme:submission' } }, { action: 'edited' }, { issue: { ...issue(), pull_request: {} } },
      { issue: { ...issue(), state: 'closed' } },
    ]) {
      expect(() => contributionEvent('issues', { ...event(), ...change }, repository, 'refs/heads/main')).toThrow();
      expect(allowed('issues', { ...event(), ...change })).toBe(false);
    }
    expect(allowed('issues', event(), 'other/repo')).toBe(false);
    expect(allowed('workflow_dispatch', event(), repository, 'refs/heads/feature')).toBe(false);
    expect(allowed('workflow_run', event())).toBe(false);
    for (const raw of ['', '0', '-1', '105;rm', '../105', '1.2', '9007199254740992']) {
      expect(() => contributionEvent('workflow_dispatch', { ...event(), inputs: { issue_number: raw } },
        repository, 'refs/heads/main')).toThrow('Invalid');
    }
    expect(contributionEvent('workflow_dispatch', { ...event(), inputs: { issue_number: '105' } },
      repository, 'refs/heads/main')).toBe(105);
  });

  it('requires maintainer permission before fetching or changing submissions', async () => {
    for (const permission of ['read', 'triage', 'none']) {
      const mock = mockApi({ permission });
      await expect(reviewSubmission(context(mock.api))).rejects.toThrow('actor must');
      expect(mock.calls).toHaveLength(1);
      expect(mock.calls.every((call) => call.method === 'GET')).toBe(true);
    }
    for (const permission of ['write', 'maintain', 'admin']) {
      await expect(reviewSubmission(context(mockApi({ permission }).api))).resolves.toMatchObject({ existing: [] });
    }
  });

  it('rechecks live approval, issue type, contents and main before preparing', async () => {
    for (const current of [
      { ...issue(), labels: [{ name: 'theme:submission' }] },
      { ...issue(), labels: [{ name: 'theme:approved' }] },
      { ...issue(), state: 'closed' }, { ...issue(), pull_request: {} },
      { ...issue(), body: `${body()}\nEdited` },
    ]) await expect(reviewSubmission(context(mockApi({ current }).api))).rejects.toThrow();
    await expect(reviewSubmission(context(mockApi({ sha: 'e'.repeat(40) }).api))).rejects.toThrow('Main changed');
    await expect(reviewSubmission(context(mockApi({
      failAt: `repos/${repository}/collaborators/maintainer/permission`,
    }).api))).rejects.toThrow('403');
  });

  it('reports an existing PR without writes', async () => {
    const mock = mockApi({ pulls: [{ number: 200, body: 'Source #105', title: 'Theme' }] });
    const result = await publishContribution(plan(), context(mock.api));
    expect(result).toEqual({ status: 'existing-pr', number: 200 });
    expect(mock.calls.every((call) => call.method === 'GET')).toBe(true);
  });

  it('manual retries do not grant approval or trust stale issue content', async () => {
    const mock = mockApi({ current: { ...issue(), body: `${body()}\nUpdated` } });
    const retry = { ...context(mock.api), eventName: 'workflow_dispatch', event: {
      ...event(), inputs: { issue_number: '105' },
    } };
    await expect(reviewSubmission(retry)).resolves.toMatchObject({ existing: [] });
    await expect(publishContribution(plan(), retry)).rejects.toThrow('changed after validation');
  });
});

describe('bounded config generation and publication', () => {
  it('preserves manifest fields, sorts IDs, de-duplicates tags and emits only pure JSON', () => {
    const result = buildContribution(issue(), { version: '1', lastUpdated: 'keep',
      configs: [{ id: 'z-theme', file: 'z-theme.json' }] }, validation);
    expect(result.id).toBe('new-theme');
    expect(result.files.map((file) => file.path)).toEqual([
      'public/configs/community/new-theme.json', 'public/configs/community/manifest.json',
    ]);
    const manifest = JSON.parse(result.files[1].content);
    expect(manifest).toMatchObject({ version: '1', lastUpdated: 'keep' });
    expect(manifest.configs.map((entry) => entry.id)).toEqual(['new-theme', 'z-theme']);
    expect(manifest.configs[0].tags).toEqual(['dark', 'git']);
    expect(JSON.parse(result.files[0].content)).toEqual({ $schema: 'https://example.invalid/never-fetch', blocks: [{}] });
    expect(result.files.every((file) => file.content.endsWith('\n'))).toBe(true);
  });

  it('rejects invalid schema, metadata, JSON and duplicate IDs without generating files', () => {
    for (const content of [
      body({ $schema: 'unused', blocks: [{ foreground: '' }] }),
      body().replace('misc-star', 'unknown'), body().replace('[x]', '[ ]'),
      body().replace('"blocks"', 'broken-json'), body({ $schema: 'unused', blocks: [{}], id: 'wrapper' }),
    ]) expect(() => buildContribution({ ...issue(), body: content }, { configs: [] }, validation)).toThrow('needs correction');
    expect(() => buildContribution(issue(), { configs: [{ id: 'new-theme', file: 'new-theme.json' }] }, validation))
      .toThrow('already exists');
  });

  it('never executes submitted templates or interpolates metadata into commands', () => {
    const content = body({ $schema: 'unused', blocks: [{ template: '{{ exec "do-not-run" }}' }] })
      .replace('**Theme Name:** New Theme', '**Theme Name:** $(touch /tmp/no) Theme');
    const generated = buildContribution({ ...issue(), body: content }, { configs: [] }, validation);
    expect(generated.id).toBe('touch-tmp-no-theme');
    expect(generated.files[0].content).toContain('do-not-run');
    expect(JSON.parse(generated.files[1].content).configs[0].name).toContain('$(touch');
  });

  it('publishes exactly two blobs, one branch and one draft PR, never a label/merge/issue mutation', async () => {
    const mock = mockApi();
    const result = await publishContribution(plan(), context(mock.api));
    expect(result.status).toBe('created');
    const writes = mock.calls.filter((call) => call.method !== 'GET');
    expect(writes).toHaveLength(6);
    expect(writes.filter((call) => call.endpoint.endsWith('/git/blobs'))).toHaveLength(2);
    const tree = writes.find((call) => call.endpoint.endsWith('/git/trees')).data;
    expect(tree.tree.map((file) => file.path)).toEqual(plan().files.map((file) => file.path));
    expect(writes.find((call) => call.endpoint.endsWith('/git/refs')).data.ref)
      .toBe('refs/heads/automation/theme-submission-105');
    const pr = writes.at(-1).data;
    expect(pr).toMatchObject({ draft: true, base: 'main', head: 'automation/theme-submission-105' });
    expect(pr.body).toContain('/issues/105');
    expect(pr.body).not.toMatch(/closes|fixes|resolves/i);
    expect(writes.some((call) => /\/issues\/|\/labels|\/merge|\/dispatches/.test(call.endpoint))).toBe(false);
  });

  it('does not overwrite an orphaned branch or retry uncertain writes silently', async () => {
    const mock = mockApi({ refs: [{ ref: 'refs/heads/automation/theme-submission-105' }] });
    await expect(publishContribution(plan(), context(mock.api))).rejects.toThrow('partial publication');
    expect(mock.calls.every((call) => call.method === 'GET')).toBe(true);
    const denied = mockApi({ failAt: `repos/${repository}/pulls` });
    await expect(publishContribution(plan(), context(denied.api))).rejects.toThrow('403');
    expect(denied.calls.filter((call) => call.endpoint.endsWith('/git/refs'))).toHaveLength(1);
  });

  it('surfaces malformed write responses rather than reporting successful publication', async () => {
    const mock = mockApi();
    const api = async (endpoint, method, data) => endpoint.endsWith('/git/blobs') ? {} :
      mock.api(endpoint, method, data);
    await expect(publishContribution(plan(), context(api))).rejects.toThrow('invalid Git object SHA');
    expect(mock.calls.some((call) => call.method === 'POST' && call.endpoint.endsWith('/git/refs'))).toBe(false);
  });

  it('fails before branch creation if approval changes during publication', async () => {
    const mock = mockApi({ mutateAtFinalCheck: { ...issue(), labels: [{ name: 'theme:submission' }] } });
    await expect(publishContribution(plan(), context(mock.api))).rejects.toThrow('human-applied');
    expect(mock.calls.some((call) => call.method === 'POST' && call.endpoint.endsWith('/git/refs'))).toBe(false);
  });

  it('rejects path traversal, oversized patches and extra files before any write', async () => {
    for (const tamper of [
      (p) => { p.id = '../../escape'; },
      (p) => { p.files[0].path = 'package.json'; },
      (p) => { p.files.push({ path: 'README.md', content: 'unwanted' }); },
      (p) => { p.files[0].content = 'x'.repeat(1024 * 1024); },
    ]) {
      const p = plan();
      tamper(p);
      const mock = mockApi();
      await expect(publishContribution(p, context(mock.api))).rejects.toThrow('bounded');
      expect(mock.calls.every((call) => call.method === 'GET')).toBe(true);
    }
  });
});

describe('replacement workflow surface', () => {
  it('has a single serialized writer, no model/compiler dependency and no automatic approvals', () => {
    expect(workflow.permissions).toEqual({});
    expect(workflow.concurrency).toEqual({ group: 'community-theme-manifest-writer', 'cancel-in-progress': false });
    expect(workflow.jobs.contribution.permissions).toEqual({ contents: 'write', issues: 'read', 'pull-requests': 'write' });
    expect(workflow.on).toEqual({
      issues: { types: ['labeled'] },
      workflow_dispatch: { inputs: { issue_number: {
        description: 'Already approved submission issue to retry', required: true, type: 'string',
      } } },
    });
    const steps = workflow.jobs.contribution.steps;
    expect(steps.filter((step) => step.uses).every((step) => /@[a-f0-9]{40}$/.test(step.uses))).toBe(true);
    expect(steps.filter((step) => step.uses?.startsWith('actions/checkout'))
      .every((step) => step.with['persist-credentials'] === false)).toBe(true);
    expect(steps.find((step) => step.with?.repository === 'JanDeDobbeleer/oh-my-posh').with.ref)
      .toBe('b4d54a5cb40b1c37868fb5a9ace380cb2b6a9e99');
    expect(steps.find((step) => step.name.includes('Recheck')).if).toBe("steps.prepare.outputs.prepared == 'true'");
    expect(steps.find((step) => step.name.includes('Recheck')).env.THEME_ACTOR).toBe('${{ github.triggering_actor }}');
    expect(JSON.stringify(workflow)).not.toMatch(/gh-aw|model|schedule|generate-theme-previews/);
  });
});
