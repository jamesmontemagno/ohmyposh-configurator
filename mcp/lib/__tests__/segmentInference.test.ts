import { describe, expect, it } from 'vitest';
import { inferSegmentsFromDescription } from '../segmentInference.js';
import type { SegmentMetadata } from '../../../src/types/ohmyposh.js';

const segments: SegmentMetadata[] = [
  { type: 'path', name: 'Path', description: '', category: 'system', icon: '' },
  { type: 'status', name: 'Status', description: '', category: 'system', icon: '' },
  { type: 'gradle', name: 'Gradle', description: '', category: 'cli', icon: '' },
  { type: 'az', name: 'Azure', description: '', category: 'cloud', icon: '' },
  { type: 'go', name: 'Go', description: '', category: 'languages', icon: '' },
];

describe('inferSegmentsFromDescription', () => {
  it('includes a catalog segment outside the old hard-coded keyword list', () => {
    expect(inferSegmentsFromDescription('Create a Gradle prompt', segments)).toEqual([
      'path',
      'gradle',
      'status',
    ]);
  });

  it('matches configured aliases without matching a substring', () => {
    expect(inferSegmentsFromDescription('An Azure service in Golang', segments)).toEqual([
      'path',
      'az',
      'go',
      'status',
    ]);
    expect(inferSegmentsFromDescription('Configure a prompt', segments)).toEqual([
      'path',
      'status',
    ]);
  });
});
