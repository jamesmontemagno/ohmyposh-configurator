import type { SegmentMetadata } from '../types/ohmyposh';
import { getSegmentColors } from '../data/colorSchemes';

const SEGMENT_CATEGORIES = ['system', 'scm', 'languages', 'cloud', 'cli', 'web', 'music', 'health'] as const;
type SegmentCategory = typeof SEGMENT_CATEGORIES[number];

interface SegmentJSON {
  type: string;
  name: string;
  description: string;
  icon: string;
  defaultTemplate: string;
}

// Cache for loaded segments
const segmentCache = new Map<SegmentCategory, SegmentMetadata[]>();

// Track loading state and subscribers
let isLoaded = false;
const subscribers = new Set<() => void>();

/**
 * Subscribe to segment loading completion
 * Returns an unsubscribe function
 */
export function subscribeToSegmentLoad(callback: () => void): () => void {
  subscribers.add(callback);
  // If already loaded, call immediately
  if (isLoaded) {
    callback();
  }
  return () => subscribers.delete(callback);
}

/**
 * Notify all subscribers that segments have been loaded
 */
function notifySubscribers(): void {
  subscribers.forEach(callback => callback());
}

/**
 * Load segments for a specific category from JSON file
 */
export async function loadSegmentCategory(category: SegmentCategory): Promise<SegmentMetadata[]> {
  // Return from cache if already loaded
  if (segmentCache.has(category)) {
    return segmentCache.get(category)!;
  }

  try {
    const response = await fetch(`/ohmyposh-configurator/segments/${category}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${category} segments: ${response.statusText}`);
    }

    const segments: SegmentJSON[] = await response.json();
    
    // Transform JSON to SegmentMetadata with colors
    const segmentMetadata: SegmentMetadata[] = segments.map(segment => ({
      ...segment,
      type: segment.type as any, // Type will be validated by Oh My Posh
      category,
      ...getSegmentColors(segment.type, category),
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
export async function loadAllSegments(): Promise<SegmentMetadata[]> {
  const allSegments = await Promise.all(
    SEGMENT_CATEGORIES.map(category => loadSegmentCategory(category))
  );
  
  isLoaded = true;
  notifySubscribers();
  
  return allSegments.flat();
}

/**
 * Preload all segment categories in parallel
 */
export function preloadSegments(): Promise<SegmentMetadata[]> {
  // Return existing promise if already loading
  if (isLoaded) {
    return Promise.resolve(Array.from(segmentCache.values()).flat());
  }
  
  // Start loading and return promise
  return loadAllSegments();
}

/**
 * Get segment categories list
 */
export function getSegmentCategories(): readonly SegmentCategory[] {
  return SEGMENT_CATEGORIES;
}

/**
 * Clear the segment cache (useful for testing or refresh)
 */
export function clearSegmentCache(): void {
  segmentCache.clear();
}

/**
 * Get segment metadata by type (searches all loaded categories)
 * Note: This will only return segments from categories that have been loaded
 */
export function getSegmentMetadata(type: string): SegmentMetadata | undefined {
  // Search through all cached segments
  for (const segments of segmentCache.values()) {
    const found = segments.find(s => s.type === type);
    if (found) return found;
  }
  return undefined;
}

/**
 * Get segments by category (returns cached segments if available)
 */
export function getSegmentsByCategory(category: string): SegmentMetadata[] {
  return segmentCache.get(category as SegmentCategory) || [];
}

/**
 * Check if segments are loaded
 */
export function areSegmentsLoaded(): boolean {
  return isLoaded;
}
