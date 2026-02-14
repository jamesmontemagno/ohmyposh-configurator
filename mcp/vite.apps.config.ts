import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = process.env.MCP_APP;
if (!app || !['preview', 'segments'].includes(app)) {
  throw new Error('Set MCP_APP=preview or MCP_APP=segments');
}

/**
 * Inline font files referenced in CSS as base64 data URIs.
 * This is needed because MCP apps are single-file HTML served via the MCP
 * protocol, so relative font URLs can't resolve at runtime.
 */
function inlineFontsPlugin() {
  const projectRoot = resolve(__dirname, '..');
  const MIME: Record<string, string> = { '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
  return {
    name: 'inline-fonts',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (id.endsWith('.css')) {
        return code.replace(
          /url\(['"]?\/fonts\/([\w.-]+\.(?:woff2|ttf))['"]?\)/g,
          (_match: string, filename: string) => {
            const fontPath = resolve(projectRoot, 'public', 'fonts', filename);
            const ext = filename.substring(filename.lastIndexOf('.'));
            const mime = MIME[ext] || 'font/ttf';
            const fontData = readFileSync(fontPath).toString('base64');
            return `url('data:${mime};base64,${fontData}')`;
          },
        );
      }
      // Also inline font data as base64 strings in TS/JS for FontFace API usage
      if (id.endsWith('.ts') || id.endsWith('.js')) {
        const replaced = code.replace(
          /'__FONT_BASE64_([\w.-]+)__'/g,
          (_match: string, filename: string) => {
            const fontPath = resolve(projectRoot, 'public', 'fonts', filename);
            const fontData = readFileSync(fontPath).toString('base64');
            return `'${fontData}'`;
          },
        );
        if (replaced !== code) return replaced;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [inlineFontsPlugin(), viteSingleFile()],
  root: resolve(__dirname, 'apps', app),
  publicDir: resolve(__dirname, '..', 'public'),
  build: {
    outDir: resolve(__dirname, '..', 'dist', 'mcp', 'apps', app),
    emptyOutDir: true,
    assetsInlineLimit: 100000,
  },
});
