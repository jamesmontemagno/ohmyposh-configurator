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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore, generateId } from '../../store/configStore';
import { getSegmentMetadata } from '../../utils/segmentLoader';
import type { Block as BlockType, Segment, Tooltip } from '../../types/ohmyposh';
import { SortableSegmentCard, SegmentCard } from './SegmentCard';
import { SortableTooltipCard, TooltipCard } from './TooltipCard';

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

export function Canvas() {
  const config = useConfigStore((state) => state.config);
  const selectedBlockId = useConfigStore((state) => state.selectedBlockId);
  const selectBlock = useConfigStore((state) => state.selectBlock);
  const addBlock = useConfigStore((state) => state.addBlock);
  const removeBlock = useConfigStore((state) => state.removeBlock);
  const moveSegment = useConfigStore((state) => state.moveSegment);
  const addTooltip = useConfigStore((state) => state.addTooltip);
  const reorderTooltips = useConfigStore((state) => state.reorderTooltips);
  const selectTooltip = useConfigStore((state) => state.selectTooltip);
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<Tooltip | null>(null);
  const [tooltipsExpanded, setTooltipsExpanded] = useState(true);

  const tooltips = config.tooltips ?? [];
  const tooltipIds = tooltips.map((t) => t.id);

  const handleRemoveBlock = (blockId: string) => {
    const block = config.blocks.find(b => b.id === blockId);
    const segmentCount = block?.segments.length || 0;
    
    const message = segmentCount > 0
      ? `Are you sure you want to delete this block? It contains ${segmentCount} segment${segmentCount !== 1 ? 's' : ''}.`
      : 'Are you sure you want to delete this block?';
    
    if (window.confirm(message)) {
      removeBlock(blockId);
    }
  };

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
    // Check segments first
    for (const block of config.blocks) {
      const segment = block.segments.find((s) => s.id === active.id);
      if (segment) {
        setActiveSegment(segment);
        return;
      }
    }
    // Check tooltips
    const tooltip = tooltips.find((t) => t.id === active.id);
    if (tooltip) {
      setActiveTooltip(tooltip);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSegment(null);
    setActiveTooltip(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Check if this is a tooltip reorder
    const activeTooltipIdx = tooltipIds.indexOf(active.id as string);
    const overTooltipIdx = tooltipIds.indexOf(over.id as string);
    
    if (activeTooltipIdx !== -1 && overTooltipIdx !== -1) {
      reorderTooltips(activeTooltipIdx, overTooltipIdx);
      return;
    }

    // Handle segment movement
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

  const handleAddTooltip = () => {
    addTooltip({
      type: 'git',
      tips: ['git', 'g'],
      template: ' {{ .HEAD }}{{ if .BranchStatus }} {{ .BranchStatus }}{{ end }} ',
      style: 'plain',
      foreground: '#ffffff',
      background: '#193549',
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f23] p-4 overflow-auto" onClick={() => { selectBlock(null); selectTooltip(null); }}>
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
          items={[...allSegmentIds, ...tooltipIds]}
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
                onRemove={() => handleRemoveBlock(block.id)}
              />
            ))}

          <button
            onClick={() => addBlock()}
            className="w-full py-3 border-2 border-dashed border-[#0f3460] rounded-lg text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
          >
            <NerdIcon icon="ui-plus" size={18} />
            <span className="text-sm">Add Block</span>
          </button>

          {/* Divider */}
          <div className="my-2 border-t border-[#0f3460]" />

          {/* Tooltips Section */}
          <div className="space-y-3">
            {/* Section Header */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTooltipsExpanded(!tooltipsExpanded);
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
                {tooltipsExpanded ? '▼' : '▶'}
              </span>
            </button>

            {tooltipsExpanded && (
              <>
                <p className="text-xs text-gray-500 px-2">
                  Tooltips appear when you type specific commands. They provide context-aware information.
                </p>

                {/* Tooltips Grid */}
                {tooltips.length > 0 ? (
                  <SortableContext items={tooltipIds} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tooltips.map((tooltip) => (
                        <SortableTooltipCard key={tooltip.id} tooltip={tooltip} />
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
                    handleAddTooltip();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#06d6a0] hover:bg-[#1a1a2e] rounded transition-colors"
                >
                  <NerdIcon icon="ui-plus" size={16} />
                  Add Tooltip
                </button>
              </>
            )}
          </div>
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
          {activeTooltip && (
            <TooltipCard tooltip={activeTooltip} isDragging />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
