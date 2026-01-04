import { useConfigStore } from '../../store/configStore';
import { GlobalSettings } from './GlobalSettings';
import { BlockProperties } from './BlockProperties';
import { SegmentProperties } from './SegmentProperties';
import { TooltipProperties } from './TooltipProperties';

export function PropertiesPanel() {
  const selectedBlockId = useConfigStore((state) => state.selectedBlockId);
  const selectedSegmentId = useConfigStore((state) => state.selectedSegmentId);
  const selectedTooltipId = useConfigStore((state) => state.selectedTooltipId);

  return (
    <div className="flex flex-col h-full bg-[#16213e] border-l border-[#0f3460]">
      <div className="p-3 border-b border-[#0f3460]">
        <h2 className="text-sm font-semibold text-gray-200">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <GlobalSettings />
        {selectedBlockId && <BlockProperties />}
        {selectedSegmentId && <SegmentProperties />}
        {selectedTooltipId && <TooltipProperties />}
      </div>
    </div>
  );
}
