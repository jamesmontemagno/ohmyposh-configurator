import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { ColorSwatch } from './ColorSwatch';
import { isHexColor } from '../../utils/paletteResolver';

interface PaletteEntry {
  key: string;
  value: string;
  isEditing: boolean;
}

interface PaletteEntryRowProps {
  entry: PaletteEntry;
  palette: Record<string, string>;
  onUpdate: (key: string, value: string, newKey?: string) => void;
  onDelete: (key: string) => void;
}

/**
 * Single palette entry editor row
 */
export function PaletteEntryRow({
  entry,
  palette,
  onUpdate,
  onDelete,
}: PaletteEntryRowProps) {
  const [editKey, setEditKey] = useState(entry.key);
  const [editValue, setEditValue] = useState(entry.value);
  const [isEditing, setIsEditing] = useState(entry.isEditing);
  
  const handleSave = () => {
    if (editKey.trim() && editValue.trim()) {
      onUpdate(entry.key, editValue.trim(), editKey !== entry.key ? editKey.trim() : undefined);
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    setEditKey(entry.key);
    setEditValue(entry.value);
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-2 bg-[#1a1a2e] rounded">
        <input
          type="text"
          value={editKey}
          onChange={(e) => setEditKey(e.target.value.replace(/\s+/g, '-'))}
          placeholder="key-name"
          className="flex-1 px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        />
        <input
          type="color"
          value={isHexColor(editValue) ? editValue : '#ffffff'}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-[#0f3460]"
        />
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="#ffffff or color name"
          className="flex-1 px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
        />
        <button
          onClick={handleSave}
          className="p-1.5 text-green-400 hover:bg-green-900/30 rounded"
          title="Save"
        >
          <NerdIcon icon="ui-check" size={14} />
        </button>
        <button
          onClick={handleCancel}
          className="p-1.5 text-red-400 hover:bg-red-900/30 rounded"
          title="Cancel"
        >
          <NerdIcon icon="ui-close" size={14} />
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 p-2 bg-[#1a1a2e] rounded group">
      <ColorSwatch value={entry.value} palette={palette} />
      <code className="text-xs text-[#e94560] font-mono">p:{entry.key}</code>
      <span className="text-gray-500">→</span>
      <code className="text-xs text-gray-300 font-mono flex-1">{entry.value}</code>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#0f3460] rounded"
          title="Edit"
        >
          <NerdIcon icon="misc-edit" size={12} />
        </button>
        <button
          onClick={() => onDelete(entry.key)}
          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded"
          title="Delete"
        >
          <NerdIcon icon="ui-close" size={12} />
        </button>
      </div>
    </div>
  );
}
