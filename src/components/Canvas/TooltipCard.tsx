import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import type { Tooltip } from '../../types/ohmyposh';

interface TooltipCardProps {
  tooltip: Tooltip;
  isDragging?: boolean;
}

export function TooltipCard({ tooltip, isDragging }: TooltipCardProps) {
  const selectedTooltipId = useConfigStore((s) => s.selectedTooltipId);
  const selectTooltip = useConfigStore((s) => s.selectTooltip);
  const removeTooltip = useConfigStore((s) => s.removeTooltip);
  const duplicateTooltip = useConfigStore((s) => s.duplicateTooltip);
  
  const isSelected = selectedTooltipId === tooltip.id;
  const metadata = useSegmentMetadata(tooltip.type);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this tooltip?')) {
      removeTooltip(tooltip.id);
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectTooltip(tooltip.id);
      }}
      className={`
        relative p-3 rounded-lg cursor-pointer transition-all
        ${isDragging
          ? 'opacity-90 shadow-lg scale-105'
          : isSelected 
            ? 'bg-[#1a1a2e] border-2 border-[#e94560] shadow-lg' 
            : 'bg-[#16213e] border border-[#0f3460] hover:border-[#e94560]/50'
        }
      `}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 text-gray-500 hover:text-gray-300 cursor-grab">
        <NerdIcon icon="ui-grip-vertical" size={14} />
      </div>
      
      {/* Header Row */}
      <div className="flex items-center justify-between ml-5">
        <div className="flex items-center gap-2">
          <NerdIcon 
            icon={metadata?.icon ?? 'nf-md-tooltip_text'} 
            size={16}
            className="text-[#e94560]" 
          />
          <span className="text-sm font-medium text-white">
            {metadata?.name ?? tooltip.type}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateTooltip(tooltip.id);
            }}
            className="p-1 text-gray-500 hover:text-[#06d6a0] transition-colors"
            title="Duplicate tooltip"
          >
            <NerdIcon icon="nf-md-content_copy" size={14} />
          </button>
          <button
            onClick={handleRemove}
            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            title="Remove tooltip"
          >
            <NerdIcon icon="ui-close" size={14} />
          </button>
        </div>
      </div>
      
      {/* Tips Badges */}
      <div className="flex flex-wrap gap-1 mt-2 ml-5">
        {tooltip.tips.map((tip, index) => (
          <span
            key={index}
            className="px-2 py-0.5 text-xs font-mono bg-[#0f3460] text-[#06d6a0] rounded"
          >
            {tip}
          </span>
        ))}
        {tooltip.tips.length === 0 && (
          <span className="text-xs text-gray-500 italic">
            No trigger commands
          </span>
        )}
      </div>
      
      {/* Template Preview */}
      {tooltip.template && (
        <div className="mt-2 ml-5 text-xs text-gray-500 font-mono truncate max-w-[200px]">
          {tooltip.template}
        </div>
      )}
      
      {/* Style and Color Indicators */}
      <div className="mt-2 ml-5 flex items-center gap-2">
        <span className={`
          text-xs px-1.5 py-0.5 rounded
          ${tooltip.style === 'powerline' ? 'bg-purple-900/50 text-purple-300' : ''}
          ${tooltip.style === 'diamond' ? 'bg-blue-900/50 text-blue-300' : ''}
          ${tooltip.style === 'plain' ? 'bg-gray-700/50 text-gray-400' : ''}
          ${tooltip.style === 'accordion' ? 'bg-amber-900/50 text-amber-300' : ''}
        `}>
          {tooltip.style}
        </span>
        {tooltip.foreground && (
          <span 
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: tooltip.foreground }}
            title={`Foreground: ${tooltip.foreground}`}
          />
        )}
        {tooltip.background && (
          <span 
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: tooltip.background }}
            title={`Background: ${tooltip.background}`}
          />
        )}
      </div>
    </div>
  );
}

export function SortableTooltipCard({ tooltip }: TooltipCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tooltip.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TooltipCard tooltip={tooltip} isDragging={isDragging} />
    </div>
  );
}
