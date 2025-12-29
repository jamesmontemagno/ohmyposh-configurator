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
            <label className="text-xs text-gray-400">Powerline Symbol</label>
            <input
              type="text"
              value={segment.powerline_symbol || '\ue0b0'}
              onChange={(e) => handleUpdate({ powerline_symbol: e.target.value })}
              className="w-full mt-1 px-2 py-1 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
            />
          </div>
        )}

        {segment.style === 'diamond' && (
          <div className="mt-2 space-y-2">
            <div>
              <label className="text-xs text-gray-400">Leading Diamond</label>
              <input
                type="text"
                value={segment.leading_diamond || ''}
                onChange={(e) => handleUpdate({ leading_diamond: e.target.value })}
                className="w-full mt-1 px-2 py-1 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Trailing Diamond</label>
              <input
                type="text"
                value={segment.trailing_diamond || ''}
                onChange={(e) => handleUpdate({ trailing_diamond: e.target.value })}
                className="w-full mt-1 px-2 py-1 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
              />
            </div>
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

  const block = config.blocks.find((b) => b.id === selectedBlockId);

  if (!block) {
    return null;
  }

  const handleUpdate = (updates: Partial<Block>) => {
    updateBlock(block.id, updates);
  };

  return (
    <div className="space-y-4 p-4 bg-[#1a1a2e] rounded-lg mb-4">
      <h3 className="text-sm font-semibold text-gray-200">Block Settings</h3>

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

      <div>
        <label className="text-xs text-gray-400">Leading Diamond</label>
        <input
          type="text"
          value={block.leading_diamond || ''}
          onChange={(e) => handleUpdate({ leading_diamond: e.target.value || undefined })}
          placeholder="e.g., "
          className="w-full mt-1 px-2 py-1.5 text-sm bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leading diamond for the first segment in the block
        </p>
      </div>

      <div>
        <label className="text-xs text-gray-400">Trailing Diamond</label>
        <input
          type="text"
          value={block.trailing_diamond || ''}
          onChange={(e) => handleUpdate({ trailing_diamond: e.target.value || undefined })}
          placeholder="e.g., "
          className="w-full mt-1 px-2 py-1.5 text-sm bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        />
        <p className="text-xs text-gray-500 mt-1">
          Trailing diamond for the last segment in the block
        </p>
      </div>

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
