import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useClipboard } from '../../hooks/useClipboard';

interface AvailableMethodsProps {
  methods: Array<{ name: string; returnType: string; description: string }>;
}

export function AvailableMethods({ methods }: AvailableMethodsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { copiedText, copyToClipboard } = useClipboard();

  return (
    <div className="mt-2 border border-[#0f3460] rounded bg-[#0f0f23]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between text-xs text-gray-300 hover:text-white hover:bg-[#1a1a2e] transition-colors rounded"
      >
        <div className="flex items-center gap-1.5">
          <NerdIcon icon="status-info" size={12} className="text-gray-400" />
          <span className="font-medium">Available Methods ({methods.length})</span>
        </div>
        {isExpanded ? <NerdIcon icon="ui-chevron-down" size={14} /> : <NerdIcon icon="ui-chevron-right" size={14} />}
      </button>
      
      {isExpanded && (
        <div className="px-2 pb-2 max-h-64 overflow-y-auto">
          <div className="space-y-1.5">
            {methods.map((method, index) => (
              <div
                key={index}
                className="p-2 bg-[#1a1a2e] rounded border border-[#0f3460] hover:border-[#e94560]/30 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <code
                    onClick={() => copyToClipboard(method.name)}
                    className="text-xs font-mono text-[#e94560] font-semibold whitespace-nowrap cursor-pointer hover:bg-[#e94560]/10 px-1 py-0.5 rounded transition-colors"
                    title="Click to copy"
                  >
                    {copiedText === method.name ? '✓ Copied!' : method.name}
                  </code>
                  <span className="text-xs px-1.5 py-0.5 bg-[#0f3460] text-gray-400 rounded">
                    {method.returnType}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
