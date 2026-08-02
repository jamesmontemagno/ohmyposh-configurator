import { describe, expect, it } from 'vitest';
import { getConfigPreviewUrl } from '../configLoader';
import { getThemePreviewUrl } from '../officialThemeLoader';

describe('theme preview URLs', () => {
  it('maps an official JSON theme to its generated SVG', () => {
    expect(getThemePreviewUrl('agnoster.omp.json')).toBe(
      '/configs/official/previews/agnoster.svg'
    );
  });

  it('maps an official YAML theme to its generated SVG', () => {
    expect(getThemePreviewUrl('devious-diamonds.omp.yaml')).toBe(
      '/configs/official/previews/devious-diamonds.svg'
    );
  });

  it('maps local configuration categories to their generated SVGs', () => {
    expect(getConfigPreviewUrl('samples', 'developer-pro.json')).toBe(
      '/configs/samples/previews/developer-pro.svg'
    );
    expect(getConfigPreviewUrl('community', 'dotnet-azure-developer.json')).toBe(
      '/configs/community/previews/dotnet-azure-developer.svg'
    );
  });
});
