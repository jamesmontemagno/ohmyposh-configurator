/**
 * Simplified palette resolver for MCP Apps (no React dependency)
 */

const NAMED_COLORS: Record<string, string> = {
  black: '#000000', silver: '#c0c0c0', gray: '#808080', grey: '#808080',
  white: '#ffffff', maroon: '#800000', red: '#ff0000', purple: '#800080',
  fuchsia: '#ff00ff', magenta: '#ff00ff', green: '#008000', lime: '#00ff00',
  olive: '#808000', yellow: '#ffff00', navy: '#000080', blue: '#0000ff',
  teal: '#008080', aqua: '#00ffff', cyan: '#00ffff', orange: '#ffa500',
  coral: '#ff7f50', crimson: '#dc143c', gold: '#ffd700', indigo: '#4b0082',
  pink: '#ffc0cb', salmon: '#fa8072', tomato: '#ff6347', violet: '#ee82ee',
  transparent: 'transparent',
};

function isHexColor(color: string | undefined): boolean {
  if (!color) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color);
}

function isPaletteReference(color: string | undefined): boolean {
  if (!color) return false;
  return /^p:[\w-]+$/.test(color);
}

function isNamedColor(color: string | undefined): boolean {
  if (!color) return false;
  return color.toLowerCase() in NAMED_COLORS;
}

const CONTEXT_DEPENDENT = ['parentBackground', 'parentForeground', 'background', 'foreground', 'accent'];

export function resolveColor(
  color: string | undefined,
  palette: Record<string, string> = {}
): string | null {
  if (!color) return null;
  if (CONTEXT_DEPENDENT.includes(color)) return null;

  if (isPaletteReference(color)) {
    const key = color.slice(2);
    if (key in palette) {
      const val = palette[key];
      if (isPaletteReference(val)) return resolveColor(val, palette);
      if (isNamedColor(val)) return NAMED_COLORS[val.toLowerCase()];
      return val;
    }
    return null;
  }

  if (isNamedColor(color)) return NAMED_COLORS[color.toLowerCase()];
  if (isHexColor(color)) return color;
  if (color.toLowerCase() === 'transparent') return 'transparent';
  return color;
}

/**
 * Parse inline color tags from Oh My Posh templates and return HTML
 * Supports: <#hex>, <p:key>, <transparent>, <named-color>, </>, <b>, <i>, <u>, <s>
 */
export function parseInlineColorsToHtml(
  text: string,
  defaultColor: string,
  palette: Record<string, string> = {}
): string {
  const tagRegex = /<#([0-9a-fA-F]{6})>|<p:([\w-]+)>|<transparent>|<(\w+)>|<\/>|<(b|i|u|s|strike)>|<\/(b|i|u|s|strike)>/g;
  let lastIndex = 0;
  let match;
  let currentColor = defaultColor;
  let isTransparent = false;
  const styleStack: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean } = {};
  let html = '';

  const buildStyle = (): string => {
    const parts: string[] = [`color:${isTransparent ? 'transparent' : currentColor}`];
    if (styleStack.bold) parts.push('font-weight:bold');
    if (styleStack.italic) parts.push('font-style:italic');
    const decs: string[] = [];
    if (styleStack.underline) decs.push('underline');
    if (styleStack.strikethrough) decs.push('line-through');
    if (decs.length) parts.push(`text-decoration:${decs.join(' ')}`);
    return parts.join(';');
  };

  const escapeHtml = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  while ((match = tagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.substring(lastIndex, match.index);
      if (before) html += `<span style="${buildStyle()}">${escapeHtml(before)}</span>`;
    }

    if (match[1]) {
      currentColor = `#${match[1]}`;
      isTransparent = false;
    } else if (match[2]) {
      const key = match[2];
      const resolved = resolveColor(`p:${key}`, palette);
      currentColor = resolved || defaultColor;
      isTransparent = false;
    } else if (match[0] === '<transparent>') {
      isTransparent = true;
    } else if (match[3] && isNamedColor(match[3])) {
      currentColor = NAMED_COLORS[match[3].toLowerCase()];
      isTransparent = false;
    } else if (match[0] === '</>') {
      currentColor = defaultColor;
      isTransparent = false;
    } else if (match[4]) {
      const tag = match[4];
      if (tag === 'b') styleStack.bold = true;
      else if (tag === 'i') styleStack.italic = true;
      else if (tag === 'u') styleStack.underline = true;
      else if (tag === 's' || tag === 'strike') styleStack.strikethrough = true;
    } else if (match[5]) {
      const tag = match[5];
      if (tag === 'b') delete styleStack.bold;
      else if (tag === 'i') delete styleStack.italic;
      else if (tag === 'u') delete styleStack.underline;
      else if (tag === 's' || tag === 'strike') delete styleStack.strikethrough;
    }

    lastIndex = tagRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining) html += `<span style="${buildStyle()}">${escapeHtml(remaining)}</span>`;
  }

  return html || escapeHtml(text);
}

export { NAMED_COLORS, isHexColor, isNamedColor, isPaletteReference };
