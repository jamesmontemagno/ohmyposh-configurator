import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = process.env.MCP_APP;
if (!app || !['preview', 'segments'].includes(app)) {
  throw new Error('Set MCP_APP=preview or MCP_APP=segments');
}

export default defineConfig({
  plugins: [viteSingleFile()],
  root: resolve(__dirname, 'apps', app),
  build: {
    outDir: resolve(__dirname, '..', 'dist', 'mcp', 'apps', app),
    emptyOutDir: true,
  },
});
