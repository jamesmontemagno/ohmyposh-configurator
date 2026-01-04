import { useEffect, useRef, useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { ColorInput } from '../PropertiesPanel/ColorInput';
import { TemplateInput } from '../PropertiesPanel/TemplateInput';
import { useConfigStore } from '../../store/configStore';
import type { ExtraPrompt, ExtraPromptType } from '../../types/ohmyposh';

interface ExtraPromptsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROMPT_CONFIGS: Array<{
  type: ExtraPromptType;
  label: string;
  description: string;
  icon: string;
  shells: string[];
  supportsFiller: boolean;
}> = [
  {
    type: 'transient_prompt',
    label: 'Transient Prompt',
    description: 'Replaces previous prompts after command execution for cleaner history',
    icon: 'status-history',
    shells: ['Zsh', 'PowerShell', 'Fish', 'Nu', 'Cmd'],
    supportsFiller: true,
  },
  {
    type: 'secondary_prompt',
    label: 'Secondary Prompt',
    description: 'Shown when entering multi-line commands',
    icon: 'misc-terminal',
    shells: ['Zsh', 'PowerShell', 'Cmd'],
    supportsFiller: false,
  },
  {
    type: 'valid_line',
    label: 'Valid Line',
    description: 'Shown when the command syntax is valid',
    icon: 'status-check-circle',
    shells: ['PowerShell'],
    supportsFiller: false,
  },
  {
    type: 'error_line',
    label: 'Error Line',
    description: 'Shown when the command syntax is invalid',
    icon: 'status-x-circle',
    shells: ['PowerShell'],
    supportsFiller: false,
  },
  {
    type: 'debug_prompt',
    label: 'Debug Prompt',
    description: 'Shown when in debugger mode',
    icon: 'tool-debug',
    shells: ['PowerShell'],
    supportsFiller: false,
  },
];

export function ExtraPromptsDialog({ isOpen, onClose }: ExtraPromptsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const config = useConfigStore((state) => state.config);
  const setExtraPrompt = useConfigStore((state) => state.setExtraPrompt);
  const updateExtraPrompt = useConfigStore((state) => state.updateExtraPrompt);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<ExtraPromptType>>(new Set());

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const toggleExpanded = (type: ExtraPromptType) => {
    const newExpanded = new Set(expandedPrompts);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedPrompts(newExpanded);
  };

  const getPrompt = (type: ExtraPromptType): ExtraPrompt | undefined => {
    return config[type];
  };

  const handleUpdatePrompt = (type: ExtraPromptType, updates: Partial<ExtraPrompt>) => {
    updateExtraPrompt(type, updates);
  };

  const enablePrompt = (type: ExtraPromptType) => {
    setExtraPrompt(type, { template: '> ' });
    setExpandedPrompts((prev) => new Set(prev).add(type));
  };

  const disablePrompt = (type: ExtraPromptType) => {
    setExtraPrompt(type, undefined);
    setExpandedPrompts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(type);
      return newSet;
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div 
        ref={dialogRef}
        className="bg-[#0f0f23] border border-[#0f3460] rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#0f3460]">
          <div className="flex items-center gap-2">
            <NerdIcon icon="misc-terminal" className="text-[#e94560] text-xl" />
            <div>
              <h2 className="text-lg font-semibold text-white">Extra Prompts</h2>
              <p className="text-xs text-gray-500">
                Configure secondary, transient, and special prompts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <NerdIcon icon="ui-close" className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {PROMPT_CONFIGS.map((promptConfig) => {
            const prompt = getPrompt(promptConfig.type);
            const isEnabled = !!prompt;
            const isExpanded = expandedPrompts.has(promptConfig.type);

            return (
              <div
                key={promptConfig.type}
                className="bg-[#1a1a2e] rounded-lg border border-[#0f3460]"
              >
                {/* Prompt Header */}
                <div className="flex items-center justify-between p-3">
                  <button
                    onClick={() => isEnabled && toggleExpanded(promptConfig.type)}
                    className="flex items-center gap-3 flex-1 text-left"
                    disabled={!isEnabled}
                  >
                    <NerdIcon 
                      icon={promptConfig.icon} 
                      className={`text-lg ${isEnabled ? 'text-[#e94560]' : 'text-gray-600'}`} 
                    />
                    <div>
                      <h3 className={`font-medium ${isEnabled ? 'text-white' : 'text-gray-500'}`}>
                        {promptConfig.label}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {promptConfig.description}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Shells: {promptConfig.shells.join(', ')}
                      </p>
                    </div>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {isEnabled && (
                      <span className="text-gray-400 text-sm">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            enablePrompt(promptConfig.type);
                          } else {
                            disablePrompt(promptConfig.type);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#0f3460] peer-checked:bg-[#e94560] rounded-full peer transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </label>
                  </div>
                </div>

                {/* Prompt Editor (expanded) */}
                {isEnabled && isExpanded && prompt && (
                  <div className="p-3 pt-0 space-y-3 border-t border-[#0f3460]">
                    {/* Template */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Template
                      </label>
                      <TemplateInput
                        value={prompt.template ?? ''}
                        onChange={(value) => handleUpdatePrompt(promptConfig.type, { template: value || undefined })}
                        placeholder="{{ .Shell }}> "
                        rows={2}
                      />
                    </div>

                    {/* Colors Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <ColorInput
                          label="Foreground"
                          value={prompt.foreground ?? ''}
                          onChange={(value) => handleUpdatePrompt(promptConfig.type, { foreground: value || undefined })}
                          allowEmpty
                        />
                      </div>
                      <div>
                        <ColorInput
                          label="Background"
                          value={prompt.background ?? ''}
                          onChange={(value) => handleUpdatePrompt(promptConfig.type, { background: value || undefined })}
                          allowEmpty
                        />
                      </div>
                    </div>

                    {/* Filler (transient only) */}
                    {promptConfig.supportsFiller && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Filler Character
                        </label>
                        <input
                          type="text"
                          value={prompt.filler ?? ''}
                          onChange={(e) => handleUpdatePrompt(promptConfig.type, { filler: e.target.value || undefined })}
                          placeholder="e.g., ─ or ·"
                          className="w-full bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#e94560]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Fill space between left and right content
                        </p>
                      </div>
                    )}

                    {/* Newline */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prompt.newline ?? false}
                        onChange={(e) => handleUpdatePrompt(promptConfig.type, { 
                          newline: e.target.checked || undefined 
                        })}
                        className="rounded border-[#0f3460] bg-[#0f0f23] text-[#e94560] focus:ring-[#e94560]"
                      />
                      <span className="text-sm text-white">Add newline before prompt</span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-4 border-t border-[#0f3460]">
          <a
            href="https://ohmyposh.dev/docs/configuration/transient"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-[#e94560] flex items-center gap-1"
          >
            <NerdIcon icon="ui-external-link" size={12} />
            Documentation
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#e94560] text-white rounded hover:bg-[#e94560]/80 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
