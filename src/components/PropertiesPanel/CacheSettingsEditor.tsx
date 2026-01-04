import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';

interface SegmentCache {
  duration?: string;
  strategy?: 'session' | 'folder';
}

interface CacheSettingsEditorProps {
  cache: SegmentCache | undefined;
  onChange: (cache: SegmentCache | undefined) => void;
  segmentType: string;
}

// Suggested cache durations by segment type
const CACHE_SUGGESTIONS: Record<string, SegmentCache> = {
  git: { duration: '2s', strategy: 'session' },
  node: { duration: '168h', strategy: 'folder' },
  python: { duration: '168h', strategy: 'folder' },
  go: { duration: '168h', strategy: 'folder' },
  rust: { duration: '168h', strategy: 'folder' },
  dotnet: { duration: '168h', strategy: 'folder' },
  java: { duration: '168h', strategy: 'folder' },
  ruby: { duration: '168h', strategy: 'folder' },
  php: { duration: '168h', strategy: 'folder' },
  kubectl: { duration: '1m', strategy: 'session' },
  aws: { duration: '1h', strategy: 'session' },
  az: { duration: '1h', strategy: 'session' },
  gcp: { duration: '1h', strategy: 'session' },
};

export function CacheSettingsEditor({
  cache,
  onChange,
  segmentType,
}: CacheSettingsEditorProps) {
  const [isExpanded, setIsExpanded] = useState(!!cache);
  const suggestion = CACHE_SUGGESTIONS[segmentType];

  const handleEnableCache = () => {
    if (suggestion) {
      onChange(suggestion);
    } else {
      onChange({ duration: '5m', strategy: 'session' });
    }
    setIsExpanded(true);
  };

  const handleDisableCache = () => {
    onChange(undefined);
    setIsExpanded(false);
  };

  return (
    <div className="space-y-3 p-3 bg-[#1a1a2e] rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <NerdIcon icon="db-redis" className="text-[#e94560]" />
          <span className="text-sm font-medium text-white">Cache Settings</span>
          {cache && (
            <span className="text-xs text-gray-500">
              {cache.duration} ({cache.strategy})
            </span>
          )}
        </div>
        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-[#0f3460]">
          {!cache ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                Cache segment output to improve prompt performance.
              </p>
              <button
                onClick={handleEnableCache}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0f3460] text-white rounded text-sm hover:bg-[#1a4a7a] transition-colors"
              >
                <NerdIcon icon="ui-plus" size={14} />
                Enable Caching
                {suggestion && (
                  <span className="text-xs text-gray-400">
                    (suggested: {suggestion.duration})
                  </span>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Duration Input */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={cache.duration || ''}
                  onChange={(e) => onChange({ ...cache, duration: e.target.value || undefined })}
                  placeholder="e.g., 1h, 30m, 2s, 168h"
                  className="w-full bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: number + unit (s=seconds, m=minutes, h=hours)
                </p>
              </div>

              {/* Strategy Dropdown */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Strategy
                </label>
                <select
                  value={cache.strategy || 'session'}
                  onChange={(e) => onChange({ 
                    ...cache, 
                    strategy: e.target.value as 'session' | 'folder' 
                  })}
                  className="w-full bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white"
                >
                  <option value="session">Session (until shell exits)</option>
                  <option value="folder">Folder (per directory, persistent)</option>
                </select>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1">
                  {['2s', '30s', '1m', '5m', '1h', '24h', '168h'].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => onChange({ ...cache, duration })}
                      className={`px-2 py-0.5 text-xs rounded ${
                        cache.duration === duration
                          ? 'bg-[#e94560] text-white'
                          : 'bg-[#0f3460] text-gray-300 hover:bg-[#0f3460]/80'
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disable Button */}
              <button
                onClick={handleDisableCache}
                className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 text-sm"
              >
                <NerdIcon icon="ui-close" size={14} />
                Disable Caching
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
