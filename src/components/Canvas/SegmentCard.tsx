import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import type { Segment } from '../../types/ohmyposh';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import { DynamicIcon } from '../DynamicIcon';

interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isDragging?: boolean;
}

export function SegmentCard({
  segment,
  isSelected,
  onSelect,
  onRemove,
  isDragging,
}: SegmentCardProps) {
  const metadata = useSegmentMetadata(segment.type);

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-all ${
        isDragging
          ? 'opacity-90 shadow-lg scale-105'
          : isSelected
          ? 'ring-2 ring-[#e94560]'
          : 'hover:ring-1 hover:ring-gray-500'
      }`}
      style={{
        backgroundColor: segment.background || '#61AFEF',
        color: segment.foreground || '#ffffff',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <GripVertical size={14} className="opacity-50 cursor-grab" />
      {metadata?.icon ? (
        <DynamicIcon name={metadata.icon} size={14} className="opacity-90" />
      ) : (
        <DynamicIcon name="Package" size={14} className="opacity-90" />
      )}
      <span className="text-sm font-medium">{metadata?.name || segment.type}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-1 p-0.5 rounded hover:bg-black/20 transition-colors"
        title="Remove segment"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function SortableSegmentCard(props: SegmentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SegmentCard {...props} />
    </div>
  );
}
