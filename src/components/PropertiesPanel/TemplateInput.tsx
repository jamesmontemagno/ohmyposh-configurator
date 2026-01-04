import { useState, useRef, useEffect, useCallback } from 'react';
import { useConfigStore } from '../../store/configStore';
import { getActivePalette, resolvePaletteColor } from '../../utils/paletteResolver';
import { unicodeToEscapes, parseUnicodeEscapes } from '../../utils/unicode';

interface TemplateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

interface AutocompleteOption {
  key: string;
  displayValue: string;
  color: string | null;
}

export function TemplateInput({ value, onChange, placeholder, rows = 3 }: TemplateInputProps) {
  const config = useConfigStore((state) => state.config);
  const previewPaletteName = useConfigStore((state) => state.previewPaletteName);
  const palette = getActivePalette(config, previewPaletteName);
  const paletteKeys = Object.keys(config.palette || {});
  
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [autocompleteFilter, setAutocompleteFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [triggerStart, setTriggerStart] = useState<number | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  
  // Get filtered autocomplete options
  const autocompleteOptions: AutocompleteOption[] = paletteKeys
    .filter((key) => key.toLowerCase().includes(autocompleteFilter.toLowerCase()))
    .map((key) => {
      const resolved = resolvePaletteColor(`p:${key}`, palette);
      return {
        key,
        displayValue: palette[key],
        color: resolved.color,
      };
    });
  
  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        autocompleteRef.current && 
        !autocompleteRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Calculate autocomplete position based on cursor
  const updateAutocompletePosition = useCallback(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const { selectionStart } = textarea;
    
    // Create a hidden div to measure text position
    const mirror = document.createElement('div');
    const computed = getComputedStyle(textarea);
    
    // Copy textarea styles
    mirror.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      width: ${textarea.clientWidth}px;
      font-family: ${computed.fontFamily};
      font-size: ${computed.fontSize};
      line-height: ${computed.lineHeight};
      padding: ${computed.padding};
    `;
    
    // Get text before cursor
    const textBeforeCursor = textarea.value.substring(0, selectionStart);
    mirror.textContent = textBeforeCursor;
    
    // Add a marker span
    const marker = document.createElement('span');
    marker.textContent = '|';
    mirror.appendChild(marker);
    
    document.body.appendChild(mirror);
    
    // Clean up mirror (getBoundingClientRect not needed for simple position)
    document.body.removeChild(mirror);
    
    // Calculate position relative to textarea
    const lines = textBeforeCursor.split('\n');
    const lineHeight = parseInt(computed.lineHeight) || 20;
    const top = (lines.length * lineHeight) + 4;
    
    setAutocompletePosition({
      top: Math.min(top, textarea.clientHeight),
      left: 8,
    });
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showAutocomplete || autocompleteOptions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, autocompleteOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (autocompleteOptions[selectedIndex]) {
        e.preventDefault();
        insertPaletteKey(autocompleteOptions[selectedIndex].key);
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };
  
  const insertPaletteKey = (key: string) => {
    if (!textareaRef.current || triggerStart === null) return;
    
    const textarea = textareaRef.current;
    const currentValue = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // Replace from trigger start to current position
    const before = currentValue.substring(0, triggerStart);
    const after = currentValue.substring(cursorPos);
    const newValue = `${before}<p:${key}>${after}`;
    
    onChange(parseUnicodeEscapes(newValue));
    setShowAutocomplete(false);
    setTriggerStart(null);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      const newCursorPos = triggerStart + `<p:${key}>`.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(parseUnicodeEscapes(newValue));
    
    // Check if we should show autocomplete
    // Look for `<p:` pattern before cursor
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const paletteMatch = textBeforeCursor.match(/<p:([\w-]*)$/);
    
    if (paletteMatch && paletteKeys.length > 0) {
      setShowAutocomplete(true);
      setAutocompleteFilter(paletteMatch[1]);
      setSelectedIndex(0); // Reset selection when filter changes
      setTriggerStart(cursorPos - paletteMatch[0].length);
      updateAutocompletePosition();
    } else {
      setShowAutocomplete(false);
      setTriggerStart(null);
    }
  };
  
  const handleOptionClick = (key: string) => {
    insertPaletteKey(key);
  };
  
  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={unicodeToEscapes(value)}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        rows={rows}
        className="w-full px-2 py-1.5 text-xs font-mono bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560] resize-y"
        placeholder={placeholder || '{{ .Data }}'}
      />
      
      {/* Autocomplete dropdown */}
      {showAutocomplete && autocompleteOptions.length > 0 && (
        <div
          ref={autocompleteRef}
          className="absolute bg-[#1a1a2e] border border-[#0f3460] rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto min-w-[200px]"
          style={{
            top: autocompletePosition.top,
            left: autocompletePosition.left,
          }}
        >
          <div className="p-1">
            <div className="text-[10px] text-gray-500 px-2 py-1">Palette Colors</div>
            {autocompleteOptions.map((option, index) => (
              <button
                key={option.key}
                onClick={() => handleOptionClick(option.key)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${
                  index === selectedIndex ? 'bg-[#0f3460]' : 'hover:bg-[#0f3460]/50'
                }`}
              >
                <span 
                  className="w-3 h-3 rounded border border-gray-600 flex-shrink-0"
                  style={option.color 
                    ? { backgroundColor: option.color }
                    : { background: 'repeating-linear-gradient(45deg, #333, #333 2px, #555 2px, #555 4px)' }
                  }
                />
                <code className="text-xs text-purple-300 font-mono">p:{option.key}</code>
                <span className="text-[10px] text-gray-500 ml-auto truncate max-w-[80px]">
                  {option.displayValue}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Help text for palette autocomplete */}
      {paletteKeys.length > 0 && (
        <p className="text-[10px] text-gray-600 mt-1">
          Type <code className="text-purple-400">&lt;p:</code> for palette color autocomplete
        </p>
      )}
    </div>
  );
}
