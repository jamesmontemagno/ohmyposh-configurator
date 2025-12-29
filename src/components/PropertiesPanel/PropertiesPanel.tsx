import { useState } from 'react';
import { Settings, Palette, Code, Sliders, Globe } from 'lucide-react';
import { useConfigStore, getSelectedSegment, findBlockForSegment } from '../../store/configStore';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import type { Segment, SegmentStyle, Block, BlockType, BlockAlignment, OhMyPoshConfig } from '../../types/ohmyposh';

const segmentStyles: { value: SegmentStyle; label: string }[] = [
  { value: 'powerline', label: 'Powerline' },
  { value: 'plain', label: 'Plain' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'accordion', label: 'Accordion' },
];

// Common Powerline/Nerd Font symbols with their descriptions
const POWERLINE_SYMBOLS = [
  { value: '\ue0b0', label: 'Sharp Right', code: 'E0B0' },
  { value: '\ue0b2', label: 'Sharp Left', code: 'E0B2' },
  { value: '\ue0b4', label: 'Rounded Right', code: 'E0B4' },
  { value: '\ue0b6', label: 'Rounded Left', code: 'E0B6' },
  { value: '\ue0b1', label: 'Sharp Right Thin', code: 'E0B1' },
  { value: '\ue0b3', label: 'Sharp Left Thin', code: 'E0B3' },
  { value: '\ue0b5', label: 'Rounded Right Thin', code: 'E0B5' },
  { value: '\ue0b7', label: 'Rounded Left Thin', code: 'E0B7' },
  { value: '\ue0bc', label: 'Flame Right', code: 'E0BC' },
  { value: '\ue0be', label: 'Flame Left', code: 'E0BE' },
  { value: '\ue0c0', label: 'Pixelated Right', code: 'E0C0' },
  { value: '\ue0c2', label: 'Pixelated Left', code: 'E0C2' },
  { value: '\ue0c4', label: 'Honeycomb', code: 'E0C4' },
  { value: '\ue0c6', label: 'Honeycomb Outline', code: 'E0C6' },
  { value: '\ue0c8', label: 'Ice', code: 'E0C8' },
  { value: '\ue0cc', label: 'Trapezoid Top', code: 'E0CC' },
  { value: '\ue0ce', label: 'Trapezoid Bottom', code: 'E0CE' },
  { value: '\ue0d2', label: 'Semi-circle Right', code: 'E0D2' },
  { value: '\ue0d4', label: 'Semi-circle Left', code: 'E0D4' },
];

// Recommended symbols for leading diamond (left-pointing)
const LEADING_DIAMOND_SYMBOLS = POWERLINE_SYMBOLS.filter(s => 
  ['E0B6', 'E0B2', 'E0B7', 'E0B3', 'E0BE', 'E0C2', 'E0D4'].includes(s.code)
);

// Recommended symbols for trailing diamond (right-pointing)
const TRAILING_DIAMOND_SYMBOLS = POWERLINE_SYMBOLS.filter(s => 
  ['E0B0', 'E0B4', 'E0B1', 'E0B5', 'E0BC', 'E0C0', 'E0D2'].includes(s.code)
);

interface SymbolPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  symbols: typeof POWERLINE_SYMBOLS;
  placeholder?: string;
}

function SymbolPicker({ label, value, onChange, symbols, placeholder }: SymbolPickerProps) {
  const [isCustom, setIsCustom] = useState(() => {
    // Check if current value is not in the predefined list
    return value ? !symbols.some(s => s.value === value) : false;
  });

  const currentSymbol = symbols.find(s => s.value === value);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__custom__') {
      setIsCustom(true);
    } else if (selected === '__none__') {
      setIsCustom(false);
      onChange('');
    } else {
      setIsCustom(false);
      onChange(selected);
    }
  };

  return (
    <div>
      <label className="text-xs text-gray-400">{label}</label>
      <select
        value={isCustom ? '__custom__' : (value || '__none__')}
        onChange={handleSelectChange}
        className="w-full mt-1 px-2 py-1.5 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
      >
        <option value="__none__">None</option>
        {symbols.map((symbol) => (
          <option key={symbol.code} value={symbol.value}>
            {symbol.label} (U+{symbol.code})
          </option>
        ))}
        <option value="__custom__">Custom...</option>
      </select>
      
      {isCustom && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Enter symbol or Unicode (e.g., \\ue0b0)'}
          className="w-full mt-1 px-2 py-1 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        />
      )}
      
      {value && !isCustom && currentSymbol && (
        <p className="text-xs text-gray-500 mt-1">
          Unicode: U+{currentSymbol.code}
        </p>
      )}
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-24">{label}</label>
      <div className="flex-1 flex items-center gap-2">
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="flex-1 px-2 py-1 text-xs bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        />
      </div>
    </div>
  );
}

function SegmentProperties() {
  const config = useConfigStore((state) => state.config);
  const selectedSegmentId = useConfigStore((state) => state.selectedSegmentId);
  const updateSegment = useConfigStore((state) => state.updateSegment);
  const duplicateSegment = useConfigStore((state) => state.duplicateSegment);

  const segment = getSelectedSegment(config, selectedSegmentId);
  const block = segment ? findBlockForSegment(config, segment.id) : undefined;
  const metadata = useSegmentMetadata(segment?.type || '');

  if (!segment || !block) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <Settings size={32} className="mx-auto mb-2 opacity-50" />
        <p>Select a segment to edit its properties</p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Segment>) => {
    updateSegment(block.id, segment.id, updates);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#0f3460]">
        <span className="text-xl">{metadata?.icon || '📦'}</span>
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            {metadata?.name || segment.type}
          </h3>
          <p className="text-xs text-gray-500">{segment.type}</p>
        </div>
      </div>

      {/* Style Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sliders size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Style</span>
        </div>
        <select
          value={segment.style}
          onChange={(e) => handleUpdate({ style: e.target.value as SegmentStyle })}
          className="w-full px-2 py-1.5 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        >
          {segmentStyles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>

        {segment.style === 'powerline' && (
          <div className="mt-2">
            <SymbolPicker
              label="Powerline Symbol"
              value={segment.powerline_symbol || '\ue0b0'}
              onChange={(value) => handleUpdate({ powerline_symbol: value || '\ue0b0' })}
              symbols={POWERLINE_SYMBOLS}
              placeholder="Enter symbol"
            />
          </div>
        )}

        {segment.style === 'diamond' && (
          <div className="mt-2 space-y-2">
            <SymbolPicker
              label="Leading Diamond"
              value={segment.leading_diamond || ''}
              onChange={(value) => handleUpdate({ leading_diamond: value || undefined })}
              symbols={LEADING_DIAMOND_SYMBOLS}
              placeholder="Left-pointing symbol"
            />
            <SymbolPicker
              label="Trailing Diamond"
              value={segment.trailing_diamond || ''}
              onChange={(value) => handleUpdate({ trailing_diamond: value || undefined })}
              symbols={TRAILING_DIAMOND_SYMBOLS}
              placeholder="Right-pointing symbol"
            />
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Palette size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Colors</span>
        </div>
        <div className="space-y-2">
          <ColorInput
            label="Foreground"
            value={segment.foreground || '#ffffff'}
            onChange={(value) => handleUpdate({ foreground: value })}
          />
          <ColorInput
            label="Background"
            value={segment.background || '#61AFEF'}
            onChange={(value) => handleUpdate({ background: value })}
          />
        </div>
      </div>

      {/* Template Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Code size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Template</span>
        </div>
        <textarea
          value={segment.template || ''}
          onChange={(e) => handleUpdate({ template: e.target.value })}
          rows={3}
          className="w-full px-2 py-1.5 text-xs font-mono bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560] resize-y"
          placeholder="{{ .Data }}"
        />
        <p className="text-xs text-gray-500 mt-1">
          Uses Go template syntax.{' '}
          <a
            href="https://ohmyposh.dev/docs/configuration/templates"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e94560] hover:underline"
          >
            Learn more
          </a>
        </p>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-[#0f3460]">
        <button
          onClick={() => duplicateSegment(block.id, segment.id)}
          className="w-full px-3 py-1.5 text-sm bg-[#0f3460] text-gray-200 rounded hover:bg-[#1a4a7a] transition-colors"
        >
          Duplicate Segment
        </button>
      </div>
    </div>
  );
}

function BlockProperties() {
  const config = useConfigStore((state) => state.config);
  const selectedBlockId = useConfigStore((state) => state.selectedBlockId);
  const updateBlock = useConfigStore((state) => state.updateBlock);
  const [isExpanded, setIsExpanded] = useState(true);

  const block = config.blocks.find((b) => b.id === selectedBlockId);

  if (!block) {
    return null;
  }

  const handleUpdate = (updates: Partial<Block>) => {
    updateBlock(block.id, updates);
  };

  return (
    <div className="space-y-4 p-4 bg-[#1a1a2e] rounded-lg mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-200 hover:text-white transition-colors"
      >
        <span>Block Settings</span>
        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400">Type</label>
        <select
          value={block.type}
          onChange={(e) => handleUpdate({ type: e.target.value as BlockType })}
          className="w-full mt-1 px-2 py-1.5 text-sm bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        >
          <option value="prompt">Prompt</option>
          <option value="rprompt">Right Prompt</option>
        </select>
      </div>

      {block.type === 'prompt' && (
        <div>
          <label className="text-xs text-gray-400">Alignment</label>
          <select
            value={block.alignment || 'left'}
            onChange={(e) => handleUpdate({ alignment: e.target.value as BlockAlignment })}
            className="w-full mt-1 px-2 py-1.5 text-sm bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}

      {block.alignment === 'right' && (
        <div>
          <label className="text-xs text-gray-400">Overflow</label>
          <select
            value={block.overflow || ''}
            onChange={(e) => handleUpdate({ overflow: e.target.value as 'break' | 'hide' | undefined || undefined })}
            className="w-full mt-1 px-2 py-1.5 text-sm bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
          >
            <option value="">Default (same line)</option>
            <option value="break">Break to new line</option>
            <option value="hide">Hide</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Behavior when right block overflows left block
          </p>
        </div>
      )}

      {block.alignment === 'right' && (
        <div>
          <label className="text-xs text-gray-400">Filler</label>
          <input
            type="text"
            value={block.filler || ''}
            onChange={(e) => handleUpdate({ filler: e.target.value || undefined })}
            placeholder="e.g., . or -"
            className="w-full mt-1 px-2 py-1.5 text-sm bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Character(s) to fill space between left and right blocks
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="newline"
          checked={block.newline || false}
          onChange={(e) => handleUpdate({ newline: e.target.checked })}
          className="rounded bg-[#0f0f23] border-[#0f3460]"
        />
        <label htmlFor="newline" className="text-xs text-gray-300">
          Start on new line
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="force"
          checked={block.force || false}
          onChange={(e) => handleUpdate({ force: e.target.checked })}
          className="rounded bg-[#0f0f23] border-[#0f3460]"
        />
        <label htmlFor="force" className="text-xs text-gray-300">
          Force render (even if all segments empty)
        </label>
      </div>

      <SymbolPicker
        label="Leading Diamond"
        value={block.leading_diamond || ''}
        onChange={(value) => handleUpdate({ leading_diamond: value || undefined })}
        symbols={LEADING_DIAMOND_SYMBOLS}
        placeholder="Left-pointing symbol"
      />

      <SymbolPicker
        label="Trailing Diamond"
        value={block.trailing_diamond || ''}
        onChange={(value) => handleUpdate({ trailing_diamond: value || undefined })}
        symbols={TRAILING_DIAMOND_SYMBOLS}
        placeholder="Right-pointing symbol"
      />

      <div>
        <label className="text-xs text-gray-400">Index (for extends)</label>
        <input
          type="number"
          min="1"
          value={block.index || ''}
          onChange={(e) => handleUpdate({ index: e.target.value ? parseInt(e.target.value, 10) : undefined })}
          placeholder="1-based index"
          className="w-full mt-1 px-2 py-1.5 text-sm bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        />
        <p className="text-xs text-gray-500 mt-1">
          Used to override specific blocks in a base config
        </p>
      </div>
        </div>
      )}
    </div>
  );
}

export function PropertiesPanel() {
  const selectedBlockId = useConfigStore((state) => state.selectedBlockId);
  const selectedSegmentId = useConfigStore((state) => state.selectedSegmentId);

  return (
    <div className="flex flex-col h-full bg-[#16213e] border-l border-[#0f3460]">
      <div className="p-3 border-b border-[#0f3460]">
        <h2 className="text-sm font-semibold text-gray-200">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {selectedBlockId && <BlockProperties />}
        {selectedSegmentId ? <SegmentProperties /> : <GlobalSettings />}
      </div>
    </div>
  );
}

function GlobalSettings() {
  const config = useConfigStore((state) => state.config);
  const updateGlobalConfig = useConfigStore((state) => state.updateGlobalConfig);

  const handleUpdate = (updates: Partial<OhMyPoshConfig>) => {
    updateGlobalConfig(updates);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#0f3460]">
        <Globe size={20} className="text-gray-400" />
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Global Settings</h3>
          <p className="text-xs text-gray-500">Configuration-wide options</p>
        </div>
      </div>

      {/* Console Title Template */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Code size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Console Title Template</span>
        </div>
        <textarea
          value={config.console_title_template || ''}
          onChange={(e) => handleUpdate({ console_title_template: e.target.value || undefined })}
          rows={2}
          className="w-full px-2 py-1.5 text-xs font-mono bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560] resize-y"
          placeholder="{{.Folder}}{{if .Root}} :: root{{end}} :: {{.Shell}}"
        />
        <p className="text-xs text-gray-500 mt-1">
          Template for the terminal window title.{' '}
          <a
            href="https://ohmyposh.dev/docs/configuration/title"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e94560] hover:underline"
          >
            Learn more
          </a>
        </p>
      </div>

      {/* Terminal Background */}
      <div>
        <label className="text-xs text-gray-400">Terminal Background</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={config.terminal_background || '#000000'}
            onChange={(e) => handleUpdate({ terminal_background: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={config.terminal_background || ''}
            onChange={(e) => handleUpdate({ terminal_background: e.target.value || undefined })}
            placeholder="#000000"
            className="flex-1 px-2 py-1 text-xs bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Used for transparency in some segments
        </p>
      </div>

      {/* Accent Color */}
      <div>
        <label className="text-xs text-gray-400">Accent Color</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={config.accent_color || '#ffffff'}
            onChange={(e) => handleUpdate({ accent_color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={config.accent_color || ''}
            onChange={(e) => handleUpdate({ accent_color: e.target.value || undefined })}
            placeholder="#ffffff"
            className="flex-1 px-2 py-1 text-xs bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Default accent color for segments
        </p>
      </div>

      {/* Final Space */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="final_space"
          checked={config.final_space ?? true}
          onChange={(e) => handleUpdate({ final_space: e.target.checked })}
          className="rounded bg-[#0f0f23] border-[#0f3460]"
        />
        <label htmlFor="final_space" className="text-xs text-gray-300">
          Add final space after prompt
        </label>
      </div>

      {/* Shell Integration */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="shell_integration"
          checked={config.shell_integration || false}
          onChange={(e) => handleUpdate({ shell_integration: e.target.checked })}
          className="rounded bg-[#0f0f23] border-[#0f3460]"
        />
        <label htmlFor="shell_integration" className="text-xs text-gray-300">
          Enable shell integration
        </label>
      </div>

      {/* Enable Cursor Positioning */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enable_cursor_positioning"
          checked={config.enable_cursor_positioning || false}
          onChange={(e) => handleUpdate({ enable_cursor_positioning: e.target.checked })}
          className="rounded bg-[#0f0f23] border-[#0f3460]"
        />
        <label htmlFor="enable_cursor_positioning" className="text-xs text-gray-300">
          Enable cursor positioning
        </label>
      </div>

      <p className="text-xs text-gray-500 pt-2 border-t border-[#0f3460]">
        Select a segment to edit its properties
      </p>
    </div>
  );
}
