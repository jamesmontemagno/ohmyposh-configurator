import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { BlockPreview } from './BlockPreview';
import { TooltipPreview } from './TooltipPreview';

export function PreviewPanel() {
  const config = useConfigStore((state) => state.config);
  const previewBackground = useConfigStore((state) => state.previewBackground);
  const setPreviewBackground = useConfigStore((state) => state.setPreviewBackground);
  const selectTooltip = useConfigStore((state) => state.selectTooltip);
  const [tooltipsExpanded, setTooltipsExpanded] = useState(true);

  // Use terminal_background from config if set, otherwise use preview background preference
  const bgColor = config.terminal_background || (previewBackground === 'dark' ? '#1e1e1e' : '#ffffff');
  const textColor = previewBackground === 'dark' ? '#cccccc' : '#333333';
  const finalSpace = config.final_space ?? true;

  const tooltips = config.tooltips ?? [];

  return (
    <div className="bg-[#16213e] border-t border-[#0f3460] max-h-[40vh] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#0f3460] flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-200">Preview</h2>
          {config.terminal_background && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span>•</span>
              <span>Using terminal_background</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Background Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Background:</span>
            <button
              onClick={() => setPreviewBackground('dark')}
              className={`p-1.5 rounded transition-colors ${
                previewBackground === 'dark'
                  ? 'bg-[#0f3460] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Dark background"
              disabled={!!config.terminal_background}
            >
              <NerdIcon icon="misc-moon" size={14} />
            </button>
            <button
              onClick={() => setPreviewBackground('light')}
              className={`p-1.5 rounded transition-colors ${
                previewBackground === 'light'
                  ? 'bg-[#0f3460] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Light background"
              disabled={!!config.terminal_background}
            >
              <NerdIcon icon="weather-sunny" size={14} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="p-4 text-sm overflow-y-auto flex-1 min-h-0"
        style={{ 
          backgroundColor: bgColor, 
          color: textColor,
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', monospace",
        }}
      >
        <div className="space-y-2">
          {config.blocks.map((block, index) => (
            <div key={block.id}>
              <BlockPreview block={block} />
              {block.newline && index < config.blocks.length - 1 && <br />}
            </div>
          ))}
          <div className="mt-2">
            <span style={{ color: textColor }}>❯ </span>
            {finalSpace && <span> </span>}
            <span className="animate-pulse">▋</span>
          </div>
        </div>

        {/* Tooltips Section */}
        {tooltips.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dashed" style={{ borderColor: 'rgba(128,128,128,0.3)' }}>
            <button
              onClick={() => setTooltipsExpanded(!tooltipsExpanded)}
              className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
            >
              <NerdIcon icon="status-info" size={14} className="text-[#06d6a0]" />
              <span className="text-xs font-medium" style={{ color: textColor }}>
                Tooltips ({tooltips.length})
              </span>
              <span className="text-xs opacity-60">
                {tooltipsExpanded ? '▼' : '▶'}
              </span>
            </button>
            
            {tooltipsExpanded && (
              <div className="space-y-2">
                {tooltips.map((tooltip) => (
                  <div 
                    key={tooltip.id}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                    onClick={() => selectTooltip(tooltip.id)}
                  >
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#1a472a] text-green-300">
                      {tooltip.tips[0] || '?'}
                    </span>
                    <span className="text-xs opacity-60">→</span>
                    <TooltipPreview tooltip={tooltip} />
                  </div>
                ))}
                <p className="text-xs opacity-50 mt-2" style={{ color: textColor }}>
                  Click a tooltip to edit. Tooltips appear when you type the trigger command.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
