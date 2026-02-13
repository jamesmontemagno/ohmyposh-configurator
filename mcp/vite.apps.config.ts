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
 * Inline woff2 font files referenced in CSS as base64 data URIs.
 * This is needed because MCP apps are single-file HTML served via the MCP
 * protocol, so relative font URLs can't resolve at runtime.
 */
function inlineFontsPlugin() {
  const projectRoot = resolve(__dirname, '..');
  return {
    name: 'inline-fonts',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!id.endsWith('.css')) return null;
      return code.replace(
        /url\(['"]?\/fonts\/([\w.-]+\.woff2)['"]?\)/g,
        (_match: string, filename: string) => {
          const fontPath = resolve(projectRoot, 'public', 'fonts', filename);
          const fontData = readFileSync(fontPath).toString('base64');
          return `url('data:font/woff2;base64,${fontData}')`;
        },
      );
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
