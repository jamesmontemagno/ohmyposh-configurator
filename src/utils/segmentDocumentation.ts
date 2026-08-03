import type { SegmentCategory, SegmentType } from '../types/ohmyposh';

const DOCUMENTATION_BASE_URL = 'https://ohmyposh.dev/docs/segments';

const documentationPathOverrides: Partial<Record<SegmentType, string>> = {
  copilot_cli: 'cli/copilot-cli',
  gitversion: 'cli/gitversion',
  go: 'languages/golang',
  kubectl: 'cli/kubectl',
  terraform: 'cli/terraform',
  winreg: 'system/winreg',
};

/**
 * Returns the published documentation URL for a configured segment.
 * A few documentation pages live outside the configurator's display category.
 */
export function getSegmentDocumentationUrl(
  type: SegmentType,
  category?: SegmentCategory,
): string {
  if (!category && !documentationPathOverrides[type]) {
    return DOCUMENTATION_BASE_URL;
  }

  const documentationPath = documentationPathOverrides[type] ?? `${category}/${type}`;
  return `${DOCUMENTATION_BASE_URL}/${documentationPath}`;
}
