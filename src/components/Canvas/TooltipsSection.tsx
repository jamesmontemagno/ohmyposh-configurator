import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { NerdIcon } from '../NerdIcon';
import type { Tooltip } from '../../types/ohmyposh';
import { SortableTooltipCard } from './TooltipCard';

interface TooltipsSectionProps {
  tooltips: Tooltip[];
  isExpanded: boolean;
  onToggle: () => void;
  onAddTooltip: () => void;
}

export function TooltipsSection({ 
  tooltips, 
  isExpanded, 
  onToggle, 
  onAddTooltip 
}: TooltipsSectionProps) {
  const tooltipIds = tooltips.map((t) => t.id);

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="w-full flex items-center justify-between p-2 rounded hover:bg-[#1a1a2e] transition-colors"
      >
        <div className="flex items-center gap-2">
          <NerdIcon icon="nf-md-tooltip_text" size={18} className="text-[#e94560]" />
          <h3 className="text-sm font-semibold text-white">Tooltips</h3>
          {tooltips.length > 0 && (
            <span className="bg-[#0f3460] text-gray-300 text-xs px-2 py-0.5 rounded-full">
              {tooltips.length}
            </span>
          )}
        </div>
        <span className="text-gray-400 text-sm">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <>
          <p className="text-xs text-gray-500 px-2">
            Tooltips appear when you type specific commands. They provide context-aware information.
          </p>

          {/* Tooltips Grid */}
          {tooltips.length > 0 ? (
            <SortableContext items={tooltipIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tooltips.map((tooltip) => (
                  <SortableTooltipCard 
                    key={tooltip.id} 
                    tooltip={tooltip}
                  />
                ))}
              </div>
            </SortableContext>
          ) : (
            <div className="text-center py-8 bg-[#1a1a2e] rounded-lg border border-dashed border-[#0f3460]">
              <NerdIcon icon="nf-md-tooltip_plus" size={32} className="text-gray-600 mb-2 mx-auto" />
              <p className="text-sm text-gray-500">No tooltips configured</p>
              <p className="text-xs text-gray-600 mt-1">
                Tooltips show info when typing commands like "git" or "npm"
              </p>
            </div>
          )}

          {/* Add Tooltip Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddTooltip();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#06d6a0] hover:bg-[#1a1a2e] rounded transition-colors"
          >
            <NerdIcon icon="ui-plus" size={16} />
            Add Tooltip
          </button>
        </>
      )}
    </div>
  );
}
