import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { unicodeToEscapes, parseUnicodeEscapes, hasUnicodeCharacters } from '../../utils/unicode';
import type { Segment } from '../../types/ohmyposh';

interface SegmentOptionsEditorProps {
  segment: Segment;
  availableOptions: Array<{ name: string; type: string; default?: unknown; values?: string[]; description: string }>;
  onUpdate: (options: Record<string, unknown>) => void;
}

export function SegmentOptionsEditor({ segment, availableOptions, onUpdate }: SegmentOptionsEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddOption, setShowAddOption] = useState(false);
  const [selectedNewOption, setSelectedNewOption] = useState('');

  const currentOptions = segment.options || {};
  
  // Get options that haven't been added yet
  const availableToAdd = availableOptions.filter(opt => !(opt.name in currentOptions));

  const handleOptionChange = (optionName: string, value: unknown) => {
    const updated = { ...currentOptions, [optionName]: value };
    onUpdate(updated);
  };

  const handleAddOption = () => {
    if (!selectedNewOption) return;
    
    const optionMeta = availableOptions.find(o => o.name === selectedNewOption);
    if (!optionMeta) return;

    const defaultValue = optionMeta.default !== undefined ? optionMeta.default :
      optionMeta.type === 'boolean' ? false :
      optionMeta.type === 'number' ? 0 :
      optionMeta.type === 'array' ? [] :
      optionMeta.type === 'object' ? {} :
      '';

    handleOptionChange(selectedNewOption, defaultValue);
    setSelectedNewOption('');
    setShowAddOption(false);
  };

  const handleRemoveOption = (optionName: string) => {
    const updated = { ...currentOptions };
    delete updated[optionName];
    onUpdate(updated);
  };

  const renderOptionInput = (optionName: string, optionMeta: typeof availableOptions[0]) => {
    const value = currentOptions[optionName];

    if (optionMeta.type === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={typeof value === 'boolean' ? value : false}
          onChange={(e) => handleOptionChange(optionName, e.target.checked)}
          className="rounded bg-[#0f0f23] border-[#0f3460]"
        />
      );
    }

    if (optionMeta.type === 'number') {
      return (
        <input
          type="number"
          value={typeof value === 'number' ? value : 0}
          onChange={(e) => handleOptionChange(optionName, parseFloat(e.target.value) || 0)}
          className="flex-1 px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#06d6a0]"
        />
      );
    }

    if (optionMeta.type === 'enum' && optionMeta.values) {
      return (
        <select
          value={typeof value === 'string' ? value : ((optionMeta.default as string) || '')}
          onChange={(e) => handleOptionChange(optionName, e.target.value)}
          className="flex-1 px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#06d6a0]"
        >
          {optionMeta.values.map((val) => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      );
    }

    if (optionMeta.type === 'array') {
      return (
        <input
          type="text"
          value={Array.isArray(value) ? value.join(', ') : ''}
          onChange={(e) => handleOptionChange(optionName, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="Comma-separated values"
          className="flex-1 px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#06d6a0] font-mono"
        />
      );
    }

    if (optionMeta.type === 'object') {
      return (
        <input
          type="text"
          value={typeof value === 'object' && value !== null ? JSON.stringify(value) : '{}'}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleOptionChange(optionName, parsed);
            } catch {
              // Invalid JSON, ignore
            }
          }}
          placeholder="{}"
          className="flex-1 px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#06d6a0] font-mono"
        />
      );
    }

    // Default to string
    const stringValue = typeof value === 'string' ? value : '';
    const displayValue = unicodeToEscapes(stringValue);
    const hasUnicode = hasUnicodeCharacters(stringValue);
    
    return (
      <div className="flex-1 space-y-1">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            const processedValue = parseUnicodeEscapes(e.target.value);
            handleOptionChange(optionName, processedValue);
          }}
          placeholder="Enter value"
          className="w-full px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#06d6a0] font-mono"
        />
        {hasUnicode && stringValue && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Preview:</span>
            <span className="nerd-font-symbol text-base text-white bg-[#0f3460] px-2 py-0.5 rounded">{stringValue}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-2 border border-[#06d6a0]/30 rounded bg-[#0f0f23]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between text-xs text-gray-300 hover:text-white hover:bg-[#1a1a2e] transition-colors rounded"
      >
        <div className="flex items-center gap-1.5">
          <NerdIcon icon="tool-sliders" size={12} className="text-[#06d6a0]" />
          <span className="font-medium text-[#06d6a0]">Segment Options ({Object.keys(currentOptions).length})</span>
        </div>
        {isExpanded ? <NerdIcon icon="ui-chevron-down" size={14} /> : <NerdIcon icon="ui-chevron-right" size={14} />}
      </button>
      
      {isExpanded && (
        <div className="px-2 pb-2 space-y-2">
          {Object.keys(currentOptions).map((optionName) => {
            const optionMeta = availableOptions.find(o => o.name === optionName);
            if (!optionMeta) return null;

            return (
              <div key={optionName} className="p-2 bg-[#1a1a2e] rounded border border-[#0f3460] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <code className="text-xs font-mono text-[#06d6a0] font-semibold whitespace-nowrap">
                      {optionName}
                    </code>
                    <span className="text-xs px-1.5 py-0.5 bg-[#0f3460] text-gray-400 rounded">
                      {optionMeta.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveOption(optionName)}
                    className="text-xs text-red-400 hover:text-red-300 px-1.5 py-0.5 hover:bg-red-400/10 rounded transition-colors"
                    title="Remove option"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-gray-500">{optionMeta.description}</p>
                <div className="flex items-center gap-2">
                  {renderOptionInput(optionName, optionMeta)}
                </div>
              </div>
            );
          })}

          {showAddOption ? (
            <div className="p-2 bg-[#1a1a2e] rounded border border-[#06d6a0]/30 space-y-2">
              <label className="text-xs text-gray-400">Add Option</label>
              <select
                value={selectedNewOption}
                onChange={(e) => setSelectedNewOption(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-[#0f0f23] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#06d6a0]"
              >
                <option value="">Select an option...</option>
                {availableToAdd.map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name} ({opt.type})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAddOption}
                  disabled={!selectedNewOption}
                  className="flex-1 px-2 py-1 text-xs bg-[#06d6a0] text-black rounded hover:bg-[#06d6a0]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddOption(false);
                    setSelectedNewOption('');
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-[#0f3460] text-gray-200 rounded hover:bg-[#1a4a7a] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            availableToAdd.length > 0 && (
              <button
                onClick={() => setShowAddOption(true)}
                className="w-full px-2 py-1 text-xs bg-[#0f3460] text-gray-200 rounded hover:bg-[#1a4a7a] transition-colors flex items-center justify-center gap-1"
              >
                <span>+</span>
                <span>Add Option</span>
              </button>
            )
          )}

          {Object.keys(currentOptions).length === 0 && !showAddOption && (
            <p className="text-xs text-gray-500 text-center py-2">
              No options configured. Click "+ Add Option" to add one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
