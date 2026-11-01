import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { repository, upstreamRepository } from './capture-theme-gallery.mjs';

const themePattern = /\.omp\.(json|yaml|yml)$/;
export const sha256 = (text) => createHash('sha256').update(text).digest('hex');

export function createSchemaValidator(schema) {
  // Upstream's custom color format is an annotation; its pattern still validates.
  // Compile synchronously: never fetch a submitted $schema URL or remote reference.
  return new Ajv2020({ strict: false, allErrors: true, validateFormats: false }).compile(schema);
}

export function validateSubmission(body, { validateSchema, iconIds, communityEntries, includeContent = false }) {
  const errors = [];
  const sections = new Map();
  const text = body.replace(/\r\n/g, '\n');
  const headings = [...text.matchAll(/^## ([^\n]+)$/gm)];
  for (const [index, match] of headings.entries()) {
    const name = match[1].trim();
    if (sections.has(name)) errors.push(`Duplicate section: ${name}`);
    sections.set(name, text.slice(match.index + match[0].length, headings[index + 1]?.index));
  }
  for (const heading of ['Theme Details', 'Configuration', 'License Confirmation']) {
    if (!sections.has(heading)) errors.push(`Missing section: ${heading}`);
  }
  const metadata = {};
  for (const field of ['Theme Name', 'Author', 'Description', 'Icon', 'Tags']) {
    const values = [...(sections.get('Theme Details') ?? '').matchAll(
      new RegExp(`^- \\*\\*${field}:\\*\\*[ \\t]*(.*)$`, 'gm'),
    )];
    if (values.length > 1 || (field !== 'Tags' && (values.length !== 1 || !values[0][1].trim()))) {
      errors.push(`Expected one non-empty canonical **${field}:** line`);
    }
    metadata[field] = values[0]?.[1].trim() ?? '';
  }
  const id = metadata['Theme Name'].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!id) errors.push('Theme name must produce a non-empty ASCII ID');
  if (!iconIds.has(metadata.Icon)) errors.push('Icon must be an exact repository icon ID');
  if (communityEntries.some((entry) => entry.id === id || entry.file === `${id}.json`)) {
    errors.push('Derived ID or filename already exists in the community gallery');
  }
  if (!/^- \[x\] I confirm this configuration is my original work or is properly attributed, and I contribute it under the MIT License\.\s*$/im
    .test(sections.get('License Confirmation') ?? '')) errors.push('Missing checked MIT contribution acknowledgement');
  const configuration = sections.get('Configuration') ?? '';
  const fences = [...configuration.matchAll(/^```([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm)];
  let schema = { status: 'not-evaluated', errors: [] };
  let configHash = null;
  let parsedConfig;
  if (fences.length !== 1 || fences[0][1].trim() !== 'json' ||
    [...configuration.matchAll(/^```/gm)].length !== 2) {
    errors.push('Configuration must contain exactly one fenced json object');
  } else {
    configHash = sha256(fences[0][2]);
    let config;
    try {
      config = JSON.parse(fences[0][2]);
    } catch (error) {
      errors.push(`Configuration JSON is invalid: ${error.message}`);
    }
    if (config !== undefined) {
      parsedConfig = config;
      if (!config || typeof config !== 'object' || Array.isArray(config)) {
        errors.push('Configuration must be a top-level object');
      } else {
        if (typeof config.$schema !== 'string' || !config.$schema) errors.push('Configuration requires $schema');
        if (!Array.isArray(config.blocks) || !config.blocks.length) errors.push('Configuration requires non-empty blocks');
        for (const field of ['id', 'name', 'description', 'icon', 'author', 'tags']) {
          if (Object.hasOwn(config, field)) errors.push(`Submission metadata is not allowed in configuration: ${field}`);
        }
        const valid = validateSchema(config);
        schema = {
          status: valid ? 'valid' : 'invalid',
          errors: (validateSchema.errors ?? []).map(({ instancePath, keyword, message, params }) => ({ instancePath, keyword, message, params })),
        };
      }
    }
  }
  return {
    id, configHash, metadata: { status: errors.length ? 'invalid' : 'valid', errors }, schema,
    ...(includeContent ? { details: metadata, configuration: parsedConfig } : {}),
  };
}

export function findSubmissionPullRequests(pulls, number) {
  return pulls.filter((pr) => {
    const text = `${pr.title}\n${pr.body ?? ''}`;
    const localReference = new RegExp(`(^|[^\\w/.-])#${number}(?!\\d)`);
    const fullReference = new RegExp(`https://github\\.com/${repository}/issues/${number}(?!\\d)|\\b${repository}#${number}(?!\\d)`);
    return localReference.test(text) || fullReference.test(text) ||
      pr.head?.ref === `automation/theme-submission-${number}`;
  });
}

function assertSnapshot(snapshot, upstreamRef) {
  if (snapshot.schemaVersion !== 1 || snapshot.repository !== repository ||
    snapshot.upstream?.repository !== upstreamRepository || snapshot.upstream?.ref !== upstreamRef ||
    !Number.isFinite(Date.parse(snapshot.startedAt)) || !Number.isFinite(Date.parse(snapshot.capturedAt))) {
    throw new Error('Invalid or mismatched capture provenance');
  }
  for (const key of ['issues', 'pulls']) {
    const page = snapshot[key];
    if (!page?.complete || !Number.isInteger(page.pages) || page.pages < 1 || !Array.isArray(page.items) ||
      page.pages !== Math.floor(page.items.length / 100) + 1) throw new Error(`Incomplete ${key} pagination`);
    const numbers = new Set();
    for (const row of page.items) {
      if (!Number.isSafeInteger(row.number) || row.number <= 0 || numbers.has(row.number) ||
        row.state !== 'open' || typeof row.title !== 'string' ||
        (row.body !== null && typeof row.body !== 'string') || !Number.isFinite(Date.parse(row.updated_at))) {
        throw new Error(`Invalid or duplicate ${key} item`);
      }
      numbers.add(row.number);
      if (key === 'issues' && (!Array.isArray(row.labels) || row.labels.some((label) => typeof label.name !== 'string'))) {
        throw new Error('Invalid issue labels');
      }
      if (key === 'pulls' && row.base?.repo?.full_name !== repository) throw new Error('Unexpected PR repository');
    }
  }
}

export function auditSubmissions(snapshot, upstreamRef, validation) {
  assertSnapshot(snapshot, upstreamRef);
  return snapshot.issues.items.filter((issue) => !issue.pull_request &&
    issue.labels.some(({ name }) => name === 'theme:submission')).map((issue) => {
    const body = issue.body ?? '';
    const url = `https://github.com/${repository}/issues/${issue.number}`;
    const labels = issue.labels.map(({ name }) => name).sort();
    const existingPullRequests = findSubmissionPullRequests(snapshot.pulls.items, issue.number).map((pr) => ({
      number: pr.number, url: `https://github.com/${repository}/pull/${pr.number}`,
      updatedAt: pr.updated_at, contentHash: sha256(JSON.stringify([pr.title, pr.body, pr.head?.ref])),
    })).sort((a, b) => a.number - b.number);
    const result = validateSubmission(body, validation);
    const approval = labels.includes('theme:approved') ? 'approved' : 'pending';
    return {
      number: issue.number, url, title: issue.title, updatedAt: issue.updated_at, labels, approval,
      bodyHash: sha256(body),
      updateHash: sha256(JSON.stringify([issue.number, issue.updated_at, issue.title, body, labels])),
      ...result, existingPullRequests,
      queue: existingPullRequests.length ? 'existing-pr-review' :
        result.metadata.status !== 'valid' || result.schema.status !== 'valid' ? 'needs-correction-review' :
          approval === 'approved' ? 'approved-human-review' : 'awaiting-approval',
    };
  }).sort((a, b) => a.number - b.number);
}

export function reportFingerprint(report) {
  return sha256(JSON.stringify({
    sourceRef: report.sourceRef, upstreamRef: report.upstreamRef, schemaHash: report.schemaHash,
    inputHashes: report.inputHashes,
    manifestHash: report.manifestHash, official: report.official,
    localGalleries: report.localGalleries, submissions: report.submissions,
  }));
}

export function compareOfficialGallery(manifest, upstreamFiles, previewFiles) {
  const local = manifest.themes.map(({ file }) => file);
  if (new Set(local).size !== local.length) {
    throw new Error('Official manifest contains duplicate filenames');
  }
  const upstream = upstreamFiles.filter((file) => themePattern.test(file));
  const previews = new Set(previewFiles);
  return {
    localCount: local.length,
    upstreamCount: upstream.length,
    added: upstream.filter((file) => !local.includes(file)).sort(),
    removed: local.filter((file) => !upstream.includes(file)).sort(),
    missingPreviews: local.filter((file) => !previews.has(file.replace(themePattern, '.svg'))).sort(),
    previewContentParity: 'unverified: existing manifest entries do not record preview source hashes',
  };
}

export function summarizeSubmissions(issues) {
  return issues
    .filter((issue) => !issue.pull_request && issue.state === 'open' &&
      issue.labels.some((label) => label.name === 'theme:submission'))
    .map((issue) => ({
      number: issue.number,
      url: issue.html_url,
      title: issue.title,
      updatedAt: issue.updated_at,
      approval: issue.labels.some((label) => label.name === 'theme:approved') ? 'approved' : 'pending',
      validation: 'not evaluated; issue content must be validated by the existing contribution workflow',
    }))
    .sort((a, b) => a.number - b.number);
}

async function main(argv) {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const args = new Map();
  for (const arg of argv) {
    const match = /^--(upstream-dir|upstream-ref|submissions-file|snapshot-file)=(.+)$/.exec(arg);
    if (!match || args.has(match[1])) throw new Error(`Invalid or duplicate argument: ${arg}`);
    args.set(match[1], match[2]);
  }
  const upstreamDir = args.get('upstream-dir');
  const upstreamRef = args.get('upstream-ref');
  if (!upstreamDir || !/^[a-f0-9]{40}$/.test(upstreamRef ?? '')) {
    throw new Error('Supply --upstream-dir=<checkout> and --upstream-ref=<40-character commit SHA>');
  }
  const git = (...command) => execFileSync('git', ['-C', resolve(upstreamDir), ...command], { encoding: 'utf8' }).trim();
  if (git('rev-parse', 'HEAD') !== upstreamRef) throw new Error('Upstream HEAD does not match the supplied ref');
  const files = git('ls-tree', '-r', '--name-only', upstreamRef, '--', 'themes')
    .split('\n').filter((file) => /^themes\/[^/]+$/.test(file)).map((file) => file.slice(7));
  const configs = join(root, 'public/configs');
  const manifest = JSON.parse(await readFile(join(configs, 'official/manifest.json'), 'utf8'));
  const previews = await readdir(join(configs, 'official/previews'));
  const localGalleries = {};
  for (const category of ['samples', 'community']) {
    const { configs: entries } = JSON.parse(await readFile(join(configs, category, 'manifest.json'), 'utf8'));
    const present = new Set(await readdir(join(configs, category, 'previews')));
    localGalleries[category] = {
      count: entries.length, manifestHash: sha256(JSON.stringify(entries)),
      missingPreviews: entries.filter(({ file }) => !present.has(file.replace(/\.json$/, '.svg')))
        .map(({ id }) => id).sort(),
    };
  }
  const submissionsFile = args.get('submissions-file');
  const snapshotFile = args.get('snapshot-file');
  if (submissionsFile && snapshotFile) throw new Error('Choose submissions-file or snapshot-file, not both');
  const schemaText = execFileSync('git', ['-C', resolve(upstreamDir), 'show', `${upstreamRef}:themes/schema.json`], { encoding: 'utf8' });
  const snapshot = snapshotFile ? JSON.parse(await readFile(snapshotFile, 'utf8')) : null;
  const iconSource = await readFile(join(root, 'src/constants/nerdFontIcons.ts'), 'utf8');
  const iconIds = new Set([...iconSource.matchAll(/'([^']+)':\s*\{[^}]*char:\s*'([^']+)'[^}]*\}/g)].map((match) => match[1]));
  if (!iconIds.size) throw new Error('Could not read repository icon IDs');
  const { configs: communityEntries } = JSON.parse(await readFile(join(configs, 'community/manifest.json'), 'utf8'));
  const report = {
    schemaVersion: 2,
    sourceRef: execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    sourceWorktreeDirty: execFileSync('git', ['-C', root, 'status', '--porcelain', '--',
      '.github/workflows/generate-theme-previews.yml', 'scripts', 'package.json', 'package-lock.json',
      'public/configs', 'src/constants/nerdFontIcons.ts'], { encoding: 'utf8' }).trim().length > 0,
    inputHashes: Object.fromEntries(await Promise.all([
      'scripts/audit-theme-gallery.mjs', 'scripts/capture-theme-gallery.mjs',
      '.github/workflows/generate-theme-previews.yml', 'package-lock.json', 'src/constants/nerdFontIcons.ts',
    ].map(async (file) => [file, sha256(await readFile(join(root, file)))]))),
    upstreamRef,
    upstreamUrl: `https://github.com/${upstreamRepository}/tree/${upstreamRef}/themes`,
    schemaUrl: `https://github.com/${upstreamRepository}/blob/${upstreamRef}/themes/schema.json`,
    schemaHash: sha256(schemaText),
    manifestHash: sha256(JSON.stringify(manifest)),
    manifestLastUpdated: manifest.lastUpdated,
    official: compareOfficialGallery(manifest, files, previews),
    localGalleries,
    submissions: snapshot ? auditSubmissions(snapshot, upstreamRef, {
      validateSchema: createSchemaValidator(JSON.parse(schemaText)), iconIds, communityEntries,
    }) : submissionsFile ? summarizeSubmissions(JSON.parse(await readFile(submissionsFile, 'utf8'))) : null,
    capture: snapshot ? {
      startedAt: snapshot.startedAt, capturedAt: snapshot.capturedAt, predecessor: snapshot.predecessor,
      pagination: { issues: snapshot.issues.pages, pulls: snapshot.pulls.pages },
    } : null,
    limitations: [
      'Static audit only: no template execution, approval, promotion or live preview verification.',
      'Schema formats are annotations, not assertions; other schema constraints are checked against the pinned schema.',
      'Issue/PR pagination is not an atomic snapshot; re-read labels, hashes and open PRs before any future promotion.',
      'Canonical metadata parser is conservative; formatting findings need human review, not automatic rejection.',
      'Legacy submissions-file mode reports labels only, with caller-owned completeness; use snapshot-file for static validation.',
      'Removal candidates need human review. This command never changes catalogs, previews, issues or pull requests.',
    ],
  };
  report.fingerprint = reportFingerprint(report);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
