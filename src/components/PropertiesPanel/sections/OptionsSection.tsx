import { NerdIcon } from '../../NerdIcon';
import { SegmentOptionsEditor } from '../SegmentOptionsEditor';
import { AvailableOptions } from '../AvailableOptions';
import type { Segment, Tooltip, SegmentMetadata } from '../../../types/ohmyposh';

interface OptionsSectionProps {
  item: Segment | Tooltip;
  metadata: SegmentMetadata | undefined;
  onUpdate: (updates: Partial<Segment | Tooltip>) => void;
}

export function OptionsSection({ item, metadata, onUpdate }: OptionsSectionProps) {
  if (!metadata?.options || metadata.options.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <NerdIcon icon="tool-sliders" size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-300">Options</span>
      </div>
      <SegmentOptionsEditor
        segment={item}
        availableOptions={metadata.options}
        onUpdate={(options) => onUpdate({ options })}
      />
      
      {/* Reference for Available Options */}
      <AvailableOptions options={metadata.options} />
    </div>
  );
}
