import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { ContextMenu } from '../ContextMenu';
import type { Segment } from '../../types/ohmyposh';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import { useConfigStore } from '../../store/configStore';
import { resolvePaletteColor, getActivePalette } from '../../utils/paletteResolver';
import { getSegmentDocumentationUrl } from '../../utils/segmentDocumentation';

interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  isDragging?: boolean;
}

export function SegmentCard({
  segment,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  isDragging,
}: SegmentCardProps) {
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const metadata = useSegmentMetadata(segment.type);
  const config = useConfigStore((state) => state.config);
  const previewPaletteName = useConfigStore((state) => state.previewPaletteName);

  // Resolve palette colors for display
  const palette = getActivePalette(config, previewPaletteName);
  const resolvedBg = resolvePaletteColor(segment.background, palette);
  const resolvedFg = resolvePaletteColor(segment.foreground, palette);
  
  const backgroundColor = resolvedBg.color || 'transparent';
  const foregroundColor = resolvedFg.color || '#ffffff';

  const tooltipText = metadata?.name && metadata?.description 
    ? `${metadata.name}\n\n${metadata.description}\n\nRight-click for actions`
    : `${metadata?.name || segment.type}\n\nRight-click for actions`;

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
        backgroundColor,
        color: foregroundColor,
        border: backgroundColor === 'transparent' ? '1px solid rgba(255,255,255,0.2)' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
      }}
      title={tooltipText}
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
      {contextMenuPosition && (
        <ContextMenu
          position={contextMenuPosition}
          onClose={() => setContextMenuPosition(null)}
          items={[
            { label: 'Configure segment', icon: 'tool-settings', onSelect },
            { label: 'Duplicate segment', icon: 'action-copy', onSelect: onDuplicate },
            {
              label: 'View documentation',
              icon: 'misc-book',
              onSelect: () => window.open(
                getSegmentDocumentationUrl(segment.type, metadata?.category),
                '_blank',
                'noopener,noreferrer',
              ),
              separatorBefore: true,
            },
            {
              label: 'Remove segment',
              icon: 'action-trash',
              onSelect: onRemove,
              destructive: true,
              separatorBefore: true,
            },
          ]}
        />
      )}
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
