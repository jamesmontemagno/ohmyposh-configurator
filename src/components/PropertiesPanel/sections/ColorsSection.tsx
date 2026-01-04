import { NerdIcon } from '../../NerdIcon';
import { ColorInput } from '../ColorInput';
import { ColorTemplateEditor } from '../ColorTemplateEditor';
import type { Segment, Tooltip } from '../../../types/ohmyposh';

interface ColorsSectionProps {
  item: Segment | Tooltip;
  onUpdate: (updates: Partial<Segment | Tooltip>) => void;
}

export function ColorsSection({ item, onUpdate }: ColorsSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <NerdIcon icon="ui-palette" size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-300">Colors</span>
      </div>
      <div className="space-y-2">
        <ColorInput
          label="Foreground"
          value={item.foreground || '#ffffff'}
          onChange={(value) => onUpdate({ foreground: value })}
        />
        <ColorInput
          label="Background"
          value={item.background || ''}
          onChange={(value) => onUpdate({ background: value || undefined })}
          allowEmpty
        />
        
        {/* Conditional Color Templates */}
        <ColorTemplateEditor
          label="Conditional Foreground Colors"
          templates={item.foreground_templates ?? []}
          onChange={(templates) => onUpdate({
            foreground_templates: templates.length > 0 ? templates : undefined
          })}
          defaultColor={item.foreground ?? ''}
          colorType="foreground"
        />
        <ColorTemplateEditor
          label="Conditional Background Colors"
          templates={item.background_templates ?? []}
          onChange={(templates) => onUpdate({
            background_templates: templates.length > 0 ? templates : undefined
          })}
          defaultColor={item.background ?? ''}
          colorType="background"
        />
      </div>
    </div>
  );
}
