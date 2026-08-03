import { describe, expect, it } from 'vitest';
import { getSegmentDocumentationUrl } from '../segmentDocs.js';

describe('getSegmentDocumentationUrl', () => {
  it('uses the segment category for standard documentation paths', () => {
    expect(
      getSegmentDocumentationUrl({ type: 'git', category: 'scm' })
    ).toBe('https://ohmyposh.dev/docs/segments/scm/git');
  });

  it('uses an official path override when metadata categories differ', () => {
    expect(
      getSegmentDocumentationUrl({ type: 'terraform', category: 'cloud' })
    ).toBe('https://ohmyposh.dev/docs/segments/cli/terraform');
  });

  it('uses an official name override when the runtime type differs', () => {
    expect(
      getSegmentDocumentationUrl({ type: 'copilot_cli', category: 'cli' })
    ).toBe('https://ohmyposh.dev/docs/segments/cli/copilot-cli');
  });
});
