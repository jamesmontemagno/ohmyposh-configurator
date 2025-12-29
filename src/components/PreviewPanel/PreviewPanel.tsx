import { Sun, Moon } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import type { Block, Segment, SegmentStyle } from '../../types/ohmyposh';
import { DynamicIcon } from '../DynamicIcon';

// Mock data for preview
const mockData: Record<string, string> = {
  path: '~/projects/my-app',
  git: 'main ↑2',
  node: 'v20.10.0',
  python: '3.11.0',
  go: '1.21.0',
  rust: '1.74.0',
  java: '17.0.1',
  dotnet: '8.0.0',
  time: '14:32:05',
  battery: '85%',
  os: '',
  shell: 'zsh',
  session: 'user@host',
  aws: 'prod@us-east-1',
  kubectl: 'k8s-prod::default',
  docker: 'default',
  terraform: 'production',
};

// Default symbols
const DEFAULT_POWERLINE_SYMBOL = '\ue0b0';
const DEFAULT_LEADING_DIAMOND = '\ue0b6';
const DEFAULT_TRAILING_DIAMOND = '\ue0b4';

function getPreviewText(segment: Segment, metadata?: { name: string }): string {
  // Try to use mock data
  if (mockData[segment.type]) {
    return mockData[segment.type];
  }
  
  // Fall back to segment name
  return metadata?.name || segment.type;
}

interface SegmentPreviewProps {
  segment: Segment;
  nextBackground?: string;
  blockLeadingDiamond?: string;
  blockTrailingDiamond?: string;
  prevStyle?: SegmentStyle;
}

function SegmentPreview({ segment, nextBackground, blockLeadingDiamond, blockTrailingDiamond, prevStyle }: SegmentPreviewProps) {
  const metadata = useSegmentMetadata(segment.type);
  const text = getPreviewText(segment, metadata);
  const bg = segment.background || '#61AFEF';
  const fg = segment.foreground || '#ffffff';

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
          style={{ backgroundColor: bg, color: fg }}
          className="px-2 py-1 inline-flex items-center gap-1.5"
        >
          {metadata?.icon && <DynamicIcon name={metadata.icon} size={14} />}
          <span>{text}</span>
        </span>
        {/* Powerline symbol */}
        <span 
          className="nerd-font-symbol -ml-[2px] inline-flex items-center"
          style={{
            color: bg,
            backgroundColor: symbolBg,
          }}
        >
          {powerlineSymbol}
        </span>
      </span>
    );
  }

  if (segment.style === 'diamond') {
    // Use segment-level diamonds, or fall back to block-level, or defaults
    const leadingDiamond = segment.leading_diamond || blockLeadingDiamond || DEFAULT_LEADING_DIAMOND;
    const trailingDiamond = segment.trailing_diamond || blockTrailingDiamond || DEFAULT_TRAILING_DIAMOND;
    
    return (
      <span className={`inline-flex items-stretch -mx-[2px] ${marginClass}`}>
        {/* Leading diamond */}
        <span 
          className="nerd-font-symbol inline-flex items-center"
          style={{
            color: bg,
            backgroundColor: 'transparent',
          }}
        >
          {leadingDiamond}
        </span>
        <span
          style={{ backgroundColor: bg, color: fg }}
          className="px-2 py-1 inline-flex items-center gap-1.5 -mx-[2px]"
        >
          {metadata?.icon && <DynamicIcon name={metadata.icon} size={14} />}
          <span>{text}</span>
        </span>
        {/* Trailing diamond */}
        <span 
          className="nerd-font-symbol inline-flex items-center"
          style={{
            color: bg,
            backgroundColor: 'transparent',
          }}
        >
          {trailingDiamond}
        </span>
      </span>
    );
  }

  // Plain or accordion style
  return (
    <span
      style={{ backgroundColor: bg, color: fg }}
      className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${marginClass}`}
    >
      {metadata?.icon && <DynamicIcon name={metadata.icon} size={14} />}
      <span>{text}</span>
    </span>
  );
}

interface BlockPreviewProps {
  block: Block;
}

function BlockPreview({ block }: BlockPreviewProps) {
  if (block.segments.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-0 ${
        block.alignment === 'right' ? 'justify-end' : 'justify-start'
      }`}
    >
      {block.segments.map((segment, index) => (
        <SegmentPreview
          key={segment.id}
          segment={segment}
          nextBackground={index < block.segments.length - 1 ? block.segments[index + 1].background : undefined}
          blockLeadingDiamond={block.leading_diamond}
          blockTrailingDiamond={block.trailing_diamond}
          prevStyle={index > 0 ? block.segments[index - 1].style : undefined}
        />
      ))}
    </div>
  );
}

export function PreviewPanel() {
  const config = useConfigStore((state) => state.config);
  const previewBackground = useConfigStore((state) => state.previewBackground);
  const setPreviewBackground = useConfigStore((state) => state.setPreviewBackground);

  const bgColor = previewBackground === 'dark' ? '#1e1e1e' : '#ffffff';
  const textColor = previewBackground === 'dark' ? '#cccccc' : '#333333';

  return (
    <div className="bg-[#16213e] border-t border-[#0f3460]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#0f3460]">
        <h2 className="text-sm font-semibold text-gray-200">Preview</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Background:</span>
          <button
            onClick={() => setPreviewBackground('dark')}
            className={`p-1.5 rounded transition-colors ${
              previewBackground === 'dark'
                ? 'bg-[#0f3460] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Dark background"
          >
            <Moon size={14} />
          </button>
          <button
            onClick={() => setPreviewBackground('light')}
            className={`p-1.5 rounded transition-colors ${
              previewBackground === 'light'
                ? 'bg-[#0f3460] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Light background"
          >
            <Sun size={14} />
          </button>
        </div>
      </div>

      <div
        className="p-4 text-sm"
        style={{ 
          backgroundColor: bgColor, 
          color: textColor,
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', monospace",
        }}
      >
        <div className="space-y-2">
          {config.blocks.map((block, index) => (
            <div key={block.id}>
              <BlockPreview block={block} />
              {block.newline && index < config.blocks.length - 1 && <br />}
            </div>
          ))}
          <div className="mt-2">
            <span style={{ color: textColor }}>❯ </span>
            <span className="animate-pulse">▋</span>
          </div>
        </div>
      </div>
    </div>
  );
}
