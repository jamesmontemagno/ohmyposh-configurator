interface AnsiStyle {
  background?: string;
  bold: boolean;
  foreground?: string;
  inverse: boolean;
}

const ESCAPE = String.fromCharCode(0x1b);
const BELL = String.fromCharCode(0x07);
const OSC_SEQUENCE = new RegExp(`${ESCAPE}\\][\\s\\S]*?(?:${BELL}|${ESCAPE}\\\\)`, 'g');
const CSI_SEQUENCE = new RegExp(`${ESCAPE}\\[([0-?]*[ -/]*)([@-~])`, 'g');
const SGR_SEQUENCE = new RegExp(`${ESCAPE}\\[([0-9;]*)m`, 'g');
const SGR_PREFIX = new RegExp(`^${ESCAPE}\\[[0-9;]*m`);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeAnsi(output: string): string {
  const sanitized = output
    .replace(OSC_SEQUENCE, '')
    .replace(CSI_SEQUENCE, (sequence, parameters: string, final: string) => (
      final === 'm' && /^[0-9;]*$/.test(parameters) ? sequence : ''
    ));
  let result = '';

  for (let index = 0; index < sanitized.length; index++) {
    const character = sanitized[index];
    const code = character.charCodeAt(0);
    if (code === 0x1b) {
      const sgr = sanitized.slice(index).match(SGR_PREFIX);
      if (sgr) {
        result += sgr[0];
        index += sgr[0].length - 1;
      }
    } else if (code === 0x09 || code === 0x0a || code === 0x0d || (code >= 0x20 && code !== 0x7f)) {
      result += character;
    }
  }

  return result;
}

function colorFromSgr(values: number[], index: number): { color?: string; nextIndex: number } {
  if (values[index + 1] !== 2 || values.length < index + 5) {
    return { nextIndex: index + 1 };
  }

  const [red, green, blue] = values.slice(index + 2, index + 5);
  if ([red, green, blue].some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
    return { nextIndex: index + 5 };
  }

  return { color: `rgb(${red}, ${green}, ${blue})`, nextIndex: index + 5 };
}

function applySgr(style: AnsiStyle, rawCodes: string): void {
  const values = rawCodes ? rawCodes.split(';').map(Number) : [0];

  for (let index = 0; index < values.length; index++) {
    const code = values[index];
    if (code === 0) {
      style.background = undefined;
      style.bold = false;
      style.foreground = undefined;
      style.inverse = false;
    } else if (code === 1) {
      style.bold = true;
    } else if (code === 22) {
      style.bold = false;
    } else if (code === 7) {
      style.inverse = true;
    } else if (code === 27) {
      style.inverse = false;
    } else if (code === 38 || code === 48) {
      const { color, nextIndex } = colorFromSgr(values, index);
      index = nextIndex - 1;
      if (color) {
        if (code === 38) style.foreground = color;
        else style.background = color;
      }
    } else if (code === 39) {
      style.foreground = undefined;
    } else if (code === 49) {
      style.background = undefined;
    }
  }
}

function styleAttribute(style: AnsiStyle): string {
  const declarations: string[] = [];
  if (style.foreground) declarations.push(`color:${style.foreground}`);
  if (style.background) declarations.push(`background-color:${style.background}`);
  if (style.bold) declarations.push('font-weight:700');
  if (style.inverse) declarations.push('filter:invert(1)');
  return declarations.join(';');
}

export function ansiToHtml(output: string): string {
  const sanitized = sanitizeAnsi(output);
  const style: AnsiStyle = { bold: false, inverse: false };
  let html = '';
  let cursor = 0;
  let spanOpen = false;

  for (const match of sanitized.matchAll(SGR_SEQUENCE)) {
    html += escapeHtml(sanitized.slice(cursor, match.index));
    if (spanOpen) {
      html += '</span>';
      spanOpen = false;
    }

    applySgr(style, match[1]);
    const attribute = styleAttribute(style);
    if (attribute) {
      html += `<span style="${attribute}">`;
      spanOpen = true;
    }
    cursor = (match.index ?? 0) + match[0].length;
  }

  html += escapeHtml(sanitized.slice(cursor));
  if (spanOpen) html += '</span>';
  return html;
}
