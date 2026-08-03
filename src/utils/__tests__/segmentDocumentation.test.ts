import { describe, expect, it } from 'vitest';
import { getSegmentDocumentationUrl } from '../segmentDocumentation';

describe('getSegmentDocumentationUrl', () => {
  it('uses the segment category for standard documentation paths', () => {
    expect(getSegmentDocumentationUrl('git', 'scm')).toBe(
      'https://ohmyposh.dev/docs/segments/scm/git',
    );
  });

  it('falls back to the segment documentation index while metadata loads', () => {
    expect(getSegmentDocumentationUrl('git')).toBe('https://ohmyposh.dev/docs/segments');
  });

  it.each([
    ['copilot_cli', 'cli', 'cli/copilot-cli'],
    ['gitversion', 'scm', 'cli/gitversion'],
    ['go', 'languages', 'languages/golang'],
    ['kubectl', 'cloud', 'cli/kubectl'],
    ['terraform', 'cloud', 'cli/terraform'],
    ['winreg', 'web', 'system/winreg'],
  ] as const)('uses the official path for %s', (type, category, documentationPath) => {
    expect(getSegmentDocumentationUrl(type, category)).toBe(
      `https://ohmyposh.dev/docs/segments/${documentationPath}`,
    );
  });
});
