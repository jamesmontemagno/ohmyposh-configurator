import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { PaletteEntryRow } from './PaletteEntryRow';
import { isHexColor } from '../../utils/paletteResolver';

interface PalettesListEntryProps {
  name: string;
  palette: Record<string, string>;
  basePalette: Record<string, string>;
  onUpdate: (name: string, palette: Record<string, string>) => void;
  onDelete: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
}

/**
 * Palettes list entry editor (for named palette variants)
 */
export function PalettesListEntry({
  name,
  palette,
  basePalette,
  onUpdate,
  onDelete,
  onRename,
}: PalettesListEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('#ffffff');
  
  const handleAddColor = () => {
    if (newKey.trim() && newValue.trim()) {
      onUpdate(name, { ...palette, [newKey.trim()]: newValue.trim() });
      setNewKey('');
      setNewValue('#ffffff');
    }
  };
  
  const handleUpdateColor = (key: string, value: string, updatedKey?: string) => {
    if (updatedKey && updatedKey !== key) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _omitted, ...rest } = palette;
      onUpdate(name, { ...rest, [updatedKey]: value });
    } else {
      onUpdate(name, { ...palette, [key]: value });
    }
  };
  
  const handleDeleteColor = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _omitted, ...rest } = palette;
    onUpdate(name, rest);
  };
  
  const handleRename = () => {
    if (newName.trim() && newName !== name) {
      onRename(name, newName.trim());
    }
    setIsRenaming(false);
  };
  
  const entries = Object.entries(palette).map(([key, value]) => ({
    key,
    value,
    isEditing: false,
  }));
  
  // Merge with base palette to show full preview
  const mergedPalette = { ...basePalette, ...palette };
  
  return (
    <div className="border border-[#0f3460] rounded-lg overflow-hidden">
      <div 
        className="flex items-center gap-2 p-3 bg-[#16213e] cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <NerdIcon 
          icon={isExpanded ? 'ui-chevron-down' : 'ui-chevron-right'} 
          size={14} 
          className="text-gray-400"
        />
        {isRenaming ? (
          <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
              autoFocus
            />
            <button onClick={handleRename} className="p-1 text-green-400 hover:bg-green-900/30 rounded">
              <NerdIcon icon="ui-check" size={12} />
            </button>
            <button onClick={() => { setIsRenaming(false); setNewName(name); }} className="p-1 text-red-400 hover:bg-red-900/30 rounded">
              <NerdIcon icon="ui-close" size={12} />
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm font-medium text-gray-200 flex-1">{name}</span>
            <span className="text-xs text-gray-500">{Object.keys(palette).length} colors</span>
            <button
              onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
              className="p-1 text-gray-400 hover:text-white hover:bg-[#0f3460] rounded"
              title="Rename"
            >
              <NerdIcon icon="misc-edit" size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(name); }}
              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded"
              title="Delete palette variant"
            >
              <NerdIcon icon="ui-close" size={12} />
            </button>
          </>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-3 space-y-2 bg-[#0f0f23]">
          {entries.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">No color overrides defined</p>
          ) : (
            entries.map((entry) => (
              <PaletteEntryRow
                key={entry.key}
                entry={entry}
                palette={mergedPalette}
                onUpdate={handleUpdateColor}
                onDelete={handleDeleteColor}
              />
            ))
          )}
          
          {/* Add new color */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#0f3460]">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.replace(/\s+/g, '-'))}
              placeholder="key-name"
              className="flex-1 px-2 py-1 text-xs bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
            />
            <input
              type="color"
              value={isHexColor(newValue) ? newValue : '#ffffff'}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-[#0f3460]"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="#ffffff"
              className="flex-1 px-2 py-1 text-xs bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
            />
            <button
              onClick={handleAddColor}
              disabled={!newKey.trim() || !newValue.trim()}
              className="px-3 py-1 text-xs bg-[#e94560] text-white rounded hover:bg-[#d63850] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
