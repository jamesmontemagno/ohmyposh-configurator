import { useState, useMemo, useEffect } from 'react';
import { NerdIcon } from '../NerdIcon';
import { segmentCategories } from '../../data/segments';
import { loadSegmentCategory, getSegmentCategories } from '../../utils/segmentLoader';
import type { SegmentMetadata, Segment } from '../../types/ohmyposh';
import { useConfigStore, generateId } from '../../store/configStore';

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
      title={`${segment.name}\n\n${segment.description}`}
    >
      <NerdIcon icon="ui-grip-vertical" size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <NerdIcon icon={segment.icon} size={16} className="text-gray-400" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-200 truncate">{segment.name}</div>
        {segment.previewText && (
          <div className="text-xs text-gray-500 font-mono truncate">{segment.previewText}</div>
        )}
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
  isExpanded: boolean;
  onToggle: () => void;
}

function CategorySection({ category, segments, onAdd, isExpanded, onToggle }: CategorySectionProps) {
  return (
    <div className="mb-1">
      <button
        className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-[#1a1a2e] rounded transition-colors"
        onClick={onToggle}
      >
        {isExpanded ? (
          <NerdIcon icon="ui-chevron-down" size={16} className="text-gray-400" />
        ) : (
          <NerdIcon icon="ui-chevron-right" size={16} className="text-gray-400" />
        )}
        <NerdIcon icon={category.icon} size={16} className="text-gray-400" />
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
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

    // Get the last segment in the target block to inherit style/colors
    const lastSegment = targetBlock.segments[targetBlock.segments.length - 1];

    const newSegment: Segment = {
      id: generateId(),
      type: metadata.type,
      style: lastSegment?.style || 'powerline',
      powerline_symbol: lastSegment?.powerline_symbol || '\ue0b0',
      template: metadata.defaultTemplate || ` {{ .${metadata.name.replace(/\s/g, '')} }} `,
      options: metadata.defaultOptions,
      // Apply default cache settings from metadata if available
      cache: metadata.defaultCache ? {
        duration: metadata.defaultCache.duration,
        strategy: metadata.defaultCache.strategy,
      } : undefined,
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

    addSegment(targetBlock.id, newSegment);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(segmentCategories.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const allExpanded = segmentCategories.length > 0 && expandedCategories.size === segmentCategories.length;
  const allCollapsed = expandedCategories.size === 0;

  return (
    <div className="flex flex-col h-full bg-[#16213e] border-r border-[#0f3460]">
      <div className="p-3 border-b border-[#0f3460]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-200">Segments</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className={`p-1 rounded transition-colors ${allExpanded ? 'text-gray-600' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a2e]'}`}
              title="Expand all"
              disabled={allExpanded}
            >
              <NerdIcon icon="ui-unfold-more" size={16} />
            </button>
            <button
              onClick={collapseAll}
              className={`p-1 rounded transition-colors ${allCollapsed ? 'text-gray-600' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a2e]'}`}
              title="Collapse all"
              disabled={allCollapsed}
            >
              <NerdIcon icon="ui-unfold-less" size={16} />
            </button>
          </div>
        </div>
        <div className="relative">
          <NerdIcon icon="action-search" size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
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
              isExpanded={expandedCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
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
