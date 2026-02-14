/**
 * MCP App: Oh My Posh Segment Explorer
 * Interactive browse/search of all segments inline in the AI chat
 */
import { App } from '@modelcontextprotocol/ext-apps';
import { renderConfig } from '../../shared/renderer';
import { loadNerdFont } from '../../shared/fontLoader';
import '../../shared/styles.css';
import './styles.css';

const appEl = document.getElementById('app')!;
const app = new App({ name: 'Oh My Posh Segments', version: '1.0.0' });

// Load Nerd Font via FontFace API (CSS data: URIs blocked by webview CSP)
loadNerdFont();

interface SegmentSummary {
  type: string;
  name: string;
  category: string;
  description: string;
}

interface SegmentDetail {
  type: string;
  name: string;
  category: string;
  description: string;
  icon?: string;
  defaultTemplate?: string;
  previewText?: string;
  properties?: Array<{ name: string; type: string; description: string }>;
  options?: Array<{ name: string; type: string; default?: unknown; description: string }>;
  defaultCache?: { duration: string; strategy: string };
}

const CATEGORY_COLORS: Record<string, string> = {
  system: '#61AFEF',
  scm: '#98C379',
  languages: '#C678DD',
  cloud: '#E5C07B',
  cli: '#56B6C2',
  web: '#7C9FF5',
  music: '#E06C75',
  health: '#89CA78',
};

const CATEGORY_FG: Record<string, string> = {
  system: '#ffffff',
  scm: '#ffffff',
  languages: '#ffffff',
  cloud: '#282c34',
  cli: '#ffffff',
  web: '#ffffff',
  music: '#ffffff',
  health: '#ffffff',
};

const CATEGORY_LABELS: Record<string, string> = {
  system: 'System',
  scm: 'Version Control',
  languages: 'Languages',
  cloud: 'Cloud & Infra',
  cli: 'CLI Tools',
  web: 'Web',
  music: 'Music',
  health: 'Health',
};

let segments: SegmentSummary[] = [];
let searchQuery = '';
let selectedSegment: SegmentDetail | null = null;
const expandedCategories = new Set<string>();
let loadingDetail = false;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function filterSegments(): SegmentSummary[] {
  if (!searchQuery) return segments;
  const q = searchQuery.toLowerCase();
  return segments.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.type.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  );
}

function groupByCategory(list: SegmentSummary[]): Record<string, SegmentSummary[]> {
  const groups: Record<string, SegmentSummary[]> = {};
  for (const s of list) {
    if (!groups[s.category]) groups[s.category] = [];
    groups[s.category].push(s);
  }
  return groups;
}

/** True when only a single segment was loaded (no list context) */
const isSingleSegmentMode = (): boolean => segments.length === 0 && selectedSegment !== null;

function renderDetailPanel(): string {
  if (loadingDetail) return `<div class="detail-panel"><div class="loading">Loading segment details...</div></div>`;
  if (!selectedSegment) return '';

  const s = selectedSegment;
  const catColor = CATEGORY_COLORS[s.category] || '#888';
  const fullWidth = isSingleSegmentMode();

  let html = `<div class="detail-panel${fullWidth ? ' detail-panel-full' : ''}">`;
  html += `<div class="detail-header">`;
  html += `<div class="detail-title">`;
  html += `<span class="detail-name">${escapeHtml(s.name)}</span>`;
  html += `<span class="detail-type">${escapeHtml(s.type)}</span>`;
  html += `<span class="detail-badge" style="background:${catColor};">${escapeHtml(CATEGORY_LABELS[s.category] || s.category)}</span>`;
  html += `</div>`;
  if (!fullWidth) {
    html += `<button id="close-detail" class="close-btn" title="Close">✕</button>`;
  }
  html += `</div>`;
  html += `<p class="detail-desc">${escapeHtml(s.description)}</p>`;

  // Visual preview of the segment
  const previewConfig = {
    blocks: [{
      type: 'prompt',
      alignment: 'left',
      segments: [
        {
          type: s.type,
          style: 'powerline',
          powerline_symbol: '\ue0b0',
          background: CATEGORY_COLORS[s.category] || '#888',
          foreground: CATEGORY_FG[s.category] || '#ffffff',
          template: s.defaultTemplate || ` ${s.name} `,
        },
      ],
    }],
  };
  html += `<div class="detail-section"><strong>Preview</strong>`;
  html += renderConfig(previewConfig, true);
  html += `</div>`;

  if (s.defaultTemplate) {
    html += `<div class="detail-section"><strong>Default Template</strong><code class="template-code">${escapeHtml(s.defaultTemplate)}</code></div>`;
  }

  if (s.properties && s.properties.length > 0) {
    html += `<div class="detail-section"><strong>Template Properties</strong><table class="detail-table"><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody>`;
    for (const p of s.properties) {
      html += `<tr><td><code>${escapeHtml(p.name)}</code></td><td>${escapeHtml(p.type)}</td><td>${escapeHtml(p.description)}</td></tr>`;
    }
    html += `</tbody></table></div>`;
  }

  if (s.options && s.options.length > 0) {
    html += `<div class="detail-section"><strong>Options</strong><table class="detail-table"><thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>`;
    for (const o of s.options) {
      const def = o.default !== undefined ? JSON.stringify(o.default) : '-';
      html += `<tr><td><code>${escapeHtml(o.name)}</code></td><td>${escapeHtml(o.type)}</td><td><code>${escapeHtml(def)}</code></td><td>${escapeHtml(o.description)}</td></tr>`;
    }
    html += `</tbody></table></div>`;
  }

  if (s.defaultCache) {
    html += `<div class="detail-section"><strong>Recommended Cache</strong><p>Duration: <code>${escapeHtml(s.defaultCache.duration)}</code> · Strategy: <code>${escapeHtml(s.defaultCache.strategy)}</code></p></div>`;
  }

  html += `</div>`;
  return html;
}

function render() {
  const filtered = filterSegments();
  const grouped = groupByCategory(filtered);
  const categoryOrder = ['system', 'scm', 'languages', 'cloud', 'cli', 'web', 'music', 'health'];

  // Single-segment mode: show only the detail panel, full-width, no chrome
  if (isSingleSegmentMode()) {
    appEl.innerHTML = renderDetailPanel();
    return;
  }

  let html = `<div class="explorer-header">`;
  html += `<span class="explorer-title">Segment Explorer</span>`;
  html += `<span class="explorer-count">${filtered.length} segments</span>`;
  html += `</div>`;

  html += `<div class="search-bar"><input type="text" id="search-input" placeholder="Search segments..." value="${escapeHtml(searchQuery)}" /></div>`;

  html += `<div class="explorer-content">`;
  html += `<div class="segments-list">`;

  for (const cat of categoryOrder) {
    const catSegments = grouped[cat];
    if (!catSegments || catSegments.length === 0) continue;

    const isExpanded = expandedCategories.has(cat) || searchQuery.length > 0;
    const color = CATEGORY_COLORS[cat] || '#888';
    const label = CATEGORY_LABELS[cat] || cat;

    html += `<div class="category-group">`;
    html += `<div class="category-header" data-cat="${cat}" style="border-left:3px solid ${color};">`;
    html += `<span class="category-toggle">${isExpanded ? '▾' : '▸'}</span>`;
    html += `<span class="category-name" style="color:${color};">${escapeHtml(label)}</span>`;
    html += `<span class="category-count">${catSegments.length}</span>`;
    html += `</div>`;

    if (isExpanded) {
      html += `<div class="category-items">`;
      for (const seg of catSegments) {
        const isSelected = selectedSegment?.type === seg.type;
        html += `<div class="segment-item${isSelected ? ' selected' : ''}" data-type="${escapeHtml(seg.type)}">`;
        html += `<span class="segment-name">${escapeHtml(seg.name)}</span>`;
        html += `<span class="segment-type">${escapeHtml(seg.type)}</span>`;
        html += `</div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
  }

  html += `</div>`;

  html += renderDetailPanel();
  html += `</div>`;

  // Preserve search input focus and cursor position across re-renders
  const existingInput = document.getElementById('search-input') as HTMLInputElement | null;
  const hadFocus = existingInput === document.activeElement;
  const cursorPos = existingInput?.selectionStart ?? null;

  appEl.innerHTML = html;

  // Bind events
  const newInput = document.getElementById('search-input') as HTMLInputElement | null;
  newInput?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    render();
  });

  // Restore focus and cursor position
  if (hadFocus && newInput) {
    newInput.focus();
    if (cursorPos !== null) {
      newInput.setSelectionRange(cursorPos, cursorPos);
    }
  }

  document.getElementById('close-detail')?.addEventListener('click', () => {
    selectedSegment = null;
    render();
  });

  document.querySelectorAll<HTMLElement>('.category-header').forEach(el => {
    el.addEventListener('click', () => {
      const cat = el.dataset.cat!;
      if (expandedCategories.has(cat)) expandedCategories.delete(cat);
      else expandedCategories.add(cat);
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('.segment-item').forEach(el => {
    el.addEventListener('click', async () => {
      const segType = el.dataset.type!;
      if (selectedSegment?.type === segType) return;

      loadingDetail = true;
      render();

      try {
        const result = await app.callServerTool({
          name: 'get_segment_info',
          arguments: { segmentType: segType },
        });
        const text = result.content?.find((c: { type: string }) => c.type === 'text') as { text: string } | undefined;
        if (text?.text) {
          selectedSegment = JSON.parse(text.text);
          app.updateModelContext({ structuredContent: { selectedSegment: segType } });
        }
      } catch {
        selectedSegment = null;
      }
      loadingDetail = false;
      render();
    });
  });
}

function parseSegmentsFromResult(result: { content?: Array<{ type: string; text?: string }> }) {
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
  const data = parseSegmentsFromResult(result);
  if (Array.isArray(data)) {
    segments = data;
    // Auto-expand first category
    if (segments.length > 0) {
      expandedCategories.add(segments[0].category);
    }
    render();
  } else if (data && typeof data === 'object' && 'type' in data) {
    // Single segment info — show as detail
    selectedSegment = data;
    render();
  } else {
    appEl.innerHTML = `<div class="error">Could not parse segment data from tool result</div>`;
  }
};

app.connect();
render();
