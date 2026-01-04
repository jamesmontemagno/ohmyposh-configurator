import { NerdIcon } from '../../NerdIcon';
import { TemplateInput } from '../TemplateInput';
import { NerdFontPicker } from '../NerdFontPicker';
import { AvailableProperties } from '../AvailableProperties';
import { AvailableMethods } from '../AvailableMethods';
import type { Segment, Tooltip, SegmentMetadata } from '../../../types/ohmyposh';

interface TemplateSectionProps {
  item: Segment | Tooltip;
  metadata: SegmentMetadata | undefined;
  onUpdate: (updates: Partial<Segment | Tooltip>) => void;
  /** Show templates_logic dropdown (only for segments with templates array) */
  showTemplatesLogic?: boolean;
}

export function TemplateSection({ item, metadata, onUpdate, showTemplatesLogic }: TemplateSectionProps) {
  const segment = item as Segment;
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <NerdIcon icon="ui-code" size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-300">Template</span>
      </div>
      <TemplateInput
        value={item.template || ''}
        onChange={(value) => onUpdate({ template: value })}
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
      {showTemplatesLogic && segment.templates && segment.templates.length > 0 && (
        <div className="mt-3">
          <label className="block text-xs text-gray-400 mb-1">
            Templates Logic
          </label>
          <select
            value={segment.templates_logic ?? 'first_match'}
            onChange={(e) => onUpdate({ 
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
  );
}
