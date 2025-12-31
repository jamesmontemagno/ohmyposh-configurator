import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NerdIcon } from '../NerdIcon';
import type { Segment } from '../../types/ohmyposh';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';

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
          ? 'ring-[3px] ring-[#e94560]'
          : 'hover:ring-1 hover:ring-gray-500'
      }`}
      style={{
        backgroundColor: segment.background || 'transparent',
        color: segment.foreground || '#ffffff',
        border: !segment.background ? '1px solid rgba(255,255,255,0.2)' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      title={metadata ? `${metadata.name}\n\n${metadata.description}` : segment.type}
    >
      <NerdIcon icon="ui-grip-vertical" size={14} className="opacity-50 cursor-grab" />
      {metadata?.icon ? (
        <NerdIcon icon={metadata.icon} size={14} className="opacity-90" />
      ) : (
        <NerdIcon icon="file-package" size={14} className="opacity-90" />
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
        <NerdIcon icon="ui-close" size={12} />
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
