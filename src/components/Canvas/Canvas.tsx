import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { useAdvancedFeaturesStore } from '../../store/advancedFeaturesStore';
import type { Segment, Tooltip } from '../../types/ohmyposh';
import { SegmentCard } from './SegmentCard';
import { TooltipCard } from './TooltipCard';
import { Block } from './Block';
import { TooltipsSection } from './TooltipsSection';

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
  const features = useAdvancedFeaturesStore((state) => state.features);
  
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

  const handleBlockSelect = (blockId: string) => {
    if (selectedBlockId === blockId) {
      selectBlock(null);
    } else {
      selectBlock(blockId);
    }
  };

  const handleCanvasClick = () => {
    selectBlock(null);
    selectTooltip(null);
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#0f0f23] p-4 overflow-auto" 
      onClick={handleCanvasClick}
    >
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
                onSelect={() => handleBlockSelect(block.id)}
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
            {features.tooltips && (
              <div className="my-2 border-t border-[#0f3460]" />
            )}

            {/* Tooltips Section */}
            {features.tooltips && (
              <TooltipsSection
                tooltips={tooltips}
                isExpanded={tooltipsExpanded}
                onToggle={() => setTooltipsExpanded(!tooltipsExpanded)}
                onAddTooltip={handleAddTooltip}
              />
            )}
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
