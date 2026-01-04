import { describe, it, expect } from 'vitest';
import {
  getSegmentColors,
  categoryColors,
  segmentColorOverrides,
} from '../colorSchemes';

describe('getSegmentColors', () => {
  it('should return override colors when segment has specific override', () => {
    // git has a specific override
    const colors = getSegmentColors('git', 'scm');
    expect(colors).toEqual(segmentColorOverrides.git);
    expect(colors.background).toBe('#98C379');
    expect(colors.foreground).toBe('#ffffff');
  });

  it('should return category colors when no override exists', () => {
    // 'fossil' is an scm segment without override
    const colors = getSegmentColors('fossil', 'scm');
    expect(colors).toEqual(categoryColors.scm);
    expect(colors.background).toBe('#98C379');
    expect(colors.foreground).toBe('#ffffff');
  });

  it('should return python override colors', () => {
    const colors = getSegmentColors('python', 'languages');
    expect(colors).toEqual(segmentColorOverrides.python);
    expect(colors.background).toBe('#4B8BBE');
    expect(colors.foreground).toBe('#FFD43B');
  });

  it('should return category colors for language without override', () => {
    // 'lua' is a language without specific override
    const colors = getSegmentColors('lua', 'languages');
    expect(colors).toEqual(categoryColors.languages);
    expect(colors.background).toBe('#C678DD');
    expect(colors.foreground).toBe('#ffffff');
  });

  it('should return system category colors', () => {
    const colors = getSegmentColors('os', 'system');
    expect(colors).toEqual(categoryColors.system);
  });

  it('should return cloud category colors', () => {
    const colors = getSegmentColors('pulumi', 'cloud');
    expect(colors).toEqual(categoryColors.cloud);
  });

  it('should return cli category colors', () => {
    const colors = getSegmentColors('helm', 'cli');
    expect(colors).toEqual(categoryColors.cli);
  });

  it('should return web category colors', () => {
    const colors = getSegmentColors('http', 'web');
    expect(colors).toEqual(categoryColors.web);
  });

  it('should return music category colors', () => {
    const colors = getSegmentColors('lastfm', 'music');
    expect(colors).toEqual(categoryColors.music);
  });

  it('should return health category colors', () => {
    const colors = getSegmentColors('withings', 'health');
    expect(colors).toEqual(categoryColors.health);
  });

  it('should prioritize override over category', () => {
    // aws has override, verify it takes precedence over cloud category
    const colors = getSegmentColors('aws', 'cloud');
    expect(colors).toEqual(segmentColorOverrides.aws);
    expect(colors.background).toBe('#FF9900');
    expect(colors.foreground).toBe('#232F3E');
  });
});

describe('categoryColors', () => {
  it('should have all expected categories defined', () => {
    expect(categoryColors).toHaveProperty('system');
    expect(categoryColors).toHaveProperty('scm');
    expect(categoryColors).toHaveProperty('languages');
    expect(categoryColors).toHaveProperty('cloud');
    expect(categoryColors).toHaveProperty('cli');
    expect(categoryColors).toHaveProperty('web');
    expect(categoryColors).toHaveProperty('music');
    expect(categoryColors).toHaveProperty('health');
  });

  it('should have background and foreground for each category', () => {
    Object.values(categoryColors).forEach((colors) => {
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('foreground');
      expect(typeof colors.background).toBe('string');
      expect(typeof colors.foreground).toBe('string');
    });
  });
});

describe('segmentColorOverrides', () => {
  it('should have background and foreground for each override', () => {
    Object.values(segmentColorOverrides).forEach((colors) => {
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('foreground');
      expect(typeof colors.background).toBe('string');
      expect(typeof colors.foreground).toBe('string');
    });
  });

  it('should have expected overrides for common segments', () => {
    expect(segmentColorOverrides).toHaveProperty('git');
    expect(segmentColorOverrides).toHaveProperty('path');
    expect(segmentColorOverrides).toHaveProperty('node');
    expect(segmentColorOverrides).toHaveProperty('python');
    expect(segmentColorOverrides).toHaveProperty('docker');
  });
});
