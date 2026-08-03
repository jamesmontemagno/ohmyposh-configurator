import type { SegmentMetadata } from '../../src/types/ohmyposh.js';

const DOCS_BASE_URL = 'https://ohmyposh.dev/docs/segments';

const DOCS_PATH_OVERRIDES: Record<string, string> = {
  copilot_cli: 'cli/copilot-cli',
  gitversion: 'cli/gitversion',
  go: 'languages/golang',
  kubectl: 'cli/kubectl',
  terraform: 'cli/terraform',
  winget: 'system/winget',
  winreg: 'system/winreg',
};

export function getSegmentDocumentationUrl(segment: Pick<SegmentMetadata, 'type' | 'category'>): string {
  const path = DOCS_PATH_OVERRIDES[segment.type] ?? `${segment.category}/${segment.type}`;
  return `${DOCS_BASE_URL}/${path}`;
}
