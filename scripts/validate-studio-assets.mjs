import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const studioDirectory = resolve('public', 'studio');
const manifestPath = resolve(studioDirectory, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

if (!manifest.assets || typeof manifest.assets !== 'object') {
  throw new Error('Studio manifest must define an assets object');
}

let totalBytes = 0;

for (const [name, expected] of Object.entries(manifest.assets)) {
  const assetPath = resolve(studioDirectory, name);
  const file = await readFile(assetPath);
  const fileStat = await stat(assetPath);
  const sha256 = createHash('sha256').update(file).digest('hex');

  if (fileStat.size !== expected.bytes) {
    throw new Error(
      `${name} size mismatch: expected ${expected.bytes}, received ${fileStat.size}`
    );
  }

  if (sha256 !== expected.sha256) {
    throw new Error(
      `${name} checksum mismatch: expected ${expected.sha256}, received ${sha256}`
    );
  }

  totalBytes += fileStat.size;
}

if (totalBytes !== manifest.totalBytes) {
  throw new Error(
    `Studio asset total mismatch: expected ${manifest.totalBytes}, received ${totalBytes}`
  );
}

console.log(
  `Validated ${Object.keys(manifest.assets).length} Studio assets ` +
    `(${(totalBytes / 1024 / 1024).toFixed(1)} MB, Oh My Posh ${manifest.ohMyPoshVersion})`
);
