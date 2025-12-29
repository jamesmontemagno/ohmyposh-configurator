import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { segmentCategories } from '../../data/segments';
import { loadSegmentCategory, getSegmentCategories } from '../../utils/segmentLoader';
import type { SegmentMetadata, Segment } from '../../types/ohmyposh';
import { useConfigStore, generateId } from '../../store/configStore';
import { DynamicIcon } from '../DynamicIcon';

interface SegmentItemProps {
  segment: SegmentMetadata;
  onAdd: (segment: SegmentMetadata) => void;
}

function SegmentItem({ segment, onAdd }: SegmentItemProps) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#1a1a2e] rounded cursor-pointer group transition-colors"
      onClick={() => onAdd(segment)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('segment-type', segment.type);
        e.dataTransfer.effectAllowed = 'copy';
      }}
    >
      <GripVertical size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <DynamicIcon name={segment.icon} size={16} className="text-gray-400" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-200 truncate">{segment.name}</div>
      </div>
      <button
        className="text-xs px-1.5 py-0.5 bg-[#0f3460] text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1a4a7a]"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(segment);
        }}
      >
        Add
      </button>
    </div>
  );
}

interface CategorySectionProps {
  category: { id: string; name: string; icon: string };
  segments: SegmentMetadata[];
  onAdd: (segment: SegmentMetadata) => void;
  defaultExpanded?: boolean;
}

function CategorySection({ category, segments, onAdd, defaultExpanded = false }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-1">
      <button
        className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-[#1a1a2e] rounded transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
        <DynamicIcon name={category.icon} size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-200">{category.name}</span>
        <span className="text-xs text-gray-500 ml-auto">{segments.length}</span>
      </button>
      {isExpanded && (
        <div className="ml-4 mt-1">
          {segments.map((segment) => (
            <SegmentItem key={segment.type} segment={segment} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SegmentPicker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allSegments, setAllSegments] = useState<SegmentMetadata[]>([]);
  const [segmentsByCategory, setSegmentsByCategory] = useState<Record<string, SegmentMetadata[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const config = useConfigStore((state) => state.config);
  const selectedBlockId = useConfigStore((state) => state.selectedBlockId);
  const addSegment = useConfigStore((state) => state.addSegment);

  // Load segments on mount
  useEffect(() => {
    async function loadSegments() {
      setIsLoading(true);
      try {
        const categories = getSegmentCategories();
        const loadedSegmentsByCategory: Record<string, SegmentMetadata[]> = {};
        const allLoadedSegments: SegmentMetadata[] = [];

        // Load all categories in parallel
        await Promise.all(
          categories.map(async (category) => {
            const segments = await loadSegmentCategory(category);
            loadedSegmentsByCategory[category] = segments;
            allLoadedSegments.push(...segments);
          })
        );

        setSegmentsByCategory(loadedSegmentsByCategory);
        setAllSegments(allLoadedSegments);
      } catch (error) {
        console.error('Error loading segments:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSegments();
  }, []);

  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return allSegments.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.type.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
    );
  }, [searchQuery, allSegments]);

  const handleAddSegment = (metadata: SegmentMetadata) => {
    // Add to the selected block, or the first block if none selected
    const targetBlock = config.blocks.find((b) => b.id === selectedBlockId) || config.blocks[0];
    if (!targetBlock) return;

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

    addSegment(targetBlock.id, newSegment);
  };

  return (
    <div className="flex flex-col h-full bg-[#16213e] border-r border-[#0f3460]">
      <div className="p-3 border-b border-[#0f3460]">
        <h2 className="text-sm font-semibold text-gray-200 mb-2">Segments</h2>
        <div className="relative">
          <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search segments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e94560]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-500">Loading segments...</p>
          </div>
        ) : filteredSegments ? (
          // Show search results
          <div>
            <p className="text-xs text-gray-500 px-2 mb-2">
              {filteredSegments.length} result{filteredSegments.length !== 1 ? 's' : ''}
            </p>
            {filteredSegments.map((segment) => (
              <SegmentItem key={segment.type} segment={segment} onAdd={handleAddSegment} />
            ))}
          </div>
        ) : (
          // Show categories
          segmentCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              segments={segmentsByCategory[category.id] || []}
              onAdd={handleAddSegment}
              defaultExpanded={category.id === 'system' || category.id === 'scm'}
            />
          ))
        )}
      </div>

      <div className="p-3 border-t border-[#0f3460] text-xs text-gray-500">
        <p>Drag or click to add segments</p>
      </div>
    </div>
  );
}
