import { useDroppable } from '@dnd-kit/core';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore, generateId } from '../../store/configStore';
import { getSegmentMetadata } from '../../utils/segmentLoader';
import type { Block as BlockType, Segment } from '../../types/ohmyposh';
import { SortableSegmentCard } from './SegmentCard';

interface BlockProps {
  block: BlockType;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function EmptyBlockDropzone({ blockId }: { blockId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `empty-block-${blockId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full text-center py-4 text-gray-500 text-sm border-2 border-dashed rounded transition-colors ${
        isOver ? 'border-[#e94560] bg-[#e94560]/10' : 'border-[#0f3460]'
      }`}
    >
      Drop segments here or click to add
    </div>
  );
}

export function Block({ block, isSelected, onSelect, onRemove }: BlockProps) {
  const addSegment = useConfigStore((state) => state.addSegment);
  const selectSegment = useConfigStore((state) => state.selectSegment);
  const selectedSegmentId = useConfigStore((state) => state.selectedSegmentId);
  const removeSegment = useConfigStore((state) => state.removeSegment);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const segmentType = e.dataTransfer.getData('segment-type');
    if (segmentType) {
      const metadata = getSegmentMetadata(segmentType);
      if (metadata) {
        // Get the last segment in this block to inherit style/colors
        const lastSegment = block.segments[block.segments.length - 1];
        
        const newSegment: Segment = {
          id: generateId(),
          type: metadata.type,
          style: lastSegment?.style || 'powerline',
          powerline_symbol: lastSegment?.powerline_symbol || '\ue0b0',
          template: metadata.defaultTemplate || ` {{ .${metadata.name.replace(/\s/g, '')} }} `,
          options: metadata.defaultOptions,
        };
        
        // Inherit colors from previous segment, preserving undefined if not set
        if (lastSegment) {
          // If previous segment has the property (even if undefined), use its value
          if ('foreground' in lastSegment) {
            newSegment.foreground = lastSegment.foreground;
          } else {
            newSegment.foreground = metadata.defaultForeground || '#ffffff';
          }
          if ('background' in lastSegment) {
            newSegment.background = lastSegment.background;
          } else {
            newSegment.background = metadata.defaultBackground || '#61AFEF';
          }
        } else {
          // No previous segment, use defaults
          newSegment.foreground = metadata.defaultForeground || '#ffffff';
          newSegment.background = metadata.defaultBackground || '#61AFEF';
        }
        
        addSegment(block.id, newSegment);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div
      className={`bg-[#1a1a2e] rounded-lg transition-colors ${
        isSelected ? 'border-[3px] border-[#e94560]' : 'border-2 border-[#0f3460]'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#0f3460]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200">
            {block.type === 'rprompt' ? 'Right Prompt' : 'Prompt Block'}
          </span>
          <span className="text-xs text-gray-500">
            ({block.alignment || 'left'})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="p-1 text-gray-400 hover:text-white rounded transition-colors"
            title="Block settings"
          >
            <NerdIcon icon="tool-settings" size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
            title="Remove block"
          >
            <NerdIcon icon="action-trash" size={14} />
          </button>
        </div>
      </div>

      <div
        className="p-3 min-h-[80px] flex flex-wrap items-center gap-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {block.segments.length === 0 ? (
          <EmptyBlockDropzone blockId={block.id} />
        ) : (
          block.segments.map((segment) => (
            <SortableSegmentCard
              key={segment.id}
              segment={segment}
              isSelected={selectedSegmentId === segment.id}
              onSelect={() => selectSegment(segment.id)}
              onRemove={() => removeSegment(block.id, segment.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
