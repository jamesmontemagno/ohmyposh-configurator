import { describe, it, expect } from 'vitest';
import {
  isPaletteReference,
  getPaletteKey,
  isNamedColor,
  isContextDependentColor,
  isHexColor,
  getActivePalette,
  getAllPaletteKeys,
  resolvePaletteColor,
  resolveInlineColors,
} from '../paletteResolver';
import type { OhMyPoshConfig } from '../../types/ohmyposh';

describe('isPaletteReference', () => {
  it('should return true for valid p:key pattern', () => {
    expect(isPaletteReference('p:foreground')).toBe(true);
    expect(isPaletteReference('p:my-color')).toBe(true);
    expect(isPaletteReference('p:text_light')).toBe(true);
    expect(isPaletteReference('p:color123')).toBe(true);
  });

  it('should return false for invalid patterns', () => {
    expect(isPaletteReference('#ffffff')).toBe(false);
    expect(isPaletteReference('red')).toBe(false);
    expect(isPaletteReference('p:')).toBe(false);
    expect(isPaletteReference('p')).toBe(false);
    expect(isPaletteReference('palette:color')).toBe(false);
  });

  it('should return false for empty or undefined', () => {
    expect(isPaletteReference('')).toBe(false);
    expect(isPaletteReference(undefined)).toBe(false);
  });
});

describe('getPaletteKey', () => {
  it('should extract key from valid reference', () => {
    expect(getPaletteKey('p:foreground')).toBe('foreground');
    expect(getPaletteKey('p:my-color')).toBe('my-color');
    expect(getPaletteKey('p:text_light')).toBe('text_light');
  });

  it('should return null for invalid reference', () => {
    expect(getPaletteKey('#ffffff')).toBeNull();
    expect(getPaletteKey('red')).toBeNull();
    expect(getPaletteKey('')).toBeNull();
  });
});

describe('isNamedColor', () => {
  it('should return true for valid CSS named colors', () => {
    expect(isNamedColor('red')).toBe(true);
    expect(isNamedColor('blue')).toBe(true);
    expect(isNamedColor('green')).toBe(true);
  });

  it('should be case insensitive', () => {
    expect(isNamedColor('RED')).toBe(true);
    expect(isNamedColor('Red')).toBe(true);
    expect(isNamedColor('rEd')).toBe(true);
  });

  it('should return false for invalid names', () => {
    expect(isNamedColor('notacolor')).toBe(false);
    expect(isNamedColor('#ffffff')).toBe(false);
    expect(isNamedColor('p:color')).toBe(false);
  });

  it('should return false for empty or undefined', () => {
    expect(isNamedColor('')).toBe(false);
    expect(isNamedColor(undefined)).toBe(false);
  });
});

describe('isContextDependentColor', () => {
  it('should return true for context-dependent colors', () => {
    expect(isContextDependentColor('parentBackground')).toBe(true);
    expect(isContextDependentColor('parentForeground')).toBe(true);
    expect(isContextDependentColor('background')).toBe(true);
    expect(isContextDependentColor('foreground')).toBe(true);
    expect(isContextDependentColor('accent')).toBe(true);
  });

  it('should return false for regular colors', () => {
    expect(isContextDependentColor('#ffffff')).toBe(false);
    expect(isContextDependentColor('red')).toBe(false);
    expect(isContextDependentColor('p:color')).toBe(false);
  });

  it('should return false for empty or undefined', () => {
    expect(isContextDependentColor('')).toBe(false);
    expect(isContextDependentColor(undefined)).toBe(false);
  });
});

describe('isHexColor', () => {
  it('should return true for valid #RGB format', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('#FFF')).toBe(true);
    expect(isHexColor('#abc')).toBe(true);
  });

  it('should return true for valid #RRGGBB format', () => {
    expect(isHexColor('#ffffff')).toBe(true);
    expect(isHexColor('#FFFFFF')).toBe(true);
    expect(isHexColor('#123abc')).toBe(true);
  });

  it('should return true for valid #RRGGBBAA format', () => {
    expect(isHexColor('#ffffffff')).toBe(true);
    expect(isHexColor('#12345678')).toBe(true);
  });

  it('should return false for invalid formats', () => {
    expect(isHexColor('ffffff')).toBe(false);
    expect(isHexColor('#ff')).toBe(false);
    expect(isHexColor('#fffff')).toBe(false);
    expect(isHexColor('#fffffffff')).toBe(false);
    expect(isHexColor('red')).toBe(false);
  });

  it('should return false for empty or undefined', () => {
    expect(isHexColor('')).toBe(false);
    expect(isHexColor(undefined)).toBe(false);
  });
});

describe('getActivePalette', () => {
  it('should return base palette when no variant selected', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      palette: { color1: '#fff', color2: '#000' },
    };
    expect(getActivePalette(config)).toEqual({ color1: '#fff', color2: '#000' });
  });

  it('should merge selected palette with base palette', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      palette: { color1: '#fff', color2: '#000' },
      palettes: {
        list: {
          dark: { color1: '#111', color3: '#333' },
        },
      },
    };
    expect(getActivePalette(config, 'dark')).toEqual({
      color1: '#111', // Overridden
      color2: '#000', // From base
      color3: '#333', // From variant
    });
  });

  it('should return base palette when variant not found', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      palette: { color1: '#fff' },
      palettes: {
        list: {
          dark: { color1: '#111' },
        },
      },
    };
    expect(getActivePalette(config, 'nonexistent')).toEqual({ color1: '#fff' });
  });

  it('should return empty object when no palette defined', () => {
    const config: OhMyPoshConfig = { blocks: [] };
    expect(getActivePalette(config)).toEqual({});
  });
});

describe('getAllPaletteKeys', () => {
  it('should return keys from base palette only', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      palette: { color1: '#fff', color2: '#000' },
    };
    expect(getAllPaletteKeys(config).sort()).toEqual(['color1', 'color2']);
  });

  it('should return merged keys from base and variants', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      palette: { color1: '#fff', color2: '#000' },
      palettes: {
        list: {
          dark: { color3: '#111' },
          light: { color4: '#eee' },
        },
      },
    };
    expect(getAllPaletteKeys(config).sort()).toEqual(['color1', 'color2', 'color3', 'color4']);
  });

  it('should deduplicate keys', () => {
    const config: OhMyPoshConfig = {
      blocks: [],
      palette: { color1: '#fff' },
      palettes: {
        list: {
          dark: { color1: '#111' }, // Same key as base
        },
      },
    };
    expect(getAllPaletteKeys(config)).toEqual(['color1']);
  });

  it('should return empty array when no palette defined', () => {
    const config: OhMyPoshConfig = { blocks: [] };
    expect(getAllPaletteKeys(config)).toEqual([]);
  });
});

describe('resolvePaletteColor', () => {
  const palette = {
    primary: '#ff0000',
    secondary: 'blue',
    ref: 'p:primary',
  };

  it('should resolve direct hex color', () => {
    const result = resolvePaletteColor('#ffffff', palette);
    expect(result.color).toBe('#ffffff');
    expect(result.isContextDependent).toBe(false);
    expect(result.isUnresolved).toBe(false);
  });

  it('should resolve named color', () => {
    const result = resolvePaletteColor('red', palette);
    expect(result.color).toBe('#ff0000');
    expect(result.isContextDependent).toBe(false);
    expect(result.isUnresolved).toBe(false);
  });

  it('should resolve palette reference', () => {
    const result = resolvePaletteColor('p:primary', palette);
    expect(result.color).toBe('#ff0000');
    expect(result.isContextDependent).toBe(false);
    expect(result.isUnresolved).toBe(false);
  });

  it('should resolve palette reference to named color', () => {
    const result = resolvePaletteColor('p:secondary', palette);
    expect(result.color).toBe('#0000ff'); // blue -> hex
    expect(result.isContextDependent).toBe(false);
    expect(result.isUnresolved).toBe(false);
  });

  it('should resolve recursive palette references', () => {
    const result = resolvePaletteColor('p:ref', palette);
    expect(result.color).toBe('#ff0000');
    expect(result.isContextDependent).toBe(false);
    expect(result.isUnresolved).toBe(false);
  });

  it('should identify context-dependent colors', () => {
    const result = resolvePaletteColor('parentBackground', palette);
    expect(result.color).toBeNull();
    expect(result.isContextDependent).toBe(true);
    expect(result.isUnresolved).toBe(false);
  });

  it('should mark unresolved palette references', () => {
    const result = resolvePaletteColor('p:nonexistent', palette);
    expect(result.color).toBeNull();
    expect(result.isContextDependent).toBe(false);
    expect(result.isUnresolved).toBe(true);
    expect(result.error).toContain('nonexistent');
  });

  it('should handle transparent color', () => {
    const result = resolvePaletteColor('transparent', palette);
    expect(result.color).toBe('transparent');
    expect(result.isContextDependent).toBe(false);
    expect(result.isUnresolved).toBe(false);
  });

  it('should handle empty or undefined input', () => {
    expect(resolvePaletteColor('', palette).color).toBeNull();
    expect(resolvePaletteColor(undefined, palette).color).toBeNull();
  });
});

describe('resolveInlineColors', () => {
  const palette = {
    primary: '#ff0000',
    secondary: 'blue',
  };

  it('should resolve palette references in inline text', () => {
    expect(resolveInlineColors('<p:primary>', palette)).toBe('<#ff0000>');
  });

  it('should resolve named colors in palette to hex', () => {
    expect(resolveInlineColors('<p:secondary>', palette)).toBe('<#0000ff>');
  });

  it('should handle multiple inline colors', () => {
    expect(resolveInlineColors('<p:primary>text<p:secondary>', palette)).toBe(
      '<#ff0000>text<#0000ff>'
    );
  });

  it('should leave hex colors unchanged', () => {
    expect(resolveInlineColors('<#ffffff>', palette)).toBe('<#ffffff>');
  });

  it('should leave unresolved palette keys unchanged', () => {
    expect(resolveInlineColors('<p:nonexistent>', palette)).toBe('<p:nonexistent>');
  });

  it('should handle text without inline colors', () => {
    expect(resolveInlineColors('plain text', palette)).toBe('plain text');
  });
});
