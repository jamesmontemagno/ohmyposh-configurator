import { useEffect, useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { LegacyPreview } from './LegacyPreview';
import { StudioPreview } from './StudioPreview';

interface PreviewPanelProps {
  active?: boolean;
}

export function PreviewPanel({ active = true }: PreviewPanelProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const config = useConfigStore((state) => state.config);
  const previewBackground = useConfigStore((state) => state.previewBackground);
  const setPreviewBackground = useConfigStore((state) => state.setPreviewBackground);
  const previewRenderer = useConfigStore((state) => state.previewRenderer) ?? 'studio';
  const setPreviewRenderer = useConfigStore((state) => state.setPreviewRenderer);

  // Use terminal_background from config if set, otherwise use preview background preference
  const bgColor = config.terminal_background || (previewBackground === 'dark' ? '#1e1e1e' : '#ffffff');
  const textColor = previewBackground === 'dark' ? '#cccccc' : '#333333';

  useEffect(() => {
    if (!isMaximized) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMaximized(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized]);

  return (
    <div
      className={
        isMaximized
          ? 'fixed inset-0 z-50 flex min-h-0 flex-col bg-[#16213e]'
          : 'flex h-full min-h-0 flex-col border-t border-[#0f3460] bg-[#16213e] xl:h-auto xl:min-h-[25vh] xl:max-h-[40vh]'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-[#0f3460] flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-200">Preview</h2>
          <div
            className="flex rounded-md border border-[#0f3460] bg-[#0f0f23] p-0.5"
            role="group"
            aria-label="Preview renderer"
          >
            <button
              type="button"
              onClick={() => setPreviewRenderer('studio')}
              aria-pressed={previewRenderer === 'studio'}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94560] ${
                previewRenderer === 'studio'
                  ? 'bg-[#e94560] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Studio <span className="ml-0.5 opacity-80">Beta</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewRenderer('legacy')}
              aria-pressed={previewRenderer === 'legacy'}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94560] ${
                previewRenderer === 'legacy'
                  ? 'bg-[#0f3460] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Legacy
            </button>
          </div>
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
          <button
            type="button"
            onClick={() => setIsMaximized((current) => !current)}
            aria-label={isMaximized ? 'Exit maximized preview' : 'Maximize preview'}
            aria-pressed={isMaximized}
            title={isMaximized ? 'Exit maximized preview (Esc)' : 'Maximize preview'}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-[#0f3460] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94560]"
          >
            <NerdIcon icon={isMaximized ? 'ui-close' : 'ui-external-link'} size={14} />
          </button>
        </div>
      </div>

      <div className={previewRenderer === 'studio' ? 'contents' : 'hidden'}>
        <StudioPreview
          backgroundColor={bgColor}
          active={active && previewRenderer === 'studio'}
        />
      </div>
      <div className={previewRenderer === 'legacy' ? 'contents' : 'hidden'}>
        <LegacyPreview backgroundColor={bgColor} textColor={textColor} />
      </div>
    </div>
  );
}
