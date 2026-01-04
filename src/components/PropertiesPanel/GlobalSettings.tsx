import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { ColorInput } from './ColorInput';
import type { OhMyPoshConfig } from '../../types/ohmyposh';

export function GlobalSettings() {
  const config = useConfigStore((state) => state.config);
  const updateGlobalConfig = useConfigStore((state) => state.updateGlobalConfig);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleUpdate = (updates: Partial<OhMyPoshConfig>) => {
    updateGlobalConfig(updates);
  };

  return (
    <div className="space-y-4 p-4 bg-[#1a1a2e] rounded-lg mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <NerdIcon icon="ui-globe" size={20} className="text-gray-400" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-200">Global Settings</h3>
            <p className="text-xs text-gray-500">Configuration-wide options</p>
          </div>
        </div>
        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-[#0f3460]">
          {/* Console Title Template */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <NerdIcon icon="ui-code" size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Console Title Template</span>
            </div>
            <textarea
              value={config.console_title_template || ''}
              onChange={(e) => handleUpdate({ console_title_template: e.target.value || undefined })}
              rows={2}
              className="w-full px-2 py-1.5 text-xs font-mono bg-[#1a1a2e] border border-[#0f3460] rounded text-gray-200 focus:outline-none focus:border-[#e94560] resize-y"
              placeholder="{{.Folder}}{{if .Root}} :: root{{end}} :: {{.Shell}}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Template for the terminal window title.{' '}
              <a
                href="https://ohmyposh.dev/docs/configuration/title"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e94560] hover:underline"
              >
                Learn more
              </a>
            </p>
          </div>

          {/* Terminal Background */}
          <div>
            <ColorInput
              label="Terminal BG"
              value={config.terminal_background || ''}
              onChange={(value) => handleUpdate({ terminal_background: value || undefined })}
              allowEmpty
            />
            <p className="text-xs text-gray-500 mt-1 ml-[104px]">
              Used for transparency in some segments
            </p>
          </div>

          {/* Accent Color */}
          <div>
            <ColorInput
              label="Accent Color"
              value={config.accent_color || ''}
              onChange={(value) => handleUpdate({ accent_color: value || undefined })}
              allowEmpty
            />
            <p className="text-xs text-gray-500 mt-1 ml-[104px]">
              Default accent color for segments
            </p>
          </div>

          {/* Final Space */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="final_space"
              checked={config.final_space ?? true}
              onChange={(e) => handleUpdate({ final_space: e.target.checked })}
              className="rounded bg-[#0f0f23] border-[#0f3460]"
            />
            <label htmlFor="final_space" className="text-xs text-gray-300">
              Add final space after prompt
            </label>
          </div>

          {/* Shell Integration */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="shell_integration"
              checked={config.shell_integration || false}
              onChange={(e) => handleUpdate({ shell_integration: e.target.checked })}
              className="rounded bg-[#0f0f23] border-[#0f3460]"
            />
            <label htmlFor="shell_integration" className="text-xs text-gray-300">
              Enable shell integration
            </label>
          </div>

          {/* Enable Cursor Positioning */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enable_cursor_positioning"
              checked={config.enable_cursor_positioning || false}
              onChange={(e) => handleUpdate({ enable_cursor_positioning: e.target.checked })}
              className="rounded bg-[#0f0f23] border-[#0f3460]"
            />
            <label htmlFor="enable_cursor_positioning" className="text-xs text-gray-300">
              Enable cursor positioning
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
