import { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import { useAdvancedFeaturesStore } from '../../store/advancedFeaturesStore';
import { LEADING_DIAMOND_SYMBOLS, TRAILING_DIAMOND_SYMBOLS } from '../../constants/symbols';
import { SymbolPicker } from './SymbolPicker';
import type { Block, BlockType, BlockAlignment } from '../../types/ohmyposh';

export function BlockProperties() {
  const config = useConfigStore((state) => state.config);
  const selectedBlockId = useConfigStore((state) => state.selectedBlockId);
  const updateBlock = useConfigStore((state) => state.updateBlock);
  const features = useAdvancedFeaturesStore((state) => state.features);
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

          {block.alignment === 'right' && features.blockOverflow && (
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

          {block.alignment === 'right' && features.blockFiller && (
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

          {features.diamondSymbols && (
            <>
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
            </>
          )}

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
