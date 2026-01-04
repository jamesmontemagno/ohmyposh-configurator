import { NerdIcon } from '../NerdIcon';
import { useConfigStore, getSelectedSegment, findBlockForSegment } from '../../store/configStore';
import { useAdvancedFeaturesStore } from '../../store/advancedFeaturesStore';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import { FolderFilterEditor } from './FolderFilterEditor';
import { CacheSettingsEditor } from './CacheSettingsEditor';
import {
  StyleSection,
  ColorsSection,
  TemplateSection,
  ResponsiveSection,
  OptionsSection,
} from './sections';
import type { Segment } from '../../types/ohmyposh';

export function SegmentProperties() {
  const config = useConfigStore((state) => state.config);
  const selectedSegmentId = useConfigStore((state) => state.selectedSegmentId);
  const updateSegment = useConfigStore((state) => state.updateSegment);
  const duplicateSegment = useConfigStore((state) => state.duplicateSegment);
  const features = useAdvancedFeaturesStore((state) => state.features);

  const segment = getSelectedSegment(config, selectedSegmentId);
  const block = segment ? findBlockForSegment(config, segment.id) : undefined;
  const metadata = useSegmentMetadata(segment?.type || '');

  // Alias validation
  const aliasPattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  const isValidAlias = !segment?.alias || aliasPattern.test(segment.alias);
  
  // Check for duplicate aliases
  const duplicateAlias = segment?.alias
    ? config.blocks.some((b) =>
        b.segments.some((s) => s.id !== segment.id && s.alias === segment.alias)
      )
    : false;

  if (!segment || !block) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <NerdIcon icon="tool-settings" size={32} className="mx-auto mb-2 opacity-50" />
        <p>Select a segment to edit its properties</p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Segment>) => {
    updateSegment(block.id, segment.id, updates);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#0f3460]">
        <span className="text-xl">{metadata?.icon || '📦'}</span>
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            {metadata?.name || segment.type}
          </h3>
          <p className="text-xs text-gray-500">{segment.type}</p>
        </div>
      </div>

      {/* Style Section */}
      <StyleSection item={segment} onUpdate={handleUpdate} />

      {/* Template Alias Section */}
      {features.templateAlias && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <NerdIcon icon="vcs-tag" size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-300">Template Alias</span>
          </div>
          <input
            type="text"
            value={segment.alias ?? ''}
            onChange={(e) => handleUpdate({ alias: e.target.value || undefined })}
            placeholder="e.g., Git, Node, MySegment"
            className="w-full bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#e94560]"
          />
          {!isValidAlias && (
            <p className="text-xs text-[#e94560] mt-1">
              Alias must start with a letter and contain only letters, numbers, and underscores
            </p>
          )}
          {isValidAlias && duplicateAlias && (
            <p className="text-xs text-[#e94560] mt-1">
              This alias is already used by another segment
            </p>
          )}
          {isValidAlias && !duplicateAlias && (
            <p className="text-xs text-gray-500 mt-1">
              Reference in templates as <code className="text-[#e94560]">.Segments.{segment.alias || 'Alias'}</code>
            </p>
          )}
        </div>
      )}

      {/* Colors Section */}
      <ColorsSection item={segment} onUpdate={handleUpdate} showColorTemplates={features.colorTemplates} />

      {/* Template Section */}
      <TemplateSection 
        item={segment} 
        metadata={metadata} 
        onUpdate={handleUpdate}
        showTemplatesLogic={features.templatesLogic}
      />

      {/* Responsive Display Section */}
      {features.responsiveDisplay && (
        <ResponsiveSection item={segment} onUpdate={handleUpdate} itemType="segment" />
      )}

      {/* Interactive Toggle */}
      {features.interactive && (
        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={segment.interactive ?? false}
              onChange={(e) => handleUpdate({ 
                interactive: e.target.checked || undefined 
              })}
              className="mt-0.5 rounded border-[#0f3460] bg-[#0f0f23] text-[#e94560] focus:ring-[#e94560]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <NerdIcon icon="ui-external-link" size={14} className="text-gray-400" />
                <span className="text-sm text-white">Interactive</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Enable clickable elements (OSC 8 hyperlinks). Supported in iTerm2, Windows Terminal, Hyper, and others.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Folder Filters */}
      {features.folderFilters && (
        <FolderFilterEditor
          includeFolders={segment.include_folders ?? []}
          excludeFolders={segment.exclude_folders ?? []}
          onIncludeChange={(folders) => handleUpdate({
            include_folders: folders.length > 0 ? folders : undefined
          })}
          onExcludeChange={(folders) => handleUpdate({
            exclude_folders: folders.length > 0 ? folders : undefined
          })}
        />
      )}

      {/* Cache Settings */}
      {features.caching && (
        <CacheSettingsEditor
          cache={segment.cache}
          onChange={(cache) => handleUpdate({ cache })}
          segmentType={segment.type}
        />
      )}

      {/* Options Section */}
      <OptionsSection item={segment} metadata={metadata} onUpdate={handleUpdate} />

      {/* Actions */}
      <div className="pt-2 border-t border-[#0f3460]">
        <button
          onClick={() => duplicateSegment(block.id, segment.id)}
          className="w-full px-3 py-1.5 text-sm bg-[#0f3460] text-gray-200 rounded hover:bg-[#1a4a7a] transition-colors"
        >
          Duplicate Segment
        </button>
      </div>
    </div>
  );
}
