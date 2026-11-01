import { execFileSync } from 'node:child_process';
import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  createSchemaValidator, findSubmissionPullRequests, sha256, validateSubmission,
} from './audit-theme-gallery.mjs';
import { fetchPages, repository } from './capture-theme-gallery.mjs';

export const schemaRef = 'b4d54a5cb40b1c37868fb5a9ace380cb2b6a9e99';
const manifestPath = 'public/configs/community/manifest.json';

function requireSha(value) {
  if (!/^[a-f0-9]{40}$/.test(value ?? '')) throw new Error('GitHub returned an invalid Git object SHA');
  return value;
}

export function contributionEvent(eventName, event, repo, ref) {
  if (repo !== repository || event.repository?.full_name !== repository ||
    event.repository?.default_branch !== 'main' || ref !== 'refs/heads/main') {
    throw new Error('Expected this repository and trusted default main branch');
  }
  const raw = eventName === 'workflow_dispatch' ? event.inputs?.issue_number : event.issue?.number;
  if (eventName !== 'workflow_dispatch' && !(eventName === 'issues' && event.action === 'labeled' &&
    event.label?.name === 'theme:approved' && !event.issue?.pull_request && event.issue?.state === 'open')) {
    throw new Error('Expected a human approval label event or explicit approved-issue retry');
  }
  if (!/^[1-9]\d*$/.test(String(raw)) || !Number.isSafeInteger(Number(raw))) {
    throw new Error('Invalid submission issue number');
  }
  return Number(raw);
}

export function issueFingerprint(issue) {
  return sha256(JSON.stringify([
    issue.number, issue.state, issue.title, issue.body,
    issue.labels.map(({ name }) => name).sort(),
  ]));
}

function requireApproved(issue, number) {
  if (issue.number !== number || issue.pull_request || issue.state !== 'open' ||
    typeof issue.body !== 'string' || !Array.isArray(issue.labels) ||
    !['theme:submission', 'theme:approved'].every((name) => issue.labels.some((label) => label.name === name))) {
    throw new Error('Issue must be an open theme:submission with a human-applied theme:approved label');
  }
}

async function requireMaintainer(api, actor) {
  if (typeof actor !== 'string' || !/^[a-z0-9-]+(?:\[bot\])?$/i.test(actor)) throw new Error('Missing valid actor');
  const result = await api(`repos/${repository}/collaborators/${encodeURIComponent(actor)}/permission`);
  if (!['admin', 'maintain', 'write'].includes(result.permission)) {
    throw new Error('Approval/retry actor must have repository write, maintain or admin permission');
  }
}

export async function reviewSubmission({ eventName, event, repo, ref, actor, baseSha, api }) {
  const number = contributionEvent(eventName, event, repo, ref);
  await requireMaintainer(api, actor);
  const main = await api(`repos/${repository}/commits/main`);
  if (main.sha !== baseSha || !/^[a-f0-9]{40}$/.test(baseSha ?? '')) {
    throw new Error('Main changed; retry the approved issue from the current main revision');
  }
  const issue = await api(`repos/${repository}/issues/${number}`);
  requireApproved(issue, number);
  if (eventName === 'issues' && issueFingerprint(issue) !== issueFingerprint(event.issue)) {
    throw new Error('Submission changed since approval event; review and reapply approval or retry explicitly');
  }
  const pulls = await fetchPages(`repos/${repository}/pulls?state=open&sort=created&direction=asc`, api);
  const existing = findSubmissionPullRequests(pulls.items, number);
  return { issue, existing, baseSha };
}

export function buildContribution(issue, manifest, options) {
  if (!Array.isArray(manifest.configs)) throw new Error('Community manifest requires a configs array');
  const validation = validateSubmission(issue.body, {
    ...options, communityEntries: manifest.configs, includeContent: true,
  });
  if (validation.metadata.status !== 'valid' || validation.schema.status !== 'valid') {
    throw new Error(`Submission needs correction:\n${JSON.stringify({
      metadata: validation.metadata.errors, schema: validation.schema.errors,
    }, null, 2)}`);
  }
  const { id, details, configuration } = validation;
  if (id.length > 100) throw new Error('Derived theme ID exceeds 100 characters');
  const tags = [];
  const seen = new Set();
  for (const tag of details.Tags.split(',').map((value) => value.trim()).filter(Boolean)) {
    if (!seen.has(tag.toLowerCase())) tags.push(tag);
    seen.add(tag.toLowerCase());
  }
  const entry = {
    id, name: details['Theme Name'], description: details.Description,
    icon: details.Icon, author: details.Author, tags, file: `${id}.json`,
  };
  const configs = [...manifest.configs, entry].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  return {
    id,
    files: [
      { path: `public/configs/community/${id}.json`, content: `${JSON.stringify(configuration, null, 2)}\n` },
      { path: manifestPath, content: `${JSON.stringify({ ...manifest, configs }, null, 2)}\n` },
    ],
  };
}

export async function publishContribution(plan, context) {
  const { api } = context;
  const review = await reviewSubmission({ ...context, baseSha: plan.baseSha });
  if (review.existing.length) return { status: 'existing-pr', number: review.existing[0].number };
  if (issueFingerprint(review.issue) !== plan.issueHash || review.issue.number !== plan.number) {
    throw new Error('Approval or submission content changed after validation; no PR published');
  }
  const expectedPaths = [`public/configs/community/${plan.id}.json`, manifestPath];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plan.id) || plan.id.length > 100 ||
    plan.files.length !== 2 || plan.files.some((file, index) =>
      file.path !== expectedPaths[index] || typeof file.content !== 'string') ||
    Buffer.byteLength(JSON.stringify(plan.files)) > 1024 * 1024) {
    throw new Error('Patch must contain exactly the bounded community config and manifest');
  }
  const branch = `automation/theme-submission-${plan.number}`;
  const refs = await api(`repos/${repository}/git/matching-refs/heads/${branch}`);
  if (!Array.isArray(refs)) throw new Error('Invalid branch lookup response');
  if (refs.some((item) => item.ref === `refs/heads/${branch}`)) {
    throw new Error('Submission branch already exists without an open PR; inspect partial publication before retrying');
  }
  const base = await api(`repos/${repository}/git/commits/${plan.baseSha}`);
  const tree = [];
  for (const file of plan.files) {
    const blob = await api(`repos/${repository}/git/blobs`, 'POST', { content: file.content, encoding: 'utf-8' });
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: requireSha(blob.sha) });
  }
  const createdTree = await api(`repos/${repository}/git/trees`, 'POST', { base_tree: requireSha(base.tree?.sha), tree });
  const commit = await api(`repos/${repository}/git/commits`, 'POST', {
    message: `feat: add community theme ${plan.id}\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`,
    tree: requireSha(createdTree.sha), parents: [plan.baseSha],
  });
  // Recheck immediately before publishing a branch; leave partial failures explicit.
  const finalReview = await reviewSubmission({ ...context, baseSha: plan.baseSha });
  if (finalReview.existing.length || issueFingerprint(finalReview.issue) !== plan.issueHash) {
    throw new Error('Submission, main or PR state changed during publication; no branch created');
  }
  await api(`repos/${repository}/git/refs`, 'POST', { ref: `refs/heads/${branch}`, sha: requireSha(commit.sha) });
  const pr = await api(`repos/${repository}/pulls`, 'POST', {
    title: `feat: add community theme ${plan.id}`, head: branch, base: 'main', draft: true,
    body: `Source: https://github.com/${repository}/issues/${plan.number}\n\n` +
      `Human-approved submission; pinned-schema and repository validation passed. No templates rendered.\n` +
      `Schema ref: ${schemaRef}\nSchema hash: ${plan.schemaHash}\nSubmission hash: ${plan.issueHash}\n\n` +
      'Do not merge without reviewing the source and running required checks. The issue is not closed automatically.',
  });
  if (!Number.isSafeInteger(pr.number) || pr.number <= 0 || pr.draft !== true ||
    pr.html_url !== `https://github.com/${repository}/pull/${pr.number}`) {
    throw new Error('Unexpected PR creation response; inspect remote publication before retrying');
  }
  return { status: 'created', url: pr.html_url, number: pr.number };
}

function api(endpoint, method = 'GET', data) {
  const args = ['api', '--method', method, endpoint];
  if (data) args.push('--input', '-');
  return JSON.parse(execFileSync('gh', args, {
    encoding: 'utf8', input: data ? JSON.stringify(data) : undefined, maxBuffer: 16 * 1024 * 1024,
  }));
}

async function main(mode) {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const context = {
    eventName: process.env.GITHUB_EVENT_NAME, event, repo: process.env.GITHUB_REPOSITORY,
    ref: process.env.GITHUB_REF, actor: process.env.THEME_ACTOR, baseSha: process.env.GITHUB_SHA, api,
  };
  const planPath = process.env.THEME_PLAN;
  if (!planPath || !['prepare', 'publish'].includes(mode)) throw new Error('Expected prepare/publish and THEME_PLAN');
  if (mode === 'prepare') {
    const review = await reviewSubmission(context);
    if (review.existing.length) {
      console.log(`Open PR already references submission: ${review.existing.map((pr) => pr.number).join(', ')}`);
      return;
    }
    const manifest = JSON.parse(await readFile(join(root, manifestPath), 'utf8'));
    const iconSource = await readFile(join(root, 'src/constants/nerdFontIcons.ts'), 'utf8');
    const iconIds = new Set([...iconSource.matchAll(/'([^']+)':\s*\{[^}]*char:\s*'([^']+)'[^}]*\}/g)].map((match) => match[1]));
    if (!iconIds.size) throw new Error('Could not read repository icon IDs');
    const schemaDir = join(root, '.theme-schema');
    const schemaText = execFileSync('git', ['-C', schemaDir, 'show', `${schemaRef}:themes/schema.json`], { encoding: 'utf8' });
    const contribution = buildContribution(review.issue, manifest, {
      iconIds, validateSchema: createSchemaValidator(JSON.parse(schemaText)),
    });
    const existingFiles = await readdir(join(root, 'public/configs/community'));
    if (existingFiles.includes(`${contribution.id}.json`)) throw new Error('Derived filename already exists on disk');
    const plan = {
      ...contribution, number: review.issue.number, baseSha: review.baseSha,
      issueHash: issueFingerprint(review.issue), schemaHash: sha256(schemaText),
    };
    for (const file of plan.files) await writeFile(join(root, file.path), file.content,
      file.path === manifestPath ? 'utf8' : { encoding: 'utf8', flag: 'wx' });
    await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`);
    await appendFile(process.env.GITHUB_OUTPUT, 'prepared=true\n');
  } else {
    const plan = JSON.parse(await readFile(planPath, 'utf8'));
    for (const file of plan.files) {
      if (![manifestPath, `public/configs/community/${plan.id}.json`].includes(file.path) ||
        await readFile(join(root, file.path), 'utf8') !== file.content) {
        throw new Error('Prepared files changed after validation');
      }
    }
    console.log(JSON.stringify(await publishContribution(plan, context)));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv[2]).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
