import { describe, expect, it } from 'vitest';
import { extractDocPageId, extractRuntimeType, extractSampleConfigurationValue } from './segment-upstream-sync.mjs';

describe('segment upstream sync identifiers', () => {
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
