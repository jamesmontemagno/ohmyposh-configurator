import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore, getSelectedSegment, findBlockForSegment } from '../../store/configStore';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import { POWERLINE_SYMBOLS, LEADING_DIAMOND_SYMBOLS, TRAILING_DIAMOND_SYMBOLS } from '../../constants/symbols';
import { ColorInput } from './ColorInput';
import { SymbolPicker } from './SymbolPicker';
import { AvailableProperties } from './AvailableProperties';
import { AvailableMethods } from './AvailableMethods';
import { AvailableOptions } from './AvailableOptions';
import { SegmentOptionsEditor } from './SegmentOptionsEditor';
import { NerdFontPicker } from './NerdFontPicker';
import { TemplateInput } from './TemplateInput';
import type { Segment, SegmentStyle } from '../../types/ohmyposh';

const segmentStyles: { value: SegmentStyle; label: string }[] = [
  { value: 'powerline', label: 'Powerline' },
  { value: 'plain', label: 'Plain' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'accordion', label: 'Accordion' },
];

export function SegmentProperties() {
  const config = useConfigStore((state) => state.config);
  const selectedSegmentId = useConfigStore((state) => state.selectedSegmentId);
  const updateSegment = useConfigStore((state) => state.updateSegment);
  const duplicateSegment = useConfigStore((state) => state.duplicateSegment);

  const segment = getSelectedSegment(config, selectedSegmentId);
  const block = segment ? findBlockForSegment(config, segment.id) : undefined;
  const metadata = useSegmentMetadata(segment?.type || '');

  const [responsiveExpanded, setResponsiveExpanded] = useState(false);

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
      <div>
        <div className="flex items-center gap-2 mb-2">
          <NerdIcon icon="tool-sliders" size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Style</span>
        </div>
        <select
          value={segment.style}
          onChange={(e) => handleUpdate({ style: e.target.value as SegmentStyle })}
          className="w-full px-2 py-1.5 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        >
          {segmentStyles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>

        {segment.style === 'powerline' && (
          <div className="mt-2 space-y-3">
            <SymbolPicker
              label="Powerline Symbol"
              value={segment.powerline_symbol || '\ue0b0'}
              onChange={(value) => handleUpdate({ powerline_symbol: value || '\ue0b0' })}
              symbols={POWERLINE_SYMBOLS}
              placeholder="Enter symbol"
            />
            
            <SymbolPicker
              label="Leading Powerline Symbol"
              value={segment.leading_powerline_symbol || ''}
              onChange={(value) => handleUpdate({ leading_powerline_symbol: value || undefined })}
              symbols={LEADING_DIAMOND_SYMBOLS}
              placeholder="Optional leading symbol"
            />
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={segment.invert_powerline ?? false}
                onChange={(e) => handleUpdate({ 
                  invert_powerline: e.target.checked || undefined 
                })}
                className="rounded border-[#0f3460] bg-[#0f0f23] text-[#e94560] focus:ring-[#e94560]"
              />
              <span className="text-sm text-white">Invert Powerline</span>
            </label>
            <p className="text-xs text-gray-500 -mt-1 ml-6">
              Flip the powerline symbol vertically
            </p>
          </div>
        )}

        {segment.style === 'diamond' && (
          <div className="mt-2 space-y-2">
            <SymbolPicker
              label="Leading Diamond"
              value={segment.leading_diamond || ''}
              onChange={(value) => handleUpdate({ leading_diamond: value || undefined })}
              symbols={LEADING_DIAMOND_SYMBOLS}
              placeholder="Left-pointing symbol"
            />
            <SymbolPicker
              label="Trailing Diamond"
              value={segment.trailing_diamond || ''}
              onChange={(value) => handleUpdate({ trailing_diamond: value || undefined })}
              symbols={TRAILING_DIAMOND_SYMBOLS}
              placeholder="Right-pointing symbol"
            />
          </div>
        )}
      </div>

      {/* Template Alias Section */}
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

      {/* Colors Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <NerdIcon icon="ui-palette" size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Colors</span>
        </div>
        <div className="space-y-2">
          <ColorInput
            label="Foreground"
            value={segment.foreground || '#ffffff'}
            onChange={(value) => handleUpdate({ foreground: value })}
          />
          <ColorInput
            label="Background"
            value={segment.background || ''}
            onChange={(value) => handleUpdate({ background: value || undefined })}
            allowEmpty
          />
        </div>
      </div>

      {/* Template Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <NerdIcon icon="ui-code" size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Template</span>
        </div>
        <TemplateInput
          value={segment.template || ''}
          onChange={(value) => handleUpdate({ template: value })}
          placeholder="{{ .Data }}"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Uses Go template syntax. Unicode symbols shown as \uXXXX.{' '}
          <a
            href="https://ohmyposh.dev/docs/configuration/templates"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e94560] hover:underline"
          >
            Learn more
          </a>
        </p>
        
        {/* Templates Logic - only show if templates array exists */}
        {segment.templates && segment.templates.length > 0 && (
          <div className="mt-3">
            <label className="block text-xs text-gray-400 mb-1">
              Templates Logic
            </label>
            <select
              value={segment.templates_logic ?? 'first_match'}
              onChange={(e) => handleUpdate({ 
                templates_logic: e.target.value as 'first_match' | 'join'
              })}
              className="w-full bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#e94560]"
            >
              <option value="first_match">First Match (use first non-empty result)</option>
              <option value="join">Join (concatenate all non-empty results)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              How to handle multiple templates
            </p>
          </div>
        )}
        
        {/* Nerd Font Icon Picker */}
        <div className="mt-2">
          <NerdFontPicker />
        </div>
        
        {/* Available Properties */}
        {metadata?.properties && metadata.properties.length > 0 && (
          <AvailableProperties properties={metadata.properties} />
        )}
        
        {/* Available Methods */}
        {metadata?.methods && metadata.methods.length > 0 && (
          <AvailableMethods methods={metadata.methods} />
        )}
      </div>

      {/* Responsive Display Section */}
      <div className="space-y-3 p-3 bg-[#1a1a2e] rounded-lg">
        <button 
          onClick={() => setResponsiveExpanded(!responsiveExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <NerdIcon icon="ui-monitor" className="text-[#e94560]" />
            <span className="text-sm font-medium text-white">Responsive Display</span>
          </div>
          <span className="text-gray-400">{responsiveExpanded ? '▼' : '▶'}</span>
        </button>
        
        {responsiveExpanded && (
          <div className="space-y-3 pt-2 border-t border-[#0f3460]">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Minimum Width (columns)
              </label>
              <input
                type="number"
                min="0"
                value={segment.min_width ?? ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  if (value === undefined || (value >= 0 && !isNaN(value))) {
                    handleUpdate({ min_width: value });
                  }
                }}
                placeholder="No minimum"
                className="w-full bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Segment hidden when terminal is narrower than this
              </p>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Maximum Width (columns)
              </label>
              <input
                type="number"
                min="0"
                value={segment.max_width ?? ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  if (value === undefined || (value >= 0 && !isNaN(value))) {
                    handleUpdate({ max_width: value });
                  }
                }}
                placeholder="No maximum"
                className="w-full bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Segment hidden when terminal is wider than this
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Editable Segment Options */}
      {metadata?.options && metadata.options.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <NerdIcon icon="tool-sliders" size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-300">Options</span>
          </div>
          <SegmentOptionsEditor
            segment={segment}
            availableOptions={metadata.options}
            onUpdate={(options) => handleUpdate({ options })}
          />
          
          {/* Reference for Available Options */}
          <AvailableOptions options={metadata.options} />
        </div>
      )}

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
