import { NerdIcon } from '../../NerdIcon';
import { POWERLINE_SYMBOLS, LEADING_DIAMOND_SYMBOLS, TRAILING_DIAMOND_SYMBOLS } from '../../../constants/symbols';
import { SymbolPicker } from '../SymbolPicker';
import type { Segment, Tooltip, SegmentStyle } from '../../../types/ohmyposh';

const segmentStyles: { value: SegmentStyle; label: string }[] = [
  { value: 'powerline', label: 'Powerline' },
  { value: 'plain', label: 'Plain' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'accordion', label: 'Accordion' },
];

interface StyleSectionProps {
  item: Segment | Tooltip;
  onUpdate: (updates: Partial<Segment | Tooltip>) => void;
}

export function StyleSection({ item, onUpdate }: StyleSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <NerdIcon icon="tool-sliders" size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-300">Style</span>
      </div>
      <select
        value={item.style}
        onChange={(e) => onUpdate({ style: e.target.value as SegmentStyle })}
        className="w-full px-2 py-1.5 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
      >
        {segmentStyles.map((style) => (
          <option key={style.value} value={style.value}>
            {style.label}
          </option>
        ))}
      </select>

      {item.style === 'powerline' && (
        <div className="mt-2 space-y-3">
          <SymbolPicker
            label="Powerline Symbol"
            value={item.powerline_symbol || '\ue0b0'}
            onChange={(value) => onUpdate({ powerline_symbol: value || '\ue0b0' })}
            symbols={POWERLINE_SYMBOLS}
            placeholder="Enter symbol"
          />
          
          <SymbolPicker
            label="Leading Powerline Symbol"
            value={item.leading_powerline_symbol || ''}
            onChange={(value) => onUpdate({ leading_powerline_symbol: value || undefined })}
            symbols={LEADING_DIAMOND_SYMBOLS}
            placeholder="Optional leading symbol"
          />
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.invert_powerline ?? false}
              onChange={(e) => onUpdate({ 
                invert_powerline: e.target.checked || undefined 
              })}
              className="rounded border-[#0f3460] bg-[#0f0f23] text-[#e94560] focus:ring-[#e94560]"
            />
            <span className="text-sm text-white">Invert Powerline</span>
          </label>
          <p className="text-xs text-gray-500 -mt-1 ml-6">
            Flip the powerline symbol vertically
          </p>
        </div>
      )}

      {item.style === 'diamond' && (
        <div className="mt-2 space-y-2">
          <SymbolPicker
            label="Leading Diamond"
            value={item.leading_diamond || ''}
            onChange={(value) => onUpdate({ leading_diamond: value || undefined })}
            symbols={LEADING_DIAMOND_SYMBOLS}
            placeholder="Left-pointing symbol"
          />
          <SymbolPicker
            label="Trailing Diamond"
            value={item.trailing_diamond || ''}
            onChange={(value) => onUpdate({ trailing_diamond: value || undefined })}
            symbols={TRAILING_DIAMOND_SYMBOLS}
            placeholder="Right-pointing symbol"
          />
        </div>
      )}
    </div>
  );
}
