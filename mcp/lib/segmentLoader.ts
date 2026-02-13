/**
 * Segment Loader for MCP Server (Node.js environment)
 * Loads segment metadata from JSON files in the filesystem
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { SegmentMetadata, SegmentType, SegmentCategory } from '../../src/types/ohmyposh.js';

const SEGMENT_CATEGORIES: SegmentCategory[] = [
  'system',
  'scm',
  'languages',
  'cloud',
  'cli',
  'web',
  'music',
  'health',
];

// Cache for loaded segments
const segmentCache = new Map<SegmentCategory, SegmentMetadata[]>();

interface SegmentJSON {
  type: string;
  name: string;
  description: string;
  icon: string;
  defaultTemplate?: string;
  defaultForeground?: string;
  defaultBackground?: string;
  defaultCache?: {
    duration: string;
    strategy: 'session' | 'folder';
  };
  previewText?: string;
  properties?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  methods?: Array<{
    name: string;
    returnType: string;
    description: string;
  }>;
  options?: Array<{
    name: string;
    type: string;
    default?: unknown;
    values?: string[];
    description: string;
  }>;
}

/**
 * Load segments for a specific category from JSON file
 */
export async function loadSegmentCategory(
  category: SegmentCategory,
  segmentsDir: string
): Promise<SegmentMetadata[]> {
  // Return from cache if already loaded
  if (segmentCache.has(category)) {
    return segmentCache.get(category)!;
  }

  try {
    const filePath = join(segmentsDir, `${category}.json`);
    const content = await readFile(filePath, 'utf-8');
    const segments: SegmentJSON[] = JSON.parse(content);

    const segmentMetadata: SegmentMetadata[] = segments.map((segment) => ({
      ...segment,
      type: segment.type as SegmentType,
      category,
      defaultBackground: segment.defaultBackground || '#61AFEF',
      defaultForeground: segment.defaultForeground || '#ffffff',
    }));

    // Cache the result
    segmentCache.set(category, segmentMetadata);

    return segmentMetadata;
  } catch (error) {
    console.error(`Error loading ${category} segments:`, error);
    return [];
  }
}

/**
 * Load all segments from all categories
 */
export async function loadAllSegments(segmentsDir: string): Promise<SegmentMetadata[]> {
  const allSegments = await Promise.all(
    SEGMENT_CATEGORIES.map((category) => loadSegmentCategory(category, segmentsDir))
  );

  return allSegments.flat();
}

/**
 * Get segment metadata by type
 */
export function getSegmentMetadata(type: string): SegmentMetadata | undefined {
  // Search through all cached segments
  for (const segments of segmentCache.values()) {
    const found = segments.find((s) => s.type === type);
    if (found) return found;
  }
  return undefined;
}

/**
 * Get all segment categories
 */
export function getSegmentCategories(): readonly SegmentCategory[] {
  return SEGMENT_CATEGORIES;
}

/**
 * Get segments by category from cache
 */
export function getSegmentsByCategory(category: SegmentCategory): SegmentMetadata[] {
  return segmentCache.get(category) || [];
}

/**
 * Search segments by name or type
 */
export function searchSegments(query: string): SegmentMetadata[] {
  const lowerQuery = query.toLowerCase();
  const results: SegmentMetadata[] = [];

  for (const segments of segmentCache.values()) {
    for (const segment of segments) {
      if (
        segment.type.toLowerCase().includes(lowerQuery) ||
        segment.name.toLowerCase().includes(lowerQuery) ||
        segment.description.toLowerCase().includes(lowerQuery)
      ) {
        results.push(segment);
      }
    }
  }

  return results;
}

/**
 * Clear the segment cache
 */
export function clearSegmentCache(): void {
  segmentCache.clear();
}
