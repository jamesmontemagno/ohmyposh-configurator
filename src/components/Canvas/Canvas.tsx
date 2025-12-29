import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Trash2, Settings } from 'lucide-react';
import { useConfigStore, generateId } from '../../store/configStore';
import { getSegmentMetadata } from '../../utils/segmentLoader';
import type { Block as BlockType, Segment } from '../../types/ohmyposh';
import { SortableSegmentCard, SegmentCard } from './SegmentCard';

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

function Block({ block, isSelected, onSelect, onRemove }: BlockProps) {
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
        const newSegment: Segment = {
          id: generateId(),
          type: metadata.type,
          style: 'powerline',
          powerline_symbol: '\ue0b0',
          foreground: metadata.defaultForeground || '#ffffff',
          background: metadata.defaultBackground || '#61AFEF',
          template: metadata.defaultTemplate || ` {{ .${metadata.name.replace(/\s/g, '')} }} `,
          options: metadata.defaultOptions,
        };
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
        if (isSelected) {
          onSelect();
        } else {
          onSelect();
        }
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
            <Settings size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
            title="Remove block"
          >
            <Trash2 size={14} />
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

export function Canvas() {
  const config = useConfigStore((state) => state.config);
  const selectedBlockId = useConfigStore((state) => state.selectedBlockId);
  const selectBlock = useConfigStore((state) => state.selectBlock);
  const addBlock = useConfigStore((state) => state.addBlock);
  const removeBlock = useConfigStore((state) => state.removeBlock);
  const moveSegment = useConfigStore((state) => state.moveSegment);
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Collect all segment IDs from all blocks for global sorting
  const allSegmentIds = config.blocks.flatMap((block) => block.segments.map((s) => s.id));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    for (const block of config.blocks) {
      const segment = block.segments.find((s) => s.id === active.id);
      if (segment) {
        setActiveSegment(segment);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSegment(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Find source and destination blocks
    let sourceBlockId: string | null = null;
    let destBlockId: string | null = null;
    let sourceIndex = -1;
    let destIndex = -1;

    // Check if dropping on an empty block
    const emptyBlockMatch = over.id.toString().match(/^empty-block-(.+)$/);
    if (emptyBlockMatch) {
      destBlockId = emptyBlockMatch[1];
      destIndex = 0; // Add to the beginning of empty block
    }

    for (const block of config.blocks) {
      const activeIdx = block.segments.findIndex((s) => s.id === active.id);
      const overIdx = block.segments.findIndex((s) => s.id === over.id);

      if (activeIdx !== -1) {
        sourceBlockId = block.id;
        sourceIndex = activeIdx;
      }
      if (overIdx !== -1 && !destBlockId) {
        destBlockId = block.id;
        destIndex = overIdx;
      }
    }

    if (sourceBlockId && destBlockId && sourceIndex !== -1 && destIndex !== -1) {
      moveSegment(sourceBlockId, destBlockId, sourceIndex, destIndex);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f23] p-4 overflow-auto" onClick={() => selectBlock(null)}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-200 mb-1">Configuration Canvas</h2>
        <p className="text-xs text-gray-500">
          Drag segments to reorder. Click to select and configure.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={allSegmentIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex-1 space-y-4">
            {config.blocks.map((block) => (
              <Block
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => {
                  if (selectedBlockId === block.id) {
                    selectBlock(null);
                  } else {
                    selectBlock(block.id);
                  }
                }}
                onRemove={() => removeBlock(block.id)}
              />
            ))}

          <button
            onClick={() => addBlock()}
            className="w-full py-3 border-2 border-dashed border-[#0f3460] rounded-lg text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span className="text-sm">Add Block</span>
          </button>
        </div>
        </SortableContext>

        <DragOverlay>
          {activeSegment && (
            <SegmentCard
              segment={activeSegment}
              isSelected={false}
              onSelect={() => {}}
              onRemove={() => {}}
              isDragging
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
