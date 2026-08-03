/**
 * MCP App: Oh My Posh Config Preview
 * Renders prompt configs visually inline in the AI chat
 */
import { App } from '@modelcontextprotocol/ext-apps';
import { renderConfig, renderConfigInfo } from '../../shared/renderer';
import { loadNerdFont } from '../../shared/fontLoader';
import { ansiToHtml } from './ansi';
import '../../shared/styles.css';
import './styles.css';

const appEl = document.getElementById('app')!;
const app = new App({ name: 'Oh My Posh Preview', version: '1.0.0' });

// Load Nerd Font via FontFace API (CSS data: URIs blocked by webview CSP)
loadNerdFont();

let currentConfig: Record<string, unknown> | null = null;
let darkMode = true;
type CliStatus = { available: true; version: string } | { available: false; reason: 'not-found' };
type LivePreview =
  | { available: true; version: string; output: string }
  | { available: false; reason: 'not-found' };
let cliStatus: CliStatus | 'idle' | 'checking' = 'idle';
let cliStatusError: string | null = null;
let livePreview: LivePreview | 'loading' | null = null;
let livePreviewError: string | null = null;
let configVersion = 0;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseToolText(result: { content?: Array<{ type: string; text?: string }> }): string | null {
  const text = result.content?.find((content) => content.type === 'text');
  return text?.text ?? null;
}

async function checkCliStatus() {
  if (cliStatus === 'checking' || typeof cliStatus === 'object') return;

  cliStatus = 'checking';
  cliStatusError = null;
  render();
  try {
    const result = await app.callServerTool({ name: 'get_ohmyposh_cli_status', arguments: {} });
    const text = parseToolText(result);
    cliStatus = text ? JSON.parse(text) as CliStatus : { available: false, reason: 'not-found' };
  } catch {
    cliStatus = 'idle';
    cliStatusError = 'Live preview availability could not be checked.';
  }
  render();
}

async function renderLivePreview() {
  if (!currentConfig || !('available' in cliStatus) || !cliStatus.available) return;

  const requestedConfigVersion = configVersion;
  const config = currentConfig;
  livePreview = 'loading';
  livePreviewError = null;
  render();
  try {
    const result = await app.callServerTool({
      name: 'render_live_preview',
      arguments: { config: JSON.stringify(config) },
    });
    const text = parseToolText(result);
    if (!text) throw new Error('Oh My Posh did not return a preview.');
    if (requestedConfigVersion !== configVersion) return;

    livePreview = JSON.parse(text) as LivePreview;
    if (!livePreview.available) {
      cliStatus = livePreview;
    }
  } catch {
    if (requestedConfigVersion !== configVersion) return;

    livePreview = null;
    livePreviewError = 'Live preview could not be generated.';
  }
  render();
}

function render() {
  if (!currentConfig) {
    appEl.innerHTML = `<div class="loading">Waiting for config data...</div>`;
    return;
  }

  let html = `<div class="preview-header">`;
  html += `<span class="preview-title">Oh My Posh Preview</span>`;
  html += `<div class="preview-actions">`;
  if (cliStatus === 'checking') {
    html += `<button class="preview-btn" disabled>Checking CLI...</button>`;
  } else if (typeof cliStatus === 'object' && cliStatus.available) {
    const version = escapeHtml(cliStatus.version);
    html += `<button id="btn-live-preview" class="preview-btn" title="Render using local Oh My Posh ${version}">${livePreview === 'loading' ? 'Rendering...' : 'Live preview'}</button>`;
  }
  html += `<button id="toggle-bg" class="preview-btn" title="Toggle light/dark terminal background">${darkMode ? '☀️' : '🌙'}</button>`;
  html += `<button id="btn-export-json" class="preview-btn" title="Export as JSON">JSON</button>`;
  html += `<button id="btn-export-yaml" class="preview-btn" title="Export as YAML">YAML</button>`;
  html += `<button id="btn-export-toml" class="preview-btn" title="Export as TOML">TOML</button>`;
  html += `</div></div>`;

  html += renderConfig(currentConfig as Parameters<typeof renderConfig>[0], darkMode);
  if (livePreview && livePreview !== 'loading' && livePreview.available) {
    const version = escapeHtml(livePreview.version);
    html += `<div class="live-preview"><div class="live-preview-title">Local Oh My Posh ${version}</div><pre class="live-preview-output">${ansiToHtml(livePreview.output)}</pre></div>`;
  } else if (livePreviewError) {
    html += `<div class="live-preview-error">${livePreviewError}</div>`;
  } else if (cliStatusError) {
    html += `<div class="live-preview-error">${cliStatusError}</div>`;
  }
  html += renderConfigInfo(currentConfig as Parameters<typeof renderConfig>[0]);

  appEl.innerHTML = html;

  // Bind buttons
  document.getElementById('toggle-bg')?.addEventListener('click', () => {
    darkMode = !darkMode;
    render();
  });

  document.getElementById('btn-live-preview')?.addEventListener('click', () => {
    void renderLivePreview();
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
  const text = parseToolText(result);
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  return null;
}

// Receive tool result from host
app.ontoolresult = (result) => {
  const parsed = parseConfigFromResult(result);
  if (parsed) {
    // load_sample_config returns { config, metadata } — unwrap if needed
    currentConfig = parsed.config && parsed.config.blocks ? parsed.config : parsed;
    configVersion += 1;
    livePreview = null;
    livePreviewError = null;
    render();
    void checkCliStatus();
  } else {
    appEl.innerHTML = `<div class="error">Could not parse configuration from tool result</div>`;
  }
};

app.connect();
render();
