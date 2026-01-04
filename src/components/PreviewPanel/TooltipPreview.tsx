import type { Tooltip } from '../../types/ohmyposh';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import { parseInlineColors, getPreviewText } from './templateUtils';
import { useConfigStore } from '../../store/configStore';
import { 
  getActivePalette, 
  resolvePaletteColor, 
} from '../../utils/paletteResolver';

const DEFAULT_POWERLINE_SYMBOL = '\ue0b0';

interface TooltipPreviewProps {
  tooltip: Tooltip;
}

export function TooltipPreview({ tooltip }: TooltipPreviewProps) {
  const config = useConfigStore((state) => state.config);
  const previewPaletteName = useConfigStore((state) => state.previewPaletteName);
  const selectedTooltipId = useConfigStore((state) => state.selectedTooltipId);
  const metadata = useSegmentMetadata(tooltip.type);
  
  // Get the active palette for color resolution
  const palette = getActivePalette(config, previewPaletteName);
  
  // Resolve background and foreground colors
  const resolvedBg = resolvePaletteColor(tooltip.background, palette);
  const resolvedFg = resolvePaletteColor(tooltip.foreground || '#ffffff', palette);
  
  // Get display colors
  const bg = resolvedBg.color || 'transparent';
  const fg = resolvedFg.color || '#ffffff';
  const hasBackground = !!tooltip.background && resolvedBg.color !== 'transparent';
  
  const text = getPreviewText(tooltip, metadata, true);
  
  // Parse inline colors from text with palette support
  const renderedText = parseInlineColors(text, fg, palette);

  const isSelected = selectedTooltipId === tooltip.id;

  // Render based on style
  if (tooltip.style === 'powerline') {
    const powerlineSymbol = tooltip.powerline_symbol || DEFAULT_POWERLINE_SYMBOL;
    
    return (
      <span className={`inline-flex items-stretch ${isSelected ? 'ring-2 ring-[#06d6a0] rounded' : ''}`}>
        <span
          style={{ 
            backgroundColor: bg, 
            color: fg,
            border: !hasBackground ? '1px solid rgba(128,128,128,0.3)' : 'none',
          }}
          className="px-2 py-1 inline-flex items-center gap-1.5"
        >
          <span className="nerd-font-symbol whitespace-pre">{renderedText}</span>
        </span>
        {hasBackground && (
          <span 
            className="powerline-symbol -ml-[2px] inline-flex items-stretch"
            style={{
              color: bg,
              backgroundColor: 'transparent',
            }}
          >
            {powerlineSymbol}
          </span>
        )}
      </span>
    );
  }

  if (tooltip.style === 'diamond') {
    const leadingDiamond = tooltip.leading_diamond;
    const trailingDiamond = tooltip.trailing_diamond;
    
    return (
      <span className={`inline-flex items-stretch ${isSelected ? 'ring-2 ring-[#06d6a0] rounded' : ''}`}>
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
          }}
          className={`px-2 py-1 inline-flex items-center gap-1.5 ${leadingDiamond ? '-ml-[2px]' : ''} ${trailingDiamond ? '-mr-[2px]' : ''}`}
        >
          <span className="nerd-font-symbol whitespace-pre">{renderedText}</span>
        </span>
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

  // Plain style (default)
  return (
    <span
      style={{ 
        backgroundColor: bg, 
        color: fg,
        border: !hasBackground ? '1px solid rgba(128,128,128,0.3)' : 'none',
      }}
      className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${isSelected ? 'ring-2 ring-[#06d6a0]' : ''}`}
    >
      <span className="nerd-font-symbol whitespace-pre">{renderedText}</span>
    </span>
  );
}
