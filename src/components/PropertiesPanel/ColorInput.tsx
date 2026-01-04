import { useState, useRef, useEffect } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { 
  isPaletteReference, 
  isNamedColor, 
  isContextDependentColor,
  isHexColor,
  NAMED_COLORS,
  CONTEXT_DEPENDENT_COLORS,
  getActivePalette,
  resolvePaletteColor,
  getContextDependentColorDescription,
} from '../../utils/paletteResolver';

type ColorMode = 'hex' | 'named' | 'palette';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}

// Common named colors to show in dropdown
const COMMON_NAMED_COLORS = [
  'white', 'black', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
  'orange', 'purple', 'pink', 'gray', 'transparent',
];

function getColorMode(value: string): ColorMode {
  if (!value) return 'hex';
  if (isPaletteReference(value)) return 'palette';
  if (isNamedColor(value) || isContextDependentColor(value)) return 'named';
  return 'hex';
}

function getSwatchColor(value: string, palette: Record<string, string>): string | null {
  if (!value) return null;
  if (isHexColor(value)) return value;
  if (isNamedColor(value)) return NAMED_COLORS[value.toLowerCase()];
  if (isPaletteReference(value)) {
    const resolved = resolvePaletteColor(value, palette);
    return resolved.color;
  }
  return null;
}

export function ColorInput({ label, value, onChange, allowEmpty = false }: ColorInputProps) {
  const config = useConfigStore((state) => state.config);
  const previewPaletteName = useConfigStore((state) => state.previewPaletteName);
  const palette = getActivePalette(config, previewPaletteName);
  const paletteKeys = Object.keys(config.palette || {});
  
  const [mode, setMode] = useState<ColorMode>(getColorMode(value));
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Update mode when value changes externally
  useEffect(() => {
    setMode(getColorMode(value));
  }, [value]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const swatchColor = getSwatchColor(value, palette);
  const resolved = resolvePaletteColor(value, palette);
  
  const handleModeChange = (newMode: ColorMode) => {
    setMode(newMode);
    setShowDropdown(false);
    // Reset to a default value for the new mode
    if (newMode === 'hex') {
      onChange(swatchColor || '#ffffff');
    } else if (newMode === 'named') {
      onChange('white');
    } else if (newMode === 'palette' && paletteKeys.length > 0) {
      onChange(`p:${paletteKeys[0]}`);
    }
  };
  
  const handlePaletteSelect = (key: string) => {
    onChange(`p:${key}`);
    setShowDropdown(false);
  };
  
  const handleNamedColorSelect = (color: string) => {
    onChange(color);
    setShowDropdown(false);
  };
  
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-24">{label}</label>
      <div className="flex-1 flex items-center gap-2 relative" ref={dropdownRef}>
        {/* Color swatch / preview */}
        <div className="relative">
          {mode === 'hex' ? (
            <input
              type="color"
              value={swatchColor || '#ffffff'}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-[#0f3460]"
              style={{ backgroundColor: 'transparent' }}
            />
          ) : (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 rounded border border-[#0f3460] flex items-center justify-center"
              style={{ 
                backgroundColor: swatchColor || 'transparent',
                background: !swatchColor 
                  ? 'repeating-linear-gradient(45deg, #333, #333 2px, #555 2px, #555 4px)' 
                  : undefined,
              }}
              title={resolved.isContextDependent ? getContextDependentColorDescription(value as typeof CONTEXT_DEPENDENT_COLORS[number]) : undefined}
            >
              {resolved.isUnresolved && (
                <span className="text-yellow-500 text-xs">⚠</span>
              )}
              {resolved.isContextDependent && (
                <span className="text-white text-[10px]">↔</span>
              )}
            </button>
          )}
        </div>
        
        {/* Mode selector & value input */}
        <div className="flex-1 flex items-center gap-1">
          {/* Mode badge */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`px-1.5 py-1 text-[10px] rounded border transition-colors ${
              mode === 'hex' 
                ? 'bg-blue-900/30 border-blue-700 text-blue-300' 
                : mode === 'palette' 
                ? 'bg-purple-900/30 border-purple-700 text-purple-300'
                : 'bg-green-900/30 border-green-700 text-green-300'
            }`}
            title="Click to change color mode"
          >
            {mode === 'hex' ? 'HEX' : mode === 'palette' ? 'PAL' : 'NAM'}
          </button>
          
          {/* Value display/input */}
          {mode === 'hex' ? (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={allowEmpty ? 'None (transparent)' : '#ffffff'}
              className="flex-1 px-2 py-1 text-xs bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560]"
            />
          ) : mode === 'palette' ? (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex-1 px-2 py-1 text-xs bg-[#1a1a2e] border border-[#0f3460] rounded text-left text-gray-200 hover:border-[#e94560] flex items-center justify-between"
            >
              <span className="font-mono text-purple-300">
                {isPaletteReference(value) ? value : 'Select palette color...'}
              </span>
              <NerdIcon icon="ui-chevron-down" size={12} className="text-gray-500" />
            </button>
          ) : (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex-1 px-2 py-1 text-xs bg-[#1a1a2e] border border-[#0f3460] rounded text-left text-gray-200 hover:border-[#e94560] flex items-center justify-between"
            >
              <span className={isContextDependentColor(value) ? 'text-amber-300 italic' : 'text-green-300'}>
                {value || 'Select named color...'}
              </span>
              <NerdIcon icon="ui-chevron-down" size={12} className="text-gray-500" />
            </button>
          )}
        </div>
        
        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-[#0f3460] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
            {/* Mode selector */}
            <div className="p-2 border-b border-[#0f3460]">
              <div className="text-[10px] text-gray-500 mb-1.5">Color Mode</div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleModeChange('hex')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    mode === 'hex' 
                      ? 'bg-blue-900/50 text-blue-300' 
                      : 'bg-[#0f0f23] text-gray-400 hover:text-white'
                  }`}
                >
                  Hex
                </button>
                <button
                  onClick={() => handleModeChange('named')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    mode === 'named' 
                      ? 'bg-green-900/50 text-green-300' 
                      : 'bg-[#0f0f23] text-gray-400 hover:text-white'
                  }`}
                >
                  Named
                </button>
                <button
                  onClick={() => handleModeChange('palette')}
                  disabled={paletteKeys.length === 0}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    mode === 'palette' 
                      ? 'bg-purple-900/50 text-purple-300' 
                      : 'bg-[#0f0f23] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                  title={paletteKeys.length === 0 ? 'No palette colors defined' : undefined}
                >
                  Palette
                </button>
              </div>
            </div>
            
            {/* Options based on mode */}
            {mode === 'palette' && (
              <div className="p-2">
                {paletteKeys.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No palette colors defined.
                    <br />
                    Add colors in the Palette Editor.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {paletteKeys.map((key) => {
                      const color = resolvePaletteColor(`p:${key}`, palette);
                      return (
                        <button
                          key={key}
                          onClick={() => handlePaletteSelect(key)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-[#0f3460] ${
                            value === `p:${key}` ? 'bg-[#0f3460]' : ''
                          }`}
                        >
                          <span 
                            className="w-4 h-4 rounded border border-gray-600"
                            style={{ backgroundColor: color.color || 'transparent' }}
                          />
                          <code className="text-xs text-purple-300 font-mono">p:{key}</code>
                          <span className="text-[10px] text-gray-500 ml-auto">
                            {palette[key]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {mode === 'named' && (
              <div className="p-2">
                {/* Context-dependent colors */}
                <div className="mb-2">
                  <div className="text-[10px] text-gray-500 mb-1">Dynamic (inherit at runtime)</div>
                  <div className="space-y-1">
                    {CONTEXT_DEPENDENT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleNamedColorSelect(color)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-[#0f3460] ${
                          value === color ? 'bg-[#0f3460]' : ''
                        }`}
                      >
                        <span 
                          className="w-4 h-4 rounded border border-gray-600 flex items-center justify-center text-[8px]"
                          style={{ 
                            background: 'repeating-linear-gradient(45deg, #333, #333 2px, #555 2px, #555 4px)' 
                          }}
                        >
                          ↔
                        </span>
                        <span className="text-xs text-amber-300 italic">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Common named colors */}
                <div>
                  <div className="text-[10px] text-gray-500 mb-1">Named Colors</div>
                  <div className="grid grid-cols-2 gap-1">
                    {COMMON_NAMED_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleNamedColorSelect(color)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-[#0f3460] ${
                          value === color ? 'bg-[#0f3460]' : ''
                        }`}
                      >
                        <span 
                          className="w-4 h-4 rounded border border-gray-600"
                          style={{ backgroundColor: NAMED_COLORS[color] || 'transparent' }}
                        />
                        <span className="text-xs text-green-300">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

