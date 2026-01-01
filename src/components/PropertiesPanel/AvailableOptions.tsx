import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useClipboard } from '../../hooks/useClipboard';

interface AvailableOptionsProps {
  options: Array<{ name: string; type: string; default?: unknown; values?: string[]; description: string }>;
}

export function AvailableOptions({ options }: AvailableOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { copiedText, copyToClipboard } = useClipboard();

  return (
    <div className="mt-2 border border-[#0f3460] rounded bg-[#0f0f23]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between text-xs text-gray-300 hover:text-white hover:bg-[#1a1a2e] transition-colors rounded"
      >
        <div className="flex items-center gap-1.5">
          <NerdIcon icon="tool-settings" size={12} className="text-gray-400" />
          <span className="font-medium">Available Options ({options.length})</span>
        </div>
        {isExpanded ? <NerdIcon icon="ui-chevron-down" size={14} /> : <NerdIcon icon="ui-chevron-right" size={14} />}
      </button>
      
      {isExpanded && (
        <div className="px-2 pb-2 max-h-64 overflow-y-auto">
          <div className="space-y-1.5">
            {options.map((opt, index) => (
              <div
                key={index}
                className="p-2 bg-[#1a1a2e] rounded border border-[#0f3460] hover:border-[#06d6a0]/30 transition-colors group"
              >
                <div className="flex items-start gap-2 flex-wrap">
                  <code
                    onClick={() => copyToClipboard(opt.name)}
                    className="text-xs font-mono text-[#06d6a0] font-semibold whitespace-nowrap cursor-pointer hover:bg-[#06d6a0]/10 px-1 py-0.5 rounded transition-colors"
                    title="Click to copy"
                  >
                    {copiedText === opt.name ? '✓ Copied!' : opt.name}
                  </code>
                  <span className="text-xs px-1.5 py-0.5 bg-[#0f3460] text-gray-400 rounded">
                    {opt.type}
                  </span>
                  {opt.default !== undefined && (
                    <span className="text-xs px-1.5 py-0.5 bg-[#1a1a2e] border border-[#0f3460] text-gray-400 rounded">
                      default: <span className="text-[#06d6a0]">{typeof opt.default === 'object' ? JSON.stringify(opt.default) : String(opt.default)}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{opt.description}</p>
                {opt.values && opt.values.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {opt.values.map((val, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 bg-[#0f3460]/50 text-gray-400 rounded font-mono">
                        {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
