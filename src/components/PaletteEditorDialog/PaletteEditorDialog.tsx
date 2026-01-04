import { useState, useEffect, useRef } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { 
  isHexColor, 
  isNamedColor, 
  NAMED_COLORS,
  isPaletteReference,
  isContextDependentColor,
} from '../../utils/paletteResolver';

interface PaletteEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteEntry {
  key: string;
  value: string;
  isEditing: boolean;
}

/**
 * Resolves a color value to a CSS-displayable color for swatches
 */
function getSwatchColor(value: string, palette: Record<string, string>): string | null {
  if (isHexColor(value)) return value;
  if (isNamedColor(value)) return NAMED_COLORS[value.toLowerCase()];
  if (isPaletteReference(value)) {
    const key = value.slice(2);
    if (key in palette) {
      return getSwatchColor(palette[key], palette);
    }
  }
  if (isContextDependentColor(value)) return null;
  return null;
}

/**
 * Color swatch component with fallback for unresolvable colors
 */
function ColorSwatch({ value, palette }: { value: string; palette: Record<string, string> }) {
  const color = getSwatchColor(value, palette);
  
  if (!color) {
    // Show striped pattern for context-dependent or unresolved colors
    return (
      <span 
        className="w-6 h-6 rounded border border-gray-600 inline-flex items-center justify-center text-[10px]"
        style={{
          background: 'repeating-linear-gradient(45deg, #333, #333 2px, #555 2px, #555 4px)',
        }}
        title={`Dynamic: ${value}`}
      >
        ↔
      </span>
    );
  }
  
  return (
    <span 
      className="w-6 h-6 rounded border border-gray-600"
      style={{ backgroundColor: color }}
      title={value}
    />
  );
}

/**
 * Single palette entry editor row
 */
function PaletteEntryRow({
  entry,
  palette,
  onUpdate,
  onDelete,
}: {
  entry: PaletteEntry;
  palette: Record<string, string>;
  onUpdate: (key: string, value: string, newKey?: string) => void;
  onDelete: (key: string) => void;
}) {
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

/**
 * Palettes list entry editor (for named palette variants)
 */
function PalettesListEntry({
  name,
  palette,
  basePalette,
  onUpdate,
  onDelete,
  onRename,
}: {
  name: string;
  palette: Record<string, string>;
  basePalette: Record<string, string>;
  onUpdate: (name: string, palette: Record<string, string>) => void;
  onDelete: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
}) {
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

export function PaletteEditorDialog({ isOpen, onClose }: PaletteEditorDialogProps) {
  const config = useConfigStore((state) => state.config);
  const setPaletteColor = useConfigStore((state) => state.setPaletteColor);
  const removePaletteColor = useConfigStore((state) => state.removePaletteColor);
  const setPalettesTemplate = useConfigStore((state) => state.setPalettesTemplate);
  const setPalettesListEntry = useConfigStore((state) => state.setPalettesListEntry);
  const removePalettesListEntry = useConfigStore((state) => state.removePalettesListEntry);
  const previewPaletteName = useConfigStore((state) => state.previewPaletteName);
  const setPreviewPaletteName = useConfigStore((state) => state.setPreviewPaletteName);
  
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Local state for adding new entries
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('#ffffff');
  const [newPaletteName, setNewPaletteName] = useState('');
  const [showPalettesSection, setShowPalettesSection] = useState(false);
  
  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const palette = config.palette || {};
  const palettes = config.palettes;
  const paletteEntries = Object.entries(palette).map(([key, value]) => ({
    key,
    value,
    isEditing: false,
  }));
  
  const handleAddColor = () => {
    if (newKey.trim() && newValue.trim()) {
      setPaletteColor(newKey.trim(), newValue.trim());
      setNewKey('');
      setNewValue('#ffffff');
    }
  };
  
  const handleUpdateColor = (key: string, value: string, updatedKey?: string) => {
    if (updatedKey && updatedKey !== key) {
      removePaletteColor(key);
      setPaletteColor(updatedKey, value);
    } else {
      setPaletteColor(key, value);
    }
  };
  
  const handleAddPaletteVariant = () => {
    if (newPaletteName.trim()) {
      setPalettesListEntry(newPaletteName.trim(), {});
      setNewPaletteName('');
      setShowPalettesSection(true);
    }
  };
  
  const handleRenamePaletteVariant = (oldName: string, newName: string) => {
    const existingPalette = palettes?.list?.[oldName] || {};
    removePalettesListEntry(oldName);
    setPalettesListEntry(newName, existingPalette);
    if (previewPaletteName === oldName) {
      setPreviewPaletteName(newName);
    }
  };
  
  const palettesList = palettes?.list ? Object.keys(palettes.list) : [];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div 
        ref={dialogRef}
        className="bg-[#0f0f23] border border-[#0f3460] rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#0f3460]">
          <div className="flex items-center gap-2">
            <NerdIcon icon="ui-palette" size={20} className="text-[#e94560]" />
            <h2 className="text-lg font-semibold text-white">Palette Editor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#0f3460] rounded"
          >
            <NerdIcon icon="ui-close" size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Preview palette selector */}
          {palettesList.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-[#16213e] rounded-lg">
              <span className="text-xs text-gray-400">Preview with:</span>
              <select
                value={previewPaletteName || ''}
                onChange={(e) => setPreviewPaletteName(e.target.value || undefined)}
                className="flex-1 px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
              >
                <option value="">Base palette only</option>
                {palettesList.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Base Palette Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <NerdIcon icon="ui-palette" size={14} className="text-gray-400" />
                Base Palette
              </h3>
              <span className="text-xs text-gray-500">{paletteEntries.length} colors</span>
            </div>
            
            <p className="text-xs text-gray-500 mb-3">
              Define reusable colors that can be referenced as <code className="text-[#e94560]">p:key-name</code> in segment colors and templates.
            </p>
            
            {/* Existing entries */}
            <div className="space-y-2 mb-3">
              {paletteEntries.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4 bg-[#1a1a2e] rounded">
                  No palette colors defined yet. Add one below!
                </p>
              ) : (
                paletteEntries.map((entry) => (
                  <PaletteEntryRow
                    key={entry.key}
                    entry={entry}
                    palette={palette}
                    onUpdate={handleUpdateColor}
                    onDelete={removePaletteColor}
                  />
                ))
              )}
            </div>
            
            {/* Add new color */}
            <div className="flex items-center gap-2 p-3 bg-[#16213e] rounded-lg">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.replace(/\s+/g, '-'))}
                placeholder="key-name"
                className="flex-1 px-2 py-1.5 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
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
                placeholder="#ffffff or color name"
                className="flex-1 px-2 py-1.5 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
              />
              <button
                onClick={handleAddColor}
                disabled={!newKey.trim() || !newValue.trim()}
                className="px-4 py-1.5 text-xs bg-[#e94560] text-white rounded hover:bg-[#d63850] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Color
              </button>
            </div>
          </div>
          
          {/* Palettes Section (collapsible) */}
          <div>
            <button
              onClick={() => setShowPalettesSection(!showPalettesSection)}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              <NerdIcon 
                icon={showPalettesSection ? 'ui-chevron-down' : 'ui-chevron-right'} 
                size={14} 
                className="text-gray-400"
              />
              <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <NerdIcon icon="tool-layers" size={14} className="text-gray-400" />
                Palette Variants
              </h3>
              {palettesList.length > 0 && (
                <span className="text-xs text-gray-500">({palettesList.length})</span>
              )}
            </button>
            
            {showPalettesSection && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-3">
                  Create multiple palette variants that can be switched based on terminal theme using a template condition.
                  {' '}
                  <a
                    href="https://ohmyposh.dev/docs/configuration/colors#palettes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e94560] hover:underline"
                  >
                    Learn more
                  </a>
                </p>
                
                {/* Template input */}
                <div className="p-3 bg-[#16213e] rounded-lg">
                  <label className="text-xs text-gray-400 block mb-1.5">
                    Selection Template
                    <span className="ml-2 text-gray-600" title="Go template that resolves to a palette name from the list">
                      ⓘ
                    </span>
                  </label>
                  <input
                    type="text"
                    value={palettes?.template || ''}
                    onChange={(e) => setPalettesTemplate(e.target.value)}
                    placeholder='{{ if eq .Env.TERM_PROGRAM "iTerm.app" }}iterm{{ else }}default{{ end }}'
                    className="w-full px-2 py-1.5 text-xs font-mono bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
                  />
                </div>
                
                {/* Existing palette variants */}
                <div className="space-y-2">
                  {palettesList.map((name) => (
                    <PalettesListEntry
                      key={name}
                      name={name}
                      palette={palettes?.list?.[name] || {}}
                      basePalette={palette}
                      onUpdate={setPalettesListEntry}
                      onDelete={removePalettesListEntry}
                      onRename={handleRenamePaletteVariant}
                    />
                  ))}
                </div>
                
                {/* Add new palette variant */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPaletteName}
                    onChange={(e) => setNewPaletteName(e.target.value)}
                    placeholder="New palette name (e.g., dark, light, iterm)"
                    className="flex-1 px-2 py-1.5 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
                  />
                  <button
                    onClick={handleAddPaletteVariant}
                    disabled={!newPaletteName.trim()}
                    className="px-4 py-1.5 text-xs bg-[#0f3460] text-white rounded hover:bg-[#1a4a7a] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Variant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[#0f3460]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-[#0f3460] text-white rounded hover:bg-[#1a4a7a]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
