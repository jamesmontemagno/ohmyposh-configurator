import type { SegmentMetadata } from '../../src/types/ohmyposh.js';

const SEGMENT_ALIASES: Record<string, readonly string[]> = {
  az: ['azure'],
  azfunc: ['azure functions'],
  azd: ['azure developer cli'],
  dotnet: ['.net', 'c#', 'csharp'],
  gcp: ['google cloud'],
  go: ['golang'],
  kubectl: ['kubernetes', 'k8s'],
  node: ['javascript', 'typescript'],
};

function containsTerm(description: string, term: string): boolean {
  const normalizedTerm = term.trim().toLowerCase();
  if (normalizedTerm.length < 2) return false;

  const escapedTerm = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escapedTerm}(?=$|[^a-z0-9])`, 'i').test(description);
}

export function inferSegmentsFromDescription(
  description: string,
  availableSegments: readonly SegmentMetadata[]
): string[] {
  const inferred = new Set<string>();
  const availableTypes = new Set(availableSegments.map((segment) => segment.type));

  if (availableTypes.has('path')) inferred.add('path');

  for (const segment of availableSegments) {
    const terms = [segment.type, segment.name, ...(SEGMENT_ALIASES[segment.type] ?? [])];
    if (terms.some((term) => containsTerm(description, term))) {
      inferred.add(segment.type);
    }
  }

  if (availableTypes.has('status')) inferred.add('status');
  return [...inferred];
}
