import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractDocPageId, extractRuntimeType, extractSampleConfigurationValue, loadUpstreamInventory } from './segment-upstream-sync.mjs';

describe('segment upstream sync identifiers', () => {
  it('retains moved agent types and discovers new ones without changing display categories', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'segment-agent-docs-'));
    try {
      const docs = join(directory, 'website/docs/segments/agents');
      await mkdir(docs, { recursive: true });
      for (const type of ['claude', 'copilot', 'copilot_cli', 'antigravity']) {
        const page = type.replace('_', '-');
        await writeFile(join(docs, `${page}.mdx`), `---
id: ${page}
---
## Sample Configuration
<Config data={{ type: "${type}" }} />
`);
      }
      const { inventory } = await loadUpstreamInventory({ upstreamDir: directory });
      expect([...inventory.keys()].sort()).toEqual(['antigravity', 'claude', 'copilot', 'copilot_cli']);
      for (const entry of inventory.values()) {
        expect(entry.category).toBe('cli');
        expect(entry.evidence.repoDocPath).toContain('/agents/');
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('uses the documented configuration type instead of the page ID', () => {
    const content = `---
id: copilot-cli
---

## Sample Configuration

<Config data={{
  type: "copilot_cli",
}} />`;

    expect(extractDocPageId(content, 'website/docs/segments/cli/copilot-cli.mdx')).toBe('copilot-cli');
    expect(extractRuntimeType(content, 'copilot-cli')).toBe('copilot_cli');
  });

  it('uses the page ID when a document has no sample configuration', () => {
    const content = `---
id: overview
---`;

    expect(extractRuntimeType(content, extractDocPageId(content, 'website/docs/segments/overview.mdx'))).toBe('overview');
  });

  it('extracts documented foreground and background defaults', () => {
    const content = `## Sample Configuration

<Config data={{
  foreground: "#111111",
  background: "#fee898",
}} />`;

    expect(extractSampleConfigurationValue(content, 'foreground')).toBe('#111111');
    expect(extractSampleConfigurationValue(content, 'background')).toBe('#fee898');
  });
});
