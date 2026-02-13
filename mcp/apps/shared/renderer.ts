/**
 * Prompt renderer — converts an Oh My Posh config into styled HTML
 * Ported from src/components/PreviewPanel/ (no React dependency)
 */
import { resolveColor, parseInlineColorsToHtml } from './colors';
import { getPreviewText } from './templateUtils';

interface Segment {
  type: string;
  style?: string;
  foreground?: string;
  background?: string;
  template?: string;
  powerline_symbol?: string;
  leading_diamond?: string;
  trailing_diamond?: string;
  [key: string]: unknown;
}

interface Block {
  type?: string;
  alignment?: string;
  newline?: boolean;
  segments: Segment[];
  leading_diamond?: string;
  trailing_diamond?: string;
}

interface Config {
  blocks: Block[];
  palette?: Record<string, string>;
  palettes?: { list?: Record<string, Record<string, string>> };
  terminal_background?: string;
  [key: string]: unknown;
}

const DEFAULT_POWERLINE_SYMBOL = '\ue0b0';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSegment(
  segment: Segment,
  nextBackground: string | undefined,
  blockLeadingDiamond: string | undefined,
  blockTrailingDiamond: string | undefined,
  prevStyle: string | undefined,
  palette: Record<string, string>,
): string {
  const bg = resolveColor(segment.background, palette) || 'transparent';
  const fg = resolveColor(segment.foreground || '#ffffff', palette) || '#ffffff';
  const nextBg = resolveColor(nextBackground, palette) || 'transparent';
  const hasBackground = !!segment.background && bg !== 'transparent';

  const text = getPreviewText(segment);
  const renderedText = parseInlineColorsToHtml(text, fg, palette);

  const marginClass = prevStyle === 'powerline' ? 'margin-left:-2px;' : '';
  const borderStyle = !hasBackground ? 'border:1px solid rgba(128,128,128,0.3);' : '';

  if (segment.style === 'powerline') {
    const powerlineSymbol = segment.powerline_symbol || DEFAULT_POWERLINE_SYMBOL;
    const symbolHtml = hasBackground
      ? `<span class="nerd-symbol" style="color:${bg};background-color:${nextBg};margin-left:-2px;display:inline-flex;align-items:stretch;">${escapeHtml(powerlineSymbol)}</span>`
      : '';

    return `<span style="display:inline-flex;align-items:stretch;margin-right:-2px;${marginClass}">` +
      `<span style="background-color:${bg};color:${fg};padding:4px 8px;display:inline-flex;align-items:center;gap:6px;${borderStyle}">` +
      `<span class="nerd-symbol" style="white-space:pre;">${renderedText}</span>` +
      `</span>${symbolHtml}</span>`;
  }

  if (segment.style === 'diamond' || segment.style === 'accordion') {
    const leadingDiamond = segment.leading_diamond || blockLeadingDiamond;
    const trailingDiamond = segment.trailing_diamond || blockTrailingDiamond;
    const diamondColor = hasBackground ? bg : fg;

    let html = `<span style="display:inline-flex;align-items:stretch;${marginClass}">`;

    if (leadingDiamond) {
      html += `<span class="nerd-symbol" style="color:${diamondColor};background-color:transparent;display:inline-flex;align-items:stretch;margin-right:-2px;">${escapeHtml(leadingDiamond)}</span>`;
    }

    html += `<span style="background-color:${bg};color:${fg};padding:4px 8px;display:inline-flex;align-items:center;gap:6px;${borderStyle}${leadingDiamond ? 'margin-left:-2px;' : ''}${trailingDiamond ? 'margin-right:-2px;' : ''}">` +
      `<span class="nerd-symbol" style="white-space:pre;">${renderedText}</span>`;

    if (segment.style === 'accordion') {
      html += `<span style="font-size:10px;opacity:0.6;">⟷</span>`;
    }

    html += `</span>`;

    if (trailingDiamond) {
      html += `<span class="nerd-symbol" style="color:${diamondColor};background-color:transparent;display:inline-flex;align-items:stretch;margin-left:-2px;">${escapeHtml(trailingDiamond)}</span>`;
    }

    html += `</span>`;
    return html;
  }

  // Plain style
  return `<span style="background-color:${bg};color:${fg};padding:4px 8px;border-radius:4px;display:inline-flex;align-items:center;gap:6px;${marginClass}${borderStyle}">` +
    `<span class="nerd-symbol" style="white-space:pre;">${renderedText}</span></span>`;
}

function renderBlock(block: Block, palette: Record<string, string>): string {
  if (!block.segments || block.segments.length === 0) return '';

  const justify = block.alignment === 'right' ? 'justify-content:flex-end;' : 'justify-content:flex-start;';
  let html = `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0;${justify}">`;

  for (let i = 0; i < block.segments.length; i++) {
    const segment = block.segments[i];
    const nextBg = i < block.segments.length - 1 ? block.segments[i + 1].background : undefined;
    const prevStyle = i > 0 ? block.segments[i - 1].style : undefined;

    html += renderSegment(
      segment,
      nextBg,
      block.leading_diamond,
      block.trailing_diamond,
      prevStyle,
      palette,
    );
  }

  html += `</div>`;
  return html;
}

export function renderConfig(config: Config, darkBg: boolean = true): string {
  const palette = config.palette || {};
  const termBg = config.terminal_background
    ? (resolveColor(config.terminal_background, palette) || (darkBg ? '#1a1a2e' : '#f5f5f5'))
    : (darkBg ? '#1a1a2e' : '#f5f5f5');

  let html = `<div class="terminal" style="background:${termBg};border-radius:8px;padding:16px 12px;font-family:'Fira Code','Cascadia Code','JetBrains Mono','Consolas',monospace;font-size:14px;line-height:1.8;overflow-x:auto;">`;

  if (!config.blocks || config.blocks.length === 0) {
    html += `<div style="color:#888;">Empty configuration — no blocks defined</div>`;
  } else {
    for (const block of config.blocks) {
      if (block.newline) {
        html += `<br/>`;
      }
      html += renderBlock(block, palette);
    }
  }

  // Cursor line
  html += `<div style="margin-top:4px;color:${darkBg ? '#e0e0e0' : '#333'};opacity:0.5;">❯ <span style="animation:blink 1s step-end infinite;">▋</span></div>`;
  html += `</div>`;

  return html;
}

export function renderConfigInfo(config: Config): string {
  const blockCount = config.blocks?.length || 0;
  const segmentCount = config.blocks?.reduce((sum, b) => sum + (b.segments?.length || 0), 0) || 0;
  const hasPalette = config.palette && Object.keys(config.palette).length > 0;
  const segmentTypes = config.blocks?.flatMap(b => b.segments?.map(s => s.type) || []) || [];

  let html = `<div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.05);border-radius:6px;border:1px solid rgba(255,255,255,0.1);font-size:12px;color:#aaa;">`;
  html += `<strong style="color:#e0e0e0;">Config Info</strong><br/>`;
  html += `Blocks: ${blockCount} · Segments: ${segmentCount}`;
  if (hasPalette) html += ` · Palette: ${Object.keys(config.palette!).length} colors`;
  if (segmentTypes.length > 0) html += `<br/>Types: ${segmentTypes.join(', ')}`;
  html += `</div>`;

  return html;
}
