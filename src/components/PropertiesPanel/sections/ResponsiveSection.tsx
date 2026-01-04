import { useState } from 'react';
import { NerdIcon } from '../../NerdIcon';
import type { Segment, Tooltip } from '../../../types/ohmyposh';

interface ResponsiveSectionProps {
  item: Segment | Tooltip;
  onUpdate: (updates: Partial<Segment | Tooltip>) => void;
  /** Label for description text (segment vs tooltip) */
  itemType?: 'segment' | 'tooltip';
}

export function ResponsiveSection({ item, onUpdate, itemType = 'segment' }: ResponsiveSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const label = itemType === 'tooltip' ? 'Tooltip' : 'Segment';

  return (
    <div className="space-y-3 p-3 bg-[#1a1a2e] rounded-lg">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <NerdIcon icon="ui-monitor" className="text-[#e94560]" />
          <span className="text-sm font-medium text-white">Responsive Display</span>
        </div>
        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-[#0f3460]">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Minimum Width (columns)
            </label>
            <input
              type="number"
              min="0"
              value={item.min_width ?? ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                if (value === undefined || (value >= 0 && !isNaN(value))) {
                  onUpdate({ min_width: value });
                }
              }}
              placeholder="No minimum"
              className="w-full bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              {label} hidden when terminal is narrower than this
            </p>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Maximum Width (columns)
            </label>
            <input
              type="number"
              min="0"
              value={item.max_width ?? ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                if (value === undefined || (value >= 0 && !isNaN(value))) {
                  onUpdate({ max_width: value });
                }
              }}
              placeholder="No maximum"
              className="w-full bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              {label} hidden when terminal is wider than this
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
