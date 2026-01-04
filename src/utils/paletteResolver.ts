import type { OhMyPoshConfig } from '../types/ohmyposh';

/**
 * CSS named colors supported by Oh My Posh
 * Maps to their hex equivalents for preview rendering
 */
export const NAMED_COLORS: Record<string, string> = {
  // Standard CSS colors
  black: '#000000',
  silver: '#c0c0c0',
  gray: '#808080',
  grey: '#808080',
  white: '#ffffff',
  maroon: '#800000',
  red: '#ff0000',
  purple: '#800080',
  fuchsia: '#ff00ff',
  magenta: '#ff00ff',
  green: '#008000',
  lime: '#00ff00',
  olive: '#808000',
  yellow: '#ffff00',
  navy: '#000080',
  blue: '#0000ff',
  teal: '#008080',
  aqua: '#00ffff',
  cyan: '#00ffff',
  orange: '#ffa500',
  // Extended colors
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  blanchedalmond: '#ffebcd',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgrey: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  greenyellow: '#adff2f',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
  lightgreen: '#90ee90',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  oldlace: '#fdf5e6',
  olivedrab: '#6b8e23',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  whitesmoke: '#f5f5f5',
  yellowgreen: '#9acd32',
  // Terminal-specific colors (ANSI)
  transparent: 'transparent',
};

/**
 * Context-dependent colors that inherit from adjacent segments or terminal settings
 * These cannot be resolved statically and need placeholder rendering
 */
export const CONTEXT_DEPENDENT_COLORS = [
  'parentBackground',
  'parentForeground',
  'background',
  'foreground',
  'accent',
] as const;

export type ContextDependentColor = typeof CONTEXT_DEPENDENT_COLORS[number];

/**
 * Special marker returned when a color is context-dependent
 */
export const CONTEXT_DEPENDENT_MARKER = Symbol('context-dependent');

/**
 * Check if a color string is a palette reference (p:key pattern)
 */
export function isPaletteReference(color: string | undefined): boolean {
  if (!color) return false;
  return /^p:[\w-]+$/.test(color);
}

/**
 * Extract the key from a palette reference
 */
export function getPaletteKey(color: string): string | null {
  if (!isPaletteReference(color)) return null;
  return color.slice(2); // Remove 'p:' prefix
}

/**
 * Check if a color string is a CSS named color
 */
export function isNamedColor(color: string | undefined): boolean {
  if (!color) return false;
  return color.toLowerCase() in NAMED_COLORS;
}

/**
 * Check if a color string is a context-dependent color
 */
export function isContextDependentColor(color: string | undefined): color is ContextDependentColor {
  if (!color) return false;
  return CONTEXT_DEPENDENT_COLORS.includes(color as ContextDependentColor);
}

/**
 * Check if a color is a valid hex color
 */
export function isHexColor(color: string | undefined): boolean {
  if (!color) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color);
}

/**
 * Get the active palette by merging base palette with selected palettes list entry
 */
export function getActivePalette(
  config: OhMyPoshConfig,
  selectedPaletteName?: string
): Record<string, string> {
  const basePalette = config.palette || {};
  
  if (!selectedPaletteName || !config.palettes?.list) {
    return basePalette;
  }
  
  const selectedPalette = config.palettes.list[selectedPaletteName];
  if (!selectedPalette) {
    return basePalette;
  }
  
  // Merge: selected palette overrides base palette
  return {
    ...basePalette,
    ...selectedPalette,
  };
}

/**
 * Get all available palette keys from both base palette and palettes list
 */
export function getAllPaletteKeys(config: OhMyPoshConfig): string[] {
  const keys = new Set<string>();
  
  // Add keys from base palette
  if (config.palette) {
    Object.keys(config.palette).forEach((key) => keys.add(key));
  }
  
  // Add keys from all palettes in list
  if (config.palettes?.list) {
    Object.values(config.palettes.list).forEach((palette) => {
      Object.keys(palette).forEach((key) => keys.add(key));
    });
  }
  
  return Array.from(keys).sort();
}

/**
 * Result of resolving a palette color
 */
export interface ResolvedColor {
  /** The resolved hex color value, or null if unresolved */
  color: string | null;
  /** Whether this is a context-dependent color */
  isContextDependent: boolean;
  /** Whether this is an unresolved palette reference */
  isUnresolved: boolean;
  /** The original color string */
  original: string;
  /** Error message if resolution failed */
  error?: string;
}

/**
 * Resolve a color value, handling palette references, named colors, and context-dependent colors
 */
export function resolvePaletteColor(
  color: string | undefined,
  palette: Record<string, string>
): ResolvedColor {
  if (!color) {
    return {
      color: null,
      isContextDependent: false,
      isUnresolved: false,
      original: '',
    };
  }
  
  // Check for context-dependent colors first
  if (isContextDependentColor(color)) {
    return {
      color: null,
      isContextDependent: true,
      isUnresolved: false,
      original: color,
    };
  }
  
  // Check for palette reference
  if (isPaletteReference(color)) {
    const key = getPaletteKey(color);
    if (key && key in palette) {
      const resolvedValue = palette[key];
      // Recursively resolve in case palette value is also a reference
      if (isPaletteReference(resolvedValue)) {
        return resolvePaletteColor(resolvedValue, palette);
      }
      // Resolve named colors in palette values
      if (isNamedColor(resolvedValue)) {
        return {
          color: NAMED_COLORS[resolvedValue.toLowerCase()],
          isContextDependent: false,
          isUnresolved: false,
          original: color,
        };
      }
      return {
        color: resolvedValue,
        isContextDependent: false,
        isUnresolved: false,
        original: color,
      };
    }
    return {
      color: null,
      isContextDependent: false,
      isUnresolved: true,
      original: color,
      error: `Palette key "${key}" not found`,
    };
  }
  
  // Check for named color
  if (isNamedColor(color)) {
    return {
      color: NAMED_COLORS[color.toLowerCase()],
      isContextDependent: false,
      isUnresolved: false,
      original: color,
    };
  }
  
  // Check for hex color
  if (isHexColor(color)) {
    return {
      color: color,
      isContextDependent: false,
      isUnresolved: false,
      original: color,
    };
  }
  
  // Check for transparent
  if (color.toLowerCase() === 'transparent') {
    return {
      color: 'transparent',
      isContextDependent: false,
      isUnresolved: false,
      original: color,
    };
  }
  
  // Unknown color format
  return {
    color: color, // Pass through as-is
    isContextDependent: false,
    isUnresolved: false,
    original: color,
  };
}

/**
 * Resolve inline color tags in text (e.g., <p:key-name> or <#RRGGBB>)
 * Returns the text with palette references resolved to hex colors
 */
export function resolveInlineColors(
  text: string,
  palette: Record<string, string>
): string {
  // Match <p:key-name> pattern
  return text.replace(/<p:([\w-]+)>/g, (_match, key) => {
    if (key in palette) {
      const value = palette[key];
      // If palette value is a hex color, use the inline color format
      if (isHexColor(value)) {
        return `<${value}>`;
      }
      // If it's a named color, convert to hex
      if (isNamedColor(value)) {
        return `<${NAMED_COLORS[value.toLowerCase()]}>`;
      }
      // If it's another palette reference, try to resolve
      if (isPaletteReference(value)) {
        const resolved = resolvePaletteColor(value, palette);
        if (resolved.color && isHexColor(resolved.color)) {
          return `<${resolved.color}>`;
        }
      }
      // Otherwise return as-is (might be a context-dependent color)
      return `<${value}>`;
    }
    // Unresolved palette key - keep original for error display
    return _match;
  });
}

/**
 * Get a description for a context-dependent color
 */
export function getContextDependentColorDescription(color: ContextDependentColor): string {
  switch (color) {
    case 'parentBackground':
      return 'Inherits background color from the previous segment';
    case 'parentForeground':
      return 'Inherits foreground color from the previous segment';
    case 'background':
      return 'Uses the terminal background color';
    case 'foreground':
      return 'Uses the terminal foreground color';
    case 'accent':
      return 'Uses the accent color defined in the config';
    default:
      return 'Context-dependent color';
  }
}

/**
 * Get display name for a color type
 */
export function getColorTypeDisplay(color: string | undefined): string {
  if (!color) return 'None';
  if (isPaletteReference(color)) return `Palette: ${getPaletteKey(color)}`;
  if (isNamedColor(color)) return `Named: ${color}`;
  if (isContextDependentColor(color)) return `Dynamic: ${color}`;
  if (isHexColor(color)) return `Hex: ${color}`;
  return color;
}
