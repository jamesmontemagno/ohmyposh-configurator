import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import { POWERLINE_SYMBOLS, LEADING_DIAMOND_SYMBOLS, TRAILING_DIAMOND_SYMBOLS } from '../../constants/symbols';
import { ColorInput } from './ColorInput';
import { ColorTemplateEditor } from './ColorTemplateEditor';
import { SymbolPicker } from './SymbolPicker';
import { AvailableProperties } from './AvailableProperties';
import { AvailableMethods } from './AvailableMethods';
import { AvailableOptions } from './AvailableOptions';
import { SegmentOptionsEditor } from './SegmentOptionsEditor';
import { NerdFontPicker } from './NerdFontPicker';
import { TemplateInput } from './TemplateInput';
import { TipsEditor } from './TipsEditor';
import type { Tooltip, SegmentStyle } from '../../types/ohmyposh';

const segmentStyles: { value: SegmentStyle; label: string }[] = [
  { value: 'powerline', label: 'Powerline' },
  { value: 'plain', label: 'Plain' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'accordion', label: 'Accordion' },
];

export function TooltipProperties() {
  const config = useConfigStore((state) => state.config);
  const selectedTooltipId = useConfigStore((state) => state.selectedTooltipId);
  const updateTooltip = useConfigStore((state) => state.updateTooltip);
  const duplicateTooltip = useConfigStore((state) => state.duplicateTooltip);
  const removeTooltip = useConfigStore((state) => state.removeTooltip);

  const tooltip = config.tooltips?.find((t) => t.id === selectedTooltipId);
  const metadata = useSegmentMetadata(tooltip?.type || '');

  const [responsiveExpanded, setResponsiveExpanded] = useState(false);

  if (!tooltip) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <NerdIcon icon="nf-md-tooltip_text" size={32} className="mx-auto mb-2 opacity-50" />
        <p>Select a tooltip to edit its properties</p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Tooltip>) => {
    updateTooltip(tooltip.id, updates);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#0f3460]">
        <NerdIcon icon="nf-md-tooltip_text" size={24} className="text-[#06d6a0]" />
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            Tooltip: {metadata?.name || tooltip.type}
          </h3>
          <p className="text-xs text-gray-500">
            Triggers: {tooltip.tips.join(', ') || 'none'}
          </p>
        </div>
      </div>

      {/* Tips Section - Most Important for Tooltips */}
      <div className="p-3 bg-[#1a1a2e] rounded-lg border border-[#06d6a0]/30">
        <div className="flex items-center gap-2 mb-2">
          <NerdIcon icon="nf-md-keyboard" size={14} className="text-[#06d6a0]" />
          <span className="text-xs font-medium text-[#06d6a0]">Trigger Commands</span>
        </div>
        <TipsEditor
          tips={tooltip.tips}
          onChange={(tips) => handleUpdate({ tips })}
        />
        <p className="text-xs text-gray-500 mt-2">
          Tooltip appears when user types these commands in the shell
        </p>
      </div>

      {/* Segment Type */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <NerdIcon icon="ui-package" size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Segment Type</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2e] rounded">
          <span className="text-lg">{metadata?.icon || '📦'}</span>
          <span className="text-sm text-gray-200">{metadata?.name || tooltip.type}</span>
          <span className="text-xs text-gray-500">({tooltip.type})</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          The segment type determines what data is shown in the tooltip
        </p>
      </div>

      {/* Style Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <NerdIcon icon="tool-sliders" size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Style</span>
        </div>
        <select
          value={tooltip.style}
          onChange={(e) => handleUpdate({ style: e.target.value as SegmentStyle })}
          className="w-full px-2 py-1.5 text-sm bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        >
          {segmentStyles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>

        {tooltip.style === 'powerline' && (
          <div className="mt-2 space-y-3">
            <SymbolPicker
              label="Powerline Symbol"
              value={tooltip.powerline_symbol || '\ue0b0'}
              onChange={(value) => handleUpdate({ powerline_symbol: value || '\ue0b0' })}
              symbols={POWERLINE_SYMBOLS}
              placeholder="Enter symbol"
            />
            
            <SymbolPicker
              label="Leading Powerline Symbol"
              value={tooltip.leading_powerline_symbol || ''}
              onChange={(value) => handleUpdate({ leading_powerline_symbol: value || undefined })}
              symbols={LEADING_DIAMOND_SYMBOLS}
              placeholder="Optional leading symbol"
            />
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tooltip.invert_powerline ?? false}
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

        {tooltip.style === 'diamond' && (
          <div className="mt-2 space-y-2">
            <SymbolPicker
              label="Leading Diamond"
              value={tooltip.leading_diamond || ''}
              onChange={(value) => handleUpdate({ leading_diamond: value || undefined })}
              symbols={LEADING_DIAMOND_SYMBOLS}
              placeholder="Left-pointing symbol"
            />
            <SymbolPicker
              label="Trailing Diamond"
              value={tooltip.trailing_diamond || ''}
              onChange={(value) => handleUpdate({ trailing_diamond: value || undefined })}
              symbols={TRAILING_DIAMOND_SYMBOLS}
              placeholder="Right-pointing symbol"
            />
          </div>
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
            value={tooltip.foreground || '#ffffff'}
            onChange={(value) => handleUpdate({ foreground: value })}
          />
          <ColorInput
            label="Background"
            value={tooltip.background || ''}
            onChange={(value) => handleUpdate({ background: value || undefined })}
            allowEmpty
          />
          
          {/* Conditional Color Templates */}
          <ColorTemplateEditor
            label="Conditional Foreground Colors"
            templates={tooltip.foreground_templates ?? []}
            onChange={(templates) => handleUpdate({
              foreground_templates: templates.length > 0 ? templates : undefined
            })}
            defaultColor={tooltip.foreground ?? ''}
            colorType="foreground"
          />
          <ColorTemplateEditor
            label="Conditional Background Colors"
            templates={tooltip.background_templates ?? []}
            onChange={(templates) => handleUpdate({
              background_templates: templates.length > 0 ? templates : undefined
            })}
            defaultColor={tooltip.background ?? ''}
            colorType="background"
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
          value={tooltip.template || ''}
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
                value={tooltip.min_width ?? ''}
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
                Tooltip hidden when terminal is narrower than this
              </p>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Maximum Width (columns)
              </label>
              <input
                type="number"
                min="0"
                value={tooltip.max_width ?? ''}
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
                Tooltip hidden when terminal is wider than this
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
            segment={tooltip}
            availableOptions={metadata.options}
            onUpdate={(options) => handleUpdate({ options })}
          />
          
          {/* Reference for Available Options */}
          <AvailableOptions options={metadata.options} />
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 border-t border-[#0f3460] space-y-2">
        <button
          onClick={() => duplicateTooltip(tooltip.id)}
          className="w-full px-3 py-1.5 text-sm bg-[#0f3460] text-gray-200 rounded hover:bg-[#1a4a7a] transition-colors"
        >
          Duplicate Tooltip
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this tooltip?')) {
              removeTooltip(tooltip.id);
            }
          }}
          className="w-full px-3 py-1.5 text-sm bg-[#3d1a1a] text-red-300 rounded hover:bg-[#4d2020] transition-colors"
        >
          Delete Tooltip
        </button>
      </div>
    </div>
  );
}
