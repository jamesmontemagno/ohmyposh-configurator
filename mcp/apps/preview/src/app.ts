/**
 * MCP App: Oh My Posh Config Preview
 * Renders prompt configs visually inline in the AI chat
 */
import { App } from '@modelcontextprotocol/ext-apps';
import { renderConfig, renderConfigInfo } from '../../shared/renderer';
import '../../shared/styles.css';
import './styles.css';

const appEl = document.getElementById('app')!;
const app = new App({ name: 'Oh My Posh Preview', version: '1.0.0' });

let currentConfig: Record<string, unknown> | null = null;
let darkMode = true;

function render() {
  if (!currentConfig) {
    appEl.innerHTML = `<div class="loading">Waiting for config data...</div>`;
    return;
  }

  let html = `<div class="preview-header">`;
  html += `<span class="preview-title">Oh My Posh Preview</span>`;
  html += `<div class="preview-actions">`;
  html += `<button id="toggle-bg" class="preview-btn" title="Toggle light/dark terminal background">${darkMode ? '☀️' : '🌙'}</button>`;
  html += `<button id="btn-export-json" class="preview-btn" title="Export as JSON">JSON</button>`;
  html += `<button id="btn-export-yaml" class="preview-btn" title="Export as YAML">YAML</button>`;
  html += `<button id="btn-export-toml" class="preview-btn" title="Export as TOML">TOML</button>`;
  html += `</div></div>`;

  html += renderConfig(currentConfig as Parameters<typeof renderConfig>[0], darkMode);
  html += renderConfigInfo(currentConfig as Parameters<typeof renderConfig>[0]);

  appEl.innerHTML = html;

  // Bind buttons
  document.getElementById('toggle-bg')?.addEventListener('click', () => {
    darkMode = !darkMode;
    render();
  });

  for (const fmt of ['json', 'yaml', 'toml'] as const) {
    document.getElementById(`btn-export-${fmt}`)?.addEventListener('click', async () => {
      const btn = document.getElementById(`btn-export-${fmt}`)!;
      btn.textContent = '...';
      try {
        const result = await app.callServerTool({
          name: 'export_configuration',
          arguments: { config: JSON.stringify(currentConfig), format: fmt },
        });
        const text = result.content?.find((c: { type: string }) => c.type === 'text') as { text: string } | undefined;
        if (text?.text) {
          app.updateModelContext({ structuredContent: { exported: text.text, format: fmt } });
          btn.textContent = '✓';
        }
      } catch {
        btn.textContent = '✗';
      }
      setTimeout(() => { btn.textContent = fmt.toUpperCase(); }, 1500);
    });
  }
}

function parseConfigFromResult(result: { content?: Array<{ type: string; text?: string }> }) {
  const textContent = result.content?.find((c) => c.type === 'text');
  if (textContent && 'text' in textContent && textContent.text) {
    try {
      return JSON.parse(textContent.text);
    } catch {
      return null;
    }
  }
  return null;
}

// Receive tool result from host
app.ontoolresult = (result) => {
  const config = parseConfigFromResult(result);
  if (config) {
    currentConfig = config;
    render();
  } else {
    appEl.innerHTML = `<div class="error">Could not parse configuration from tool result</div>`;
  }
};

app.connect();
render();
