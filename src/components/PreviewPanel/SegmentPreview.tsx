import type { Segment, SegmentStyle } from '../../types/ohmyposh';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import { parseInlineColors, getPreviewText } from './templateUtils';
import { useConfigStore } from '../../store/configStore';
import { 
  getActivePalette, 
  resolvePaletteColor, 
  isContextDependentColor,
  getContextDependentColorDescription,
  getPaletteKey,
} from '../../utils/paletteResolver';

const DEFAULT_POWERLINE_SYMBOL = '\ue0b0';

interface SegmentPreviewProps {
  segment: Segment;
  nextBackground?: string;
  blockLeadingDiamond?: string;
  blockTrailingDiamond?: string;
  prevStyle?: SegmentStyle;
}

/**
 * Component to render context-dependent color placeholder
 */
function ContextDependentColorIndicator({ 
  colorName, 
  type 
}: { 
  colorName: string; 
  type: 'background' | 'foreground' 
}) {
  const description = isContextDependentColor(colorName) 
    ? getContextDependentColorDescription(colorName)
    : 'Dynamic color';
  
  return (
    <span 
      className="inline-flex items-center justify-center w-3 h-3 text-[8px] opacity-70"
      title={`${type}: ${colorName} - ${description}`}
      style={{
        background: type === 'background' 
          ? 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(128,128,128,0.3) 2px, rgba(128,128,128,0.3) 4px)'
          : 'transparent',
      }}
    >
      ↔
    </span>
  );
}

/**
 * Component to render unresolved palette reference warning
 */
function UnresolvedPaletteWarning({ paletteKey }: { paletteKey: string }) {
  return (
    <span 
      className="inline-flex items-center justify-center text-[10px] text-yellow-500"
      title={`Unresolved palette key: ${paletteKey}`}
    >
      ⚠
    </span>
  );
}

export function SegmentPreview({ 
  segment, 
  nextBackground, 
  blockLeadingDiamond, 
  blockTrailingDiamond, 
  prevStyle, 
}: SegmentPreviewProps) {
  const config = useConfigStore((state) => state.config);
  const previewPaletteName = useConfigStore((state) => state.previewPaletteName);
  const metadata = useSegmentMetadata(segment.type);
  
  // Get the active palette for color resolution
  const palette = getActivePalette(config, previewPaletteName);
  
  // Resolve background and foreground colors
  const resolvedBg = resolvePaletteColor(segment.background, palette);
  const resolvedFg = resolvePaletteColor(segment.foreground || '#ffffff', palette);
  const resolvedNextBg = resolvePaletteColor(nextBackground, palette);
  
  // Get display colors (fall back to defaults for unresolved/context-dependent)
  const bg = resolvedBg.color || (resolvedBg.isContextDependent ? 'transparent' : 'transparent');
  const fg = resolvedFg.color || '#ffffff';
  const hasBackground = !!segment.background && !resolvedBg.isContextDependent && resolvedBg.color !== 'transparent';
  
  // Track warnings for rendering
  const hasUnresolvedBg = resolvedBg.isUnresolved;
  const hasUnresolvedFg = resolvedFg.isUnresolved;
  const hasContextDependentBg = resolvedBg.isContextDependent;
  const hasContextDependentFg = resolvedFg.isContextDependent;
  
  const text = getPreviewText(segment, metadata, true); // Always use template-based preview
  
  // Parse inline colors from text with palette support
  const renderedText = parseInlineColors(text, fg, palette);

  // Add negative margin if previous segment was powerline
  const marginClass = prevStyle === 'powerline' ? '-ml-[2px]' : '';
  
  // Get resolved next background for powerline symbol
  const nextBg = resolvedNextBg.color || 'transparent';

  // Render warning indicators if needed
  const warningIndicators = (
    <>
      {hasUnresolvedBg && <UnresolvedPaletteWarning paletteKey={getPaletteKey(segment.background || '') || ''} />}
      {hasUnresolvedFg && <UnresolvedPaletteWarning paletteKey={getPaletteKey(segment.foreground || '') || ''} />}
      {hasContextDependentBg && <ContextDependentColorIndicator colorName={segment.background || ''} type="background" />}
      {hasContextDependentFg && <ContextDependentColorIndicator colorName={segment.foreground || ''} type="foreground" />}
    </>
  );
  
  const hasWarnings = hasUnresolvedBg || hasUnresolvedFg || hasContextDependentBg || hasContextDependentFg;

  if (segment.style === 'powerline') {
    const powerlineSymbol = segment.powerline_symbol || DEFAULT_POWERLINE_SYMBOL;
    // For powerline, the symbol color is the current segment's background,
    // rendered on top of the next segment's background (or transparent)
    const symbolBg = nextBg;
    
    return (
      <span className={`inline-flex items-stretch -mr-[2px] ${marginClass}`}>
        <span
          style={{ 
            backgroundColor: bg, 
            color: fg,
            border: !hasBackground ? '1px solid rgba(128,128,128,0.3)' : 'none',
            borderRight: !hasBackground && hasBackground ? 'none' : undefined,
          }}
          className="px-2 py-1 inline-flex items-center gap-1.5"
        >
          {hasWarnings && warningIndicators}
          <span className="nerd-font-symbol whitespace-pre">{renderedText}</span>
        </span>
        {/* Powerline symbol - only show if current segment has background */}
        {hasBackground && (
          <span 
            className="powerline-symbol -ml-[2px] inline-flex items-stretch"
            style={{
              color: bg,
              backgroundColor: symbolBg,
            }}
          >
            {powerlineSymbol}
          </span>
        )}
      </span>
    );
  }

  if (segment.style === 'diamond' || segment.style === 'accordion') {
    // Only use diamonds if explicitly set (don't use defaults)
    const leadingDiamond = segment.leading_diamond || blockLeadingDiamond;
    const trailingDiamond = segment.trailing_diamond || blockTrailingDiamond;
    const isAccordion = segment.style === 'accordion';
    
    return (
      <span className={`inline-flex items-stretch ${marginClass}`} title={isAccordion ? 'Accordion segment (expands/collapses in terminal)' : undefined}>
        {/* Leading diamond - only show if explicitly set */}
        {leadingDiamond && (
          <span 
            className="powerline-symbol inline-flex items-stretch -mr-[2px]"
            style={{
              color: hasBackground ? bg : fg,
              backgroundColor: 'transparent',
            }}
          >
            {parseInlineColors(leadingDiamond, hasBackground ? bg : fg, palette)}
          </span>
        )}
        <span
          style={{ 
            backgroundColor: bg, 
            color: fg,
            border: !hasBackground ? '1px solid rgba(128,128,128,0.3)' : 'none',
            borderLeft: !hasBackground && leadingDiamond ? 'none' : undefined,
            borderRight: !hasBackground && trailingDiamond ? 'none' : undefined,
          }}
          className={`px-2 py-1 inline-flex items-center gap-1.5 ${leadingDiamond ? '-ml-[2px]' : ''} ${trailingDiamond ? '-mr-[2px]' : ''}`}
        >
          {hasWarnings && warningIndicators}
          <span className="nerd-font-symbol whitespace-pre">{renderedText}</span>
          {/* Accordion indicator */}
          {isAccordion && (
            <span className="text-[10px] opacity-60" title="Accordion: expands on segment activation">⟷</span>
          )}
        </span>
        {/* Trailing diamond - only show if explicitly set */}
        {trailingDiamond && (
          <span 
            className="powerline-symbol inline-flex items-stretch -ml-[2px]"
            style={{
              color: hasBackground ? bg : fg,
              backgroundColor: 'transparent',
            }}
          >
            {parseInlineColors(trailingDiamond, hasBackground ? bg : fg, palette)}
          </span>
        )}
      </span>
    );
  }

  // Plain style
  return (
    <span
      style={{ 
        backgroundColor: bg, 
        color: fg,
        border: !hasBackground ? '1px solid rgba(128,128,128,0.3)' : 'none',
      }}
      className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${marginClass}`}
    >
      {hasWarnings && warningIndicators}
      <span className="nerd-font-symbol whitespace-pre">{renderedText}</span>
    </span>
  );
}
