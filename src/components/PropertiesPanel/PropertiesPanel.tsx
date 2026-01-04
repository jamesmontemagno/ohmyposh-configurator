import { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import { GlobalSettings } from './GlobalSettings';
import { BlockProperties } from './BlockProperties';
import { SegmentProperties } from './SegmentProperties';
import { TooltipProperties } from './TooltipProperties';
import { PaletteEditorDialog } from '../PaletteEditorDialog';
import { NerdIcon } from '../NerdIcon';

export function PropertiesPanel() {
  const [showPaletteDialog, setShowPaletteDialog] = useState(false);
  const selectedBlockId = useConfigStore((state) => state.selectedBlockId);
  const selectedSegmentId = useConfigStore((state) => state.selectedSegmentId);
  const selectedTooltipId = useConfigStore((state) => state.selectedTooltipId);
  const config = useConfigStore((state) => state.config);
  
  // Count palette entries for badge
  const paletteCount = Object.keys(config.palette || {}).length;
  const palettesCount = config.palettes?.list ? Object.keys(config.palettes.list).length : 0;
  const totalPaletteCount = paletteCount + palettesCount;

  return (
    <div className="flex flex-col h-full bg-[#16213e] border-l border-[#0f3460]">
      <div className="p-3 border-b border-[#0f3460]">
        <h2 className="text-sm font-semibold text-gray-200">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Palette Editor Button */}
        <button
          onClick={() => setShowPaletteDialog(true)}
          className="w-full mb-3 flex items-center justify-between p-2.5 bg-[#0f0f23] border border-[#0f3460] rounded-lg hover:border-purple-500/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <NerdIcon icon="ui-palette" size={16} className="text-purple-400" />
            <span className="text-sm font-medium text-white">Palette Editor</span>
          </div>
          {totalPaletteCount > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
              {totalPaletteCount}
            </span>
          )}
        </button>
        
        <GlobalSettings />
        {selectedBlockId && <BlockProperties />}
        {selectedSegmentId && <SegmentProperties />}
        {selectedTooltipId && <TooltipProperties />}
      </div>
      
      {/* Palette Editor Dialog */}
      <PaletteEditorDialog 
        isOpen={showPaletteDialog} 
        onClose={() => setShowPaletteDialog(false)} 
      />
    </div>
  );
}
