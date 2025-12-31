import type { Segment, SegmentStyle } from '../../types/ohmyposh';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import { NerdIcon } from '../NerdIcon';
import { parseInlineColors, getPreviewText } from './templateUtils';

const DEFAULT_POWERLINE_SYMBOL = '\ue0b0';

interface SegmentPreviewProps {
  segment: Segment;
  nextBackground?: string;
  blockLeadingDiamond?: string;
  blockTrailingDiamond?: string;
  prevStyle?: SegmentStyle;
  useMockData?: boolean;
}

export function SegmentPreview({ 
  segment, 
  nextBackground, 
  blockLeadingDiamond, 
  blockTrailingDiamond, 
  prevStyle, 
  useMockData = false 
}: SegmentPreviewProps) {
  const metadata = useSegmentMetadata(segment.type);
  const text = getPreviewText(segment, metadata, useMockData);
  const bg = segment.background || 'transparent';
  const fg = segment.foreground || '#ffffff';
  const hasBackground = !!segment.background;
  
  // Parse inline colors from text
  const renderedText = parseInlineColors(text, fg);

  // Add negative margin if previous segment was powerline
  const marginClass = prevStyle === 'powerline' ? '-ml-[2px]' : '';

  if (segment.style === 'powerline') {
    const powerlineSymbol = segment.powerline_symbol || DEFAULT_POWERLINE_SYMBOL;
    // For powerline, the symbol color is the current segment's background,
    // rendered on top of the next segment's background (or transparent)
    const symbolBg = nextBackground || 'transparent';
    
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
          {!useMockData && metadata?.icon && <NerdIcon icon={metadata.icon} size={14} />}
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

  if (segment.style === 'diamond') {
    // Only use diamonds if explicitly set (don't use defaults)
    const leadingDiamond = segment.leading_diamond || blockLeadingDiamond;
    const trailingDiamond = segment.trailing_diamond || blockTrailingDiamond;
    
    return (
      <span className={`inline-flex items-stretch ${marginClass}`}>
        {/* Leading diamond - only show if explicitly set */}
        {leadingDiamond && (
          <span 
            className="powerline-symbol inline-flex items-stretch -mr-[2px]"
            style={{
              color: hasBackground ? bg : fg,
              backgroundColor: 'transparent',
            }}
          >
            {parseInlineColors(leadingDiamond, hasBackground ? bg : fg)}
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
          {!useMockData && metadata?.icon && <NerdIcon icon={metadata.icon} size={14} />}
          <span className="nerd-font-symbol whitespace-pre">{renderedText}</span>
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
            {parseInlineColors(trailingDiamond, hasBackground ? bg : fg)}
          </span>
        )}
      </span>
    );
  }

  // Plain or accordion style
  return (
    <span
      style={{ 
        backgroundColor: bg, 
        color: fg,
        border: !hasBackground ? '1px solid rgba(128,128,128,0.3)' : 'none',
      }}
      className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${marginClass}`}
    >
      {!useMockData && metadata?.icon && <NerdIcon icon={metadata.icon} size={14} />}
      <span className="nerd-font-symbol whitespace-pre">{renderedText}</span>
    </span>
  );
}
