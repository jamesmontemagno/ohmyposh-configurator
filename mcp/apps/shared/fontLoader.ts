/**
 * Programmatic Nerd Font loader for MCP ext-apps.
 *
 * VS Code webviews block `data:` URIs in CSS `@font-face` via CSP.
 * The FontFace API with an ArrayBuffer bypasses this restriction because
 * the font object is constructed entirely in JS, not loaded via URL.
 *
 * The placeholder strings are replaced at build time by the Vite
 * `inlineFontsPlugin` with the actual base64-encoded font data.
 */

const WOFF2_BASE64: string = '__FONT_BASE64_nerd-symbols-subset.woff2__';
const TTF_BASE64: string = '__FONT_BASE64_nerd-symbols-subset.ttf__';

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function tryLoadFont(base64: string): Promise<boolean> {
  try {
    const buffer = base64ToArrayBuffer(base64);
    const font = new FontFace('NerdSymbols', buffer);
    await font.load();
    document.fonts.add(font);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load the NerdSymbols font using the FontFace API.
 * Tries inlined woff2 first, then ttf, then CDN fallback.
 */
export async function loadNerdFont(): Promise<void> {
  // Try woff2 (smallest, best compression)
  if (!WOFF2_BASE64.startsWith('__FONT_BASE64_')) {
    if (await tryLoadFont(WOFF2_BASE64)) return;
  }

  // Try ttf fallback
  if (!TTF_BASE64.startsWith('__FONT_BASE64_')) {
    if (await tryLoadFont(TTF_BASE64)) return;
  }

  // Last resort: load from CDN (may be blocked by CSP)
  try {
    const font = new FontFace(
      'NerdSymbols',
      "url('https://cdn.jsdelivr.net/gh/ryanoasis/nerd-fonts@v3.3.0/patched-fonts/NerdFontsSymbolsOnly/SymbolsNerdFontMono-Regular.ttf')",
    );
    await font.load();
    document.fonts.add(font);
  } catch {
    // Font loading failed — icons will render as boxes
  }
}
