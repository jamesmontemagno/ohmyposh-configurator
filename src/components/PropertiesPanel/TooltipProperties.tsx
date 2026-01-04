import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { useSegmentMetadata } from '../../hooks/useSegmentMetadata';
import { TipsEditor } from './TipsEditor';
import {
  StyleSection,
  ColorsSection,
  TemplateSection,
  ResponsiveSection,
  OptionsSection,
} from './sections';
import type { Tooltip } from '../../types/ohmyposh';

export function TooltipProperties() {
  const config = useConfigStore((state) => state.config);
  const selectedTooltipId = useConfigStore((state) => state.selectedTooltipId);
  const updateTooltip = useConfigStore((state) => state.updateTooltip);
  const duplicateTooltip = useConfigStore((state) => state.duplicateTooltip);
  const removeTooltip = useConfigStore((state) => state.removeTooltip);

  const tooltip = config.tooltips?.find((t) => t.id === selectedTooltipId);
  const metadata = useSegmentMetadata(tooltip?.type || '');

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
      <StyleSection item={tooltip} onUpdate={handleUpdate} />

      {/* Colors Section */}
      <ColorsSection item={tooltip} onUpdate={handleUpdate} />

      {/* Template Section */}
      <TemplateSection item={tooltip} metadata={metadata} onUpdate={handleUpdate} />

      {/* Responsive Display Section */}
      <ResponsiveSection item={tooltip} onUpdate={handleUpdate} itemType="tooltip" />

      {/* Options Section */}
      <OptionsSection item={tooltip} metadata={metadata} onUpdate={handleUpdate} />

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
