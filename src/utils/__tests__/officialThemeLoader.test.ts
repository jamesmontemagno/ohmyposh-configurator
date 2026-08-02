import { describe, expect, it } from 'vitest';
import { getThemePreviewUrl, type OfficialTheme } from '../officialThemeLoader';

const theme: OfficialTheme = {
  name: 'agnoster',
  file: 'agnoster.omp.json',
  isMinimal: false,
  tags: ['powerline'],
  githubUrl: 'https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/themes/agnoster.omp.json',
};

describe('getThemePreviewUrl', () => {
  it('uses the deployed base path for a local preview image', () => {
    expect(getThemePreviewUrl({
      ...theme,
      imageUrl: 'configs/official/previews/agnoster.png',
    })).toBe('/configs/official/previews/agnoster.png');
  });

  it('returns undefined when a theme has no preserved preview image', () => {
    expect(getThemePreviewUrl(theme)).toBeUndefined();
  });
});
