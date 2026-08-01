#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { pathToFileURL } from 'url';

const execFileAsync = promisify(execFile);

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SEGMENTS_DIR = path.join(REPO_ROOT, 'public', 'segments');
const REPORT_PATH = path.join(REPO_ROOT, 'docs', 'segment-upstream-sync-report.md');
const UPSTREAM_REPO = 'JanDeDobbeleer/oh-my-posh';
const DOCS_BASE_URL = 'https://ohmyposh.dev/docs/segments';

const CATEGORY_ORDER = ['system', 'scm', 'languages', 'cloud', 'cli', 'web', 'music', 'health'];
const DOC_CATEGORY_TO_LOCAL = {
  language: 'languages',
  languages: 'languages',
  system: 'system',
  scm: 'scm',
  cloud: 'cloud',
  cli: 'cli',
  web: 'web',
  music: 'music',
  health: 'health',
};

const SOURCE_FILE_OVERRIDES = {
  azfunc: 'src/segments/az_functions.go',
  go: 'src/segments/golang.go',
  'nix-shell': 'src/segments/nixshell.go',
  node: 'src/segments/node.go',
  dotnet: 'src/segments/dotnet.go',
  claude: 'src/segments/claude.go',
};

function parseArgs(argv) {
  const args = {
    scope: 'all',
    cadence: 'weekly',
    strictness: 'report',
    upstreamRef: 'main',
    upstreamDir: '',
  };

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      continue;
    }

    const [rawKey, value] = arg.slice(2).split('=');
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (key in args && value) {
      args[key] = value;
    }
  }

  if (!['all', 'changed'].includes(args.scope)) {
    throw new Error(`Invalid scope: ${args.scope}`);
  }

  if (!['weekly', 'monthly'].includes(args.cadence)) {
    throw new Error(`Invalid cadence: ${args.cadence}`);
  }

  if (!['report', 'report-and-fix'].includes(args.strictness)) {
    throw new Error(`Invalid strictness: ${args.strictness}`);
  }

  if (!args.upstreamRef.trim()) {
    throw new Error('upstreamRef must not be empty');
  }

  return args;
}

function getUpstreamUrls(ref) {
  const encodedRef = encodeURIComponent(ref);
  return {
    treeApiUrl: `https://api.github.com/repos/${UPSTREAM_REPO}/git/trees/${encodedRef}?recursive=1`,
    rawBaseUrl: `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${encodedRef}`,
  };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ohmyposh-configurator-upstream-sync',
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ohmyposh-configurator-upstream-sync',
      Accept: 'text/plain',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function normalizeWhitespace(value) {
  return (value ?? '').replace(/\r/g, '').trim();
}

function normalizeTemplate(value) {
  return normalizeWhitespace(value).replace(/\s+/g, ' ');
}

function normalizeText(value) {
  return normalizeWhitespace(value)
    .replace(/<\/?.*?>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeType(type) {
  const normalized = normalizeText(type).toLowerCase();
  if (['bool', 'boolean'].includes(normalized)) {
    return 'boolean';
  }

  if (/^(u?int|float(32|64)?|number)$/.test(normalized)) {
    return 'number';
  }

  if (['[]string', 'string[]', 'array'].includes(normalized)) {
    return 'array';
  }

  if (/^(map\[.*\].*|object)$/.test(normalized)) {
    return 'object';
  }

  return normalized;
}

function normalizeDefaultValue(value, type) {
  const cleaned = normalizeText(value)
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\U([0-9a-fA-F]{8})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
  if (!cleaned || cleaned === 'none') {
    if (type === 'object') {
      return {};
    }

    if (type === 'array') {
      return [];
    }

    return cleaned;
  }

  if (type === 'boolean') {
    return cleaned === 'true';
  }

  if (type === 'number') {
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? cleaned : parsed;
  }

  if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
    try {
      return JSON.parse(cleaned);
    } catch {
      return cleaned;
    }
  }

  return cleaned;
}

function extractValues(description) {
  const htmlListItems = Array.from(description.matchAll(/<li>(.*?)<\/li>/gsi)).map((match) => normalizeText(match[1]));
  if (htmlListItems.length > 0) {
    return htmlListItems
      .map((item) => item.split(':')[0]?.trim())
      .map((item) => item.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
  }

  const codeValues = Array.from(description.matchAll(/`([^`]+)`/g)).map((match) => match[1].trim());
  if (codeValues.length > 1) {
    return [...new Set(codeValues)];
  }

  return [];
}

function parseMarkdownTableLines(lines) {
  const rows = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));

  if (rows.length < 2) {
    return [];
  }

  const bodyRows = rows.slice(2).filter((line) => !/^\|(?:\s*:?-+:?\s*\|)+$/.test(line));
  return bodyRows.map((line) => {
    const rawCells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    return rawCells;
  });
}

function extractSection(content, heading) {
  const headingPattern = new RegExp(`^##\\s+${heading}\\b.*$`, 'im');
  const headingMatch = headingPattern.exec(content);

  if (!headingMatch || headingMatch.index === undefined) {
    return '';
  }

  const startIndex = headingMatch.index + headingMatch[0].length;
  const remaining = content.slice(startIndex);
  const nextHeadingMatch = /^##\s+/im.exec(remaining);

  if (!nextHeadingMatch || nextHeadingMatch.index === undefined) {
    return remaining;
  }

  return remaining.slice(0, nextHeadingMatch.index);
}

function extractDefaultTemplate(content) {
  const match = content.match(/:::note\s+default template[\s\S]*?```template\s*([\s\S]*?)```/i);
  return match ? normalizeWhitespace(match[1]) : '';
}

function extractOptions(content) {
  const optionsSection = extractSection(content, 'Options');
  const lines = optionsSection.split('\n');
  const tableLines = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|')) {
      inTable = true;
      tableLines.push(line);
      continue;
    }

    if (inTable) {
      break;
    }
  }

  return parseMarkdownTableLines(tableLines).map((cells) => {
    const [name, type, defaultValue, description = ''] = cells;
    const normalizedType = normalizeType(type);
    const normalizedDescription = normalizeText(description);
    const values = extractValues(description);

    return {
      name: normalizeText(name),
      type: normalizedType,
      default: normalizeDefaultValue(defaultValue, normalizedType),
      description: normalizedDescription,
      values: values.length > 0 ? values : undefined,
    };
  });
}

function extractProperties(content) {
  const templateSection = extractSection(content, 'Template');
  const propertySections = Array.from(templateSection.matchAll(/^#{3,4}\s+.*Properties\s*$/gim));

  return propertySections.flatMap((section) => {
    const start = (section.index ?? 0) + section[0].length;
    const remainingContent = templateSection.slice(start);
    const nextHeading = /^#{1,4}\s+/m.exec(remainingContent);
    const propertyContent = nextHeading
      ? remainingContent.slice(0, nextHeading.index)
      : remainingContent;
    const tableLines = propertyContent
      .split('\n')
      .filter((line) => line.trim().startsWith('|'));

    return parseMarkdownTableLines(tableLines).map((cells) => {
      const [name, type, description = ''] = cells;
      return {
        name: normalizeText(name),
        type: normalizeType(type),
        description: normalizeText(description),
      };
    });
  });
}

function extractDocTitle(content) {
  const idMatch = content.match(/^title:\s*(.+)$/m);
  return normalizeText(idMatch?.[1] ?? '');
}

export function extractDocPageId(content, relativePath) {
  const idMatch = content.match(/^id:\s*(.+)$/m);
  if (idMatch) {
    return normalizeText(idMatch[1]);
  }

  return path.basename(relativePath, '.mdx');
}

export function extractRuntimeType(content, fallbackType) {
  const sampleConfigurationIndex = content.search(/^##\s+(?:Sample )?Configuration\b/im);
  const sampleConfiguration = sampleConfigurationIndex >= 0
    ? content.slice(sampleConfigurationIndex)
    : content;
  const typeMatch = sampleConfiguration.match(/\btype\s*:\s*["']([^"']+)["']/);

  return normalizeText(typeMatch?.[1] ?? fallbackType);
}

export function extractSampleConfigurationValue(content, name) {
  const sampleConfigurationIndex = content.search(/^##\s+(?:Sample )?Configuration\b/im);
  const sampleConfiguration = sampleConfigurationIndex >= 0
    ? content.slice(sampleConfigurationIndex)
    : content;
  const valueMatch = sampleConfiguration.match(new RegExp(`\\b${name}\\s*:\\s*["']([^"']+)["']`));

  return valueMatch?.[1] ?? '';
}

function guessSourceFilePath(type) {
  if (SOURCE_FILE_OVERRIDES[type]) {
    return SOURCE_FILE_OVERRIDES[type];
  }

  return `src/segments/${type}.go`;
}

function extractSourceTemplate(content) {
  const match = content.match(/func\s*\([^)]*\)\s*Template\(\)\s+string\s*\{[\s\S]*?return\s+"([\s\S]*?)"/m);
  if (!match) {
    return '';
  }

  return normalizeWhitespace(match[1])
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\U([0-9a-fA-F]{8})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"');
}

function stableStringify(value) {
  const json = JSON.stringify(value, null, 2);

  // Keep non-ASCII characters escaped in generated JSON (for consistent diffs).
  return json.replace(/[\u0080-\u{10FFFF}]/gu, (char) => {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) {
      return char;
    }

    if (codePoint <= 0xffff) {
      return `\\u${codePoint.toString(16).padStart(4, '0')}`;
    }

    const adjusted = codePoint - 0x10000;
    const highSurrogate = 0xd800 + (adjusted >> 10);
    const lowSurrogate = 0xdc00 + (adjusted & 0x3ff);
    return `\\u${highSurrogate.toString(16).padStart(4, '0')}\\u${lowSurrogate.toString(16).padStart(4, '0')}`;
  });
}

async function loadLocalInventory() {
  const entries = await fs.readdir(SEGMENTS_DIR, { withFileTypes: true });
  const inventory = new Map();
  const fileData = new Map();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    const category = path.basename(entry.name, '.json');
    const filePath = path.join(SEGMENTS_DIR, entry.name);
    const segments = JSON.parse(await fs.readFile(filePath, 'utf8'));
    fileData.set(category, { filePath, segments });

    for (const segment of segments) {
      inventory.set(segment.type, {
        category,
        filePath,
        segment,
      });
    }
  }

  return { inventory, fileData };
}

async function getChangedTypes(inventory) {
  try {
    const { stdout } = await execFileAsync('git', ['diff', '--name-only', 'main...HEAD', '--', 'public/segments/*.json'], {
      cwd: REPO_ROOT,
    });

    const changedFiles = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => path.join(REPO_ROOT, line));

    if (changedFiles.length === 0) {
      return new Set(inventory.keys());
    }

    const changedTypes = new Set();
    for (const filePath of changedFiles) {
      const segments = JSON.parse(await fs.readFile(filePath, 'utf8'));
      for (const segment of segments) {
        changedTypes.add(segment.type);
      }
    }

    return changedTypes;
  } catch {
    return new Set(inventory.keys());
  }
}

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  }));

  return nestedFiles.flat();
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadUpstreamSource(args) {
  if (args.upstreamDir) {
    const root = path.resolve(REPO_ROOT, args.upstreamDir);
    const docsDirectory = path.join(root, 'website', 'docs', 'segments');
    if (!await fileExists(docsDirectory)) {
      throw new Error(`Upstream directory does not contain website/docs/segments: ${root}`);
    }

    const docPaths = (await listFiles(docsDirectory))
      .filter((filePath) => filePath.endsWith('.mdx'))
      .map((filePath) => path.relative(root, filePath).split(path.sep).join('/'))
      .filter((filePath) => !filePath.endsWith('/index.mdx'))
      .sort();

    return {
      docPaths,
      hasSourceFile: (sourcePath) => fileExists(path.join(root, sourcePath)),
      readText: (sourcePath) => fs.readFile(path.join(root, sourcePath), 'utf8'),
      getUrl: (sourcePath) => pathToFileURL(path.join(root, sourcePath)).href,
      description: `Local upstream checkout: ${root}`,
    };
  }

  const { treeApiUrl, rawBaseUrl } = getUpstreamUrls(args.upstreamRef);
  const tree = await fetchJson(treeApiUrl);
  const treeEntries = tree.tree ?? [];
  const docPaths = treeEntries
    .filter((entry) => entry.type === 'blob' && /^website\/docs\/segments\/.+\.mdx$/.test(entry.path))
    .filter((entry) => !entry.path.endsWith('/index.mdx'))
    .map((entry) => entry.path)
    .sort();

  return {
    docPaths,
    hasSourceFile: async (sourcePath) => treeEntries.some((entry) => entry.path === sourcePath),
    readText: (sourcePath) => fetchText(`${rawBaseUrl}/${sourcePath}`),
    getUrl: (sourcePath) => `${rawBaseUrl}/${sourcePath}`,
    description: `Official repository tree API: ${treeApiUrl}`,
  };
}

function extractSampleCache(content) {
  const sampleConfigurationIndex = content.search(/^##\s+(?:Sample )?Configuration\b/im);
  const sampleConfiguration = sampleConfigurationIndex >= 0
    ? content.slice(sampleConfigurationIndex)
    : content;
  const cacheMatch = sampleConfiguration.match(/\bcache\s*:\s*\{([\s\S]*?)\n\s*\}/);
  if (!cacheMatch) {
    return null;
  }

  const duration = cacheMatch[1].match(/\bduration\s*:\s*["']([^"']+)["']/)?.[1];
  const strategy = cacheMatch[1].match(/\bstrategy\s*:\s*["']([^"']+)["']/)?.[1];
  return duration && strategy ? { duration, strategy } : null;
}

async function loadUpstreamInventory(args) {
  const source = await loadUpstreamSource(args);

  const upstream = new Map();

  for (const docPath of source.docPaths) {
    const content = await source.readText(docPath);
    const relativeDocPath = docPath.replace(/^website\/docs\/segments\//, '');
    const category = DOC_CATEGORY_TO_LOCAL[relativeDocPath.split('/')[0]];
    const docPageId = extractDocPageId(content, docPath);
    const type = extractRuntimeType(content, docPageId);

    if (!category || !type) {
      continue;
    }

    if (upstream.has(type)) {
      const existing = upstream.get(type);
      throw new Error(`Multiple upstream documentation pages map to runtime type "${type}": ${existing.evidence.repoDocPath} and ${docPath}`);
    }

    const sourcePath = guessSourceFilePath(type);
    const sourceExists = await source.hasSourceFile(sourcePath);
    let sourceTemplate = '';
    let sourceUrl = '';
    const docTemplate = extractDefaultTemplate(content);

    if (sourceExists) {
      sourceUrl = source.getUrl(sourcePath);
      try {
        const sourceContent = await source.readText(sourcePath);
        sourceTemplate = extractSourceTemplate(sourceContent);
      } catch {
        sourceTemplate = '';
      }
    }

    upstream.set(type, {
      type,
      category,
      name: extractDocTitle(content) || type,
      defaultTemplate: sourceTemplate || docTemplate,
      defaultForeground: extractSampleConfigurationValue(content, 'foreground'),
      defaultBackground: extractSampleConfigurationValue(content, 'background'),
      properties: extractProperties(content),
      options: extractOptions(content),
      defaultCache: extractSampleCache(content),
      evidence: {
        repoDocPath: docPath,
        repoDocUrl: source.getUrl(docPath),
        docsUrl: `${DOCS_BASE_URL}/${relativeDocPath.replace(/\.mdx$/, '')}`,
        sourcePath: sourceExists ? sourcePath : null,
        sourceUrl: sourceUrl || null,
        docPageId,
      },
      ambiguity: sourceTemplate && docTemplate && normalizeTemplate(sourceTemplate) !== normalizeTemplate(docTemplate)
        ? [`Template mismatch between docs and source (${sourcePath})`]
        : [],
    });
  }

  return { inventory: upstream, source };
}

function normalizeLocalSegment(local) {
  return {
    category: local.category,
    name: local.segment.name,
    defaultTemplate: local.segment.defaultTemplate ?? '',
    defaultForeground: local.segment.defaultForeground ?? '',
    defaultBackground: local.segment.defaultBackground ?? '',
    properties: Array.isArray(local.segment.properties) ? local.segment.properties : [],
    options: Array.isArray(local.segment.options) ? local.segment.options : [],
    defaultCache: local.segment.defaultCache ?? null,
  };
}

function mapByName(entries) {
  const map = new Map();
  for (const entry of entries ?? []) {
    map.set(entry.name, entry);
  }
  return map;
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function typesCompatible(localType, upstreamType, localValues, upstreamValues) {
  if (normalizeType(localType) === normalizeType(upstreamType)) {
    return true;
  }

  if (localType === 'enum' && upstreamType === 'string' && (localValues?.length || upstreamValues?.length)) {
    return true;
  }

  return false;
}

function diffNamedEntries(kind, localEntries, upstreamEntries) {
  const localMap = mapByName(localEntries);
  const upstreamMap = mapByName(upstreamEntries);
  const diffs = [];

  for (const [name, upstreamEntry] of upstreamMap) {
    const localEntry = localMap.get(name);
    if (!localEntry) {
      diffs.push({
        field: kind,
        kind: 'missing-local',
        name,
        confidence: 'high confidence',
        detail: `${kind} ${name} exists upstream but is missing locally`,
      });
      continue;
    }

    if (!typesCompatible(localEntry.type, upstreamEntry.type, localEntry.values, upstreamEntry.values)) {
      diffs.push({
        field: kind,
        kind: 'type',
        name,
        confidence: 'high confidence',
        detail: `${kind} ${name} type differs (local: ${localEntry.type}, upstream: ${upstreamEntry.type})`,
      });
    }

    const localDefault = 'default' in localEntry ? localEntry.default ?? '' : undefined;
    const upstreamDefault = 'default' in upstreamEntry ? upstreamEntry.default ?? '' : undefined;
    if (localDefault !== undefined && upstreamDefault !== undefined && !sameValue(localDefault, upstreamDefault)) {
      diffs.push({
        field: kind,
        kind: 'default',
        name,
        confidence: 'high confidence',
        detail: `${kind} ${name} default differs`,
      });
    }

    if (!sameValue(localEntry.values ?? [], upstreamEntry.values ?? [])) {
      diffs.push({
        field: kind,
        kind: 'values',
        name,
        confidence: 'high confidence',
        detail: `${kind} ${name} allowed values differ`,
      });
    }

    if (normalizeText(localEntry.description) !== normalizeText(upstreamEntry.description)) {
      diffs.push({
        field: kind,
        kind: 'description',
        name,
        confidence: 'medium confidence',
        detail: `${kind} ${name} description differs`,
      });
    }
  }

  for (const [name] of localMap) {
    if (!upstreamMap.has(name)) {
      diffs.push({
        field: kind,
        kind: 'missing-upstream',
        name,
        confidence: 'high confidence',
        detail: `${kind} ${name} exists locally but is missing upstream`,
      });
    }
  }

  return diffs;
}

function compareSegment(type, localSegment, upstreamSegment) {
  if (!localSegment && upstreamSegment) {
    return {
      type,
      status: 'added-upstream',
      confidence: upstreamSegment.ambiguity.length > 0 ? 'needs manual review' : 'high confidence',
      differences: [{
        field: 'segment',
        kind: 'missing-local',
        name: type,
        confidence: upstreamSegment.ambiguity.length > 0 ? 'needs manual review' : 'high confidence',
        detail: 'Segment exists upstream but is missing locally',
      }],
      upstream: upstreamSegment,
      local: null,
      evidence: upstreamSegment.evidence,
      ambiguity: upstreamSegment.ambiguity,
    };
  }

  if (localSegment && !upstreamSegment) {
    return {
      type,
      status: 'removed-upstream',
      confidence: 'high confidence',
      differences: [{
        field: 'segment',
        kind: 'missing-upstream',
        name: type,
        confidence: 'high confidence',
        detail: 'Segment exists locally but no longer exists upstream',
      }],
      upstream: null,
      local: localSegment,
      evidence: null,
      ambiguity: [],
    };
  }

  const differences = [];
  const local = normalizeLocalSegment(localSegment);
  const upstream = upstreamSegment;

  if (normalizeTemplate(local.defaultTemplate) !== normalizeTemplate(upstream.defaultTemplate)) {
    differences.push({
      field: 'defaultTemplate',
      kind: 'template',
      name: type,
      confidence: upstream.ambiguity.length > 0 ? 'needs manual review' : 'high confidence',
      detail: 'Default template differs',
    });
  }

  for (const field of ['defaultForeground', 'defaultBackground']) {
    if (upstream[field] && local[field] !== upstream[field]) {
      differences.push({
        field,
        kind: 'default',
        name: type,
        confidence: 'high confidence',
        detail: `${field} differs from documented sample configuration`,
      });
    }
  }

  differences.push(...diffNamedEntries('property', local.properties, upstream.properties));
  differences.push(...diffNamedEntries('option', local.options, upstream.options));

  const supportsCache = upstream.options.some((option) => option.name === 'cache_duration');
  if (local.defaultCache && !upstream.defaultCache && !supportsCache) {
    differences.push({
      field: 'defaultCache',
      kind: 'cache',
      name: type,
      confidence: 'needs manual review',
      detail: 'Local defaultCache is set but upstream docs do not expose cache_duration',
    });
  }

  if (upstream.defaultCache && !sameValue(local.defaultCache, upstream.defaultCache)) {
    differences.push({
      field: 'defaultCache',
      kind: 'cache',
      name: type,
      confidence: 'high confidence',
      detail: 'Documented cache recommendation differs',
    });
  }

  const confidence = differences.some((difference) => difference.confidence === 'needs manual review')
    ? 'needs manual review'
    : differences.some((difference) => difference.confidence === 'medium confidence')
      ? 'medium confidence'
      : 'high confidence';

  return {
    type,
    status: differences.length === 0 ? 'unchanged' : 'changed',
    confidence,
    differences,
    upstream,
    local: localSegment,
    evidence: upstream.evidence,
    ambiguity: upstream.ambiguity,
  };
}

function summarizeResults(results) {
  const summary = {
    totalCompared: results.length,
    unchanged: 0,
    changed: 0,
    addedUpstream: 0,
    removedUpstream: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    manualReview: 0,
  };

  for (const result of results) {
    if (result.status === 'unchanged') summary.unchanged += 1;
    if (result.status === 'changed') summary.changed += 1;
    if (result.status === 'added-upstream') summary.addedUpstream += 1;
    if (result.status === 'removed-upstream') summary.removedUpstream += 1;
    if (result.confidence === 'high confidence') summary.highConfidence += 1;
    if (result.confidence === 'medium confidence') summary.mediumConfidence += 1;
    if (result.confidence === 'needs manual review') summary.manualReview += 1;
  }

  return summary;
}

function buildEvidence(result) {
  if (!result.evidence) {
    return 'Local-only segment; verify against upstream release notes manually';
  }

  const parts = [
    `[repo doc](${result.evidence.repoDocUrl})`,
    `[published doc](${result.evidence.docsUrl})`,
  ];

  if (result.evidence.sourceUrl) {
    parts.push(`[source](${result.evidence.sourceUrl})`);
  }

  return parts.join(' · ');
}

function escapePipes(text) {
  return String(text).replace(/\|/g, '\\|');
}

function renderDriftRow(result) {
  const category = result.local?.category ?? result.upstream?.category ?? 'unknown';
  const differenceSummary = result.differences.length === 0
    ? 'none'
    : result.differences.map((difference) => difference.detail).join('; ');

  return `| ${result.type} | ${category} | ${result.status} | ${result.confidence} | ${escapePipes(differenceSummary)} | ${escapePipes(buildEvidence(result))} |`;
}

function renderChangeList(results, predicate) {
  const matching = results.filter(predicate);
  if (matching.length === 0) {
    return '- None';
  }

  return matching
    .map((result) => {
      const details = result.differences.map((difference) => difference.detail).join('; ');
      return `- \`${result.type}\` (${result.confidence}): ${details || result.status}. Evidence: ${buildEvidence(result)}`;
    })
    .join('\n');
}

function renderManualReview(results) {
  const matching = results.filter((result) => result.confidence === 'needs manual review' || result.ambiguity.length > 0);
  if (matching.length === 0) {
    return '- None';
  }

  return matching
    .map((result) => {
      const issues = [...result.ambiguity, ...result.differences.filter((difference) => difference.confidence === 'needs manual review').map((difference) => difference.detail)];
      const verification = result.evidence?.sourceUrl
        ? `Verify the docs and source template parity using ${buildEvidence(result)}.`
        : `Verify the upstream segment still exists and map it to the current official docs page.`;
      return `- \`${result.type}\`: ${issues.join('; ') || 'Manual verification required'}. ${verification}`;
    })
    .join('\n');
}

function segmentSort(left, right) {
  const leftCategoryIndex = CATEGORY_ORDER.indexOf(left.local?.category ?? left.upstream?.category ?? 'zz');
  const rightCategoryIndex = CATEGORY_ORDER.indexOf(right.local?.category ?? right.upstream?.category ?? 'zz');
  if (leftCategoryIndex !== rightCategoryIndex) {
    return leftCategoryIndex - rightCategoryIndex;
  }

  return left.type.localeCompare(right.type);
}

const CATEGORY_DEFAULT_COLORS = {
  system: '#546E7A',
  scm: '#4CAF50',
  languages: '#3776ab',
  cloud: '#5c6bc0',
  cli: '#455A64',
  web: '#00ACC1',
  music: '#7E57C2',
  health: '#E53935',
};

const CATEGORY_FALLBACK_ICONS = {
  system: 'dev-terminal',
  scm: 'vcs-git-branch',
  languages: 'lang-go',
  cloud: 'cloud-generic',
  cli: 'tool-wrench',
  web: 'ui-globe',
  music: 'misc-clock',
  health: 'health-heartbeat',
};

function buildAddedSegment(upstream) {
  return {
    type: upstream.type,
    name: upstream.name,
    description: `Synced from upstream docs for the ${upstream.type} segment.`,
    icon: CATEGORY_FALLBACK_ICONS[upstream.category] ?? 'tool-wrench',
    defaultTemplate: upstream.defaultTemplate,
    defaultForeground: '#ffffff',
    defaultBackground: CATEGORY_DEFAULT_COLORS[upstream.category] ?? '#455A64',
    previewText: upstream.name,
    properties: upstream.properties,
    options: upstream.options,
  };
}

async function applySafeFixes(results, localFileData) {
  const touchedCategories = new Set();
  const changedFiles = [];

  for (const result of results) {
    if (result.status !== 'changed' || result.confidence !== 'high confidence' || !result.local || !result.upstream) {
      continue;
    }

    if (result.differences.some((difference) => difference.field === 'defaultCache')) {
      continue;
    }

    const category = result.local.category;
    const fileInfo = localFileData.get(category);
    const target = fileInfo.segments.find((segment) => segment.type === result.type);
    if (!target) {
      continue;
    }

    target.defaultTemplate = result.upstream.defaultTemplate;
    target.properties = result.upstream.properties;
    target.options = result.upstream.options;
    touchedCategories.add(category);
  }

  for (const result of results) {
    if (result.status !== 'added-upstream' || !result.upstream) {
      continue;
    }

    const category = result.upstream.category;
    const fileInfo = localFileData.get(category);
    if (!fileInfo) {
      continue;
    }

    const alreadyExists = fileInfo.segments.some((segment) => segment.type === result.type);
    if (alreadyExists) {
      continue;
    }

    fileInfo.segments.push(buildAddedSegment(result.upstream));
    fileInfo.segments.sort((left, right) => left.type.localeCompare(right.type));
    touchedCategories.add(category);
  }

  for (const category of touchedCategories) {
    const fileInfo = localFileData.get(category);
    await fs.writeFile(fileInfo.filePath, `${stableStringify(fileInfo.segments)}\n`, 'utf8');
    changedFiles.push(path.relative(REPO_ROOT, fileInfo.filePath));
  }

  return changedFiles.sort();
}

function buildReport(args, source, summary, results, appliedChanges) {
  return `# Segment Upstream Sync Report

This report compares local segment metadata in \`public/segments/\` with official Oh My Posh sources using scope=\`${args.scope}\`, cadence=\`${args.cadence}\`, and strictness=\`${args.strictness}\`.

## Summary Metrics

- Local segments compared: ${summary.totalCompared}
- Unchanged: ${summary.unchanged}
- Changed: ${summary.changed}
- New upstream segments missing locally: ${summary.addedUpstream}
- Local segments not found upstream: ${summary.removedUpstream}
- High confidence classifications: ${summary.highConfidence}
- Medium confidence classifications: ${summary.mediumConfidence}
- Needs manual review: ${summary.manualReview}
- Documentation pages scanned: ${source.docPaths.length}

## Upstream Sources Used

- ${source.description}
- Upstream ref: ${args.upstreamRef}
- Official repository docs files: ${args.upstreamDir || `${getUpstreamUrls(args.upstreamRef).rawBaseUrl}/website/docs/segments/<category>/<segment>.mdx`}
- Official published docs: ${DOCS_BASE_URL}/<category>/<segment>
- Official source files when path mapping was available: ${args.upstreamDir || `${getUpstreamUrls(args.upstreamRef).rawBaseUrl}/src/segments/<segment>.go`}

## Drift Table

| Segment | Category | Status | Confidence | Drift | Evidence |
| --- | --- | --- | --- | --- | --- |
${results.map(renderDriftRow).join('\n')}

## Proposed Change Set

### Added

${renderChangeList(results, (result) => result.status === 'added-upstream')}

### Changed

${renderChangeList(results, (result) => result.status === 'changed')}

### Removed

${renderChangeList(results, (result) => result.status === 'removed-upstream')}

${args.strictness === 'report-and-fix' ? `## Applied Changes

${appliedChanges.length > 0 ? appliedChanges.map((file) => `- \`${file}\``).join('\n') : '- No files changed'}

` : ''}## Manual Review Queue

${renderManualReview(results)}

## Recurring Maintenance Checklist

- Trigger cadence: ${args.cadence}
- Commands to run: \`npm run segments:sync:upstream -- --scope=${args.scope} --cadence=${args.cadence} --strictness=${args.strictness}\`, then \`npm run validate\`
- Expected outputs: updated \`docs/segment-upstream-sync-report.md\`; when strictness is \`report-and-fix\`, high-confidence template/property/option updates in \`public/segments/*.json\`
- Rollback guidance: review \`git diff -- docs/segment-upstream-sync-report.md public/segments/*.json\`; revert only the touched report/segment files if the evidence is wrong or ambiguous
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { inventory: localInventory, fileData } = await loadLocalInventory();
  const { inventory: upstreamInventory, source } = await loadUpstreamInventory(args);
  const scopeTypes = args.scope === 'changed' ? await getChangedTypes(localInventory) : new Set([...localInventory.keys(), ...upstreamInventory.keys()]);
  const allTypes = [...new Set([...scopeTypes, ...upstreamInventory.keys()].filter((type) => args.scope === 'all' || scopeTypes.has(type)))];

  const results = allTypes
    .map((type) => compareSegment(type, localInventory.get(type), upstreamInventory.get(type)))
    .sort(segmentSort);

  const appliedChanges = args.strictness === 'report-and-fix'
    ? await applySafeFixes(results, fileData)
    : [];

  const summary = summarizeResults(results);
  const report = buildReport(args, source, summary, results, appliedChanges);
  await fs.writeFile(REPORT_PATH, report, 'utf8');

  const output = {
    args,
    summary,
    appliedChanges,
    reportPath: path.relative(REPO_ROOT, REPORT_PATH),
    upstreamPagesScanned: source.docPaths.length,
  };

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}