import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));
const projectRoot = resolve(__dirname, '..');
const officialManifestPath = join(projectRoot, 'public', 'configs', 'official', 'manifest.json');
const segmentDataPath = join(projectRoot, 'public', 'studio', 'segment_data.json');
const renderer = process.env.OMP_BIN || 'oh-my-posh';
const categories = ['samples', 'community'];
const concurrency = 8;

function previewFileName(filename) {
  return basename(filename).replace(/\.omp\.(json|yaml|yml)$/, '').replace(/\.json$/, '') + '.svg';
}

async function run(command, args) {
  await execFileAsync(command, args, { cwd: projectRoot });
}

async function cleanPreviews(directory) {
  await mkdir(directory, { recursive: true });
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.svg'))
      .map((entry) => rm(join(directory, entry.name)))
  );
}

async function renderPreview(configPath, outputPath) {
  await run(renderer, [
    'config',
    'export',
    'image',
    `--config=${configPath}`,
    `--output=${outputPath}`,
    '--terminal-width=80',
    '--font-family=Victor Mono',
    '--cell-width=0.5455',
    '--line-height=1.6909',
    '--fill-ascent=1.0982',
    '--fill-descent=0.3255',
    '--background-color=#1e1e1e',
    `--data=${segmentDataPath}`,
    '--data-only',
  ]);

  const svg = await readFile(outputPath, 'utf8');
  if (!svg.startsWith('<svg')) {
    throw new Error(
      'Oh My Posh did not produce SVG output. Use Oh My Posh v30.0.0 or newer via OMP_BIN.'
    );
  }

}

async function mapInBatches(entries, callback) {
  const results = [];

  for (let start = 0; start < entries.length; start += concurrency) {
    const batch = await Promise.all(entries.slice(start, start + concurrency).map(callback));
    results.push(...batch);
  }

  return results;
}

async function renderInBatches(entries) {
  await mapInBatches(entries, async (entry) => {
    await renderPreview(entry.configPath, entry.outputPath);
    console.log(`Rendered ${entry.label}`);
  });
}

async function getLocalEntries(category) {
  const configDirectory = join(projectRoot, 'public', 'configs', category);
  const manifest = JSON.parse(await readFile(join(configDirectory, 'manifest.json'), 'utf8'));
  const previewDirectory = join(configDirectory, 'previews');

  await cleanPreviews(previewDirectory);

  return manifest.configs.map((config) => ({
    label: `${category}/${config.file}`,
    configPath: join(configDirectory, config.file),
    outputPath: join(previewDirectory, previewFileName(config.file)),
  }));
}

async function getOfficialEntries(temporaryDirectory) {
  await run(process.execPath, [join(projectRoot, 'scripts', 'fetch-official-themes.mjs')]);

  const manifest = JSON.parse(await readFile(officialManifestPath, 'utf8'));
  const previewDirectory = join(projectRoot, 'public', 'configs', 'official', 'previews');
  await cleanPreviews(previewDirectory);

  return mapInBatches(manifest.themes, async (theme) => {
    const response = await fetch(
      `https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/${theme.file}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch official theme ${theme.file}: ${response.status}`);
    }

    const configPath = join(temporaryDirectory, theme.file);
    await writeFile(configPath, await response.text());

    return {
      label: `official/${theme.file}`,
      configPath,
      outputPath: join(previewDirectory, previewFileName(theme.file)),
    };
  });
}

async function main() {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'oh-my-posh-theme-previews-'));

  try {
    const localEntries = (await Promise.all(categories.map(getLocalEntries))).flat();
    const officialEntries = await getOfficialEntries(temporaryDirectory);

    await renderInBatches([...localEntries, ...officialEntries]);
    console.log(`Generated ${localEntries.length + officialEntries.length} SVG theme previews.`);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`Failed to generate theme previews: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
