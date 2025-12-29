import { useEffect, useState } from 'react';
import { getSegmentMetadata, subscribeToSegmentLoad, areSegmentsLoaded } from '../utils/segmentLoader';
import type { SegmentMetadata } from '../types/ohmyposh';

/**
 * Hook to get segment metadata with automatic re-render when segments load
 */
export function useSegmentMetadata(type: string): SegmentMetadata | undefined {
  const [metadata, setMetadata] = useState<SegmentMetadata | undefined>(() => getSegmentMetadata(type));
  const [, setSegmentsLoaded] = useState(areSegmentsLoaded());

  useEffect(() => {
    // Subscribe to segment loading
    const unsubscribe = subscribeToSegmentLoad(() => {
      setSegmentsLoaded(true);
      setMetadata(getSegmentMetadata(type));
    });

    // Update metadata if segments are already loaded
    if (areSegmentsLoaded()) {
      setMetadata(getSegmentMetadata(type));
    }

    return unsubscribe;
  }, [type]);

  return metadata;
}
