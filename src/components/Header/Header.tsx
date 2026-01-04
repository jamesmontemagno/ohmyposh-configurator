import { NerdIcon } from '../NerdIcon';
import { SamplePicker } from '../SamplePicker';
import { AdvancedSettingsDialog } from '../AdvancedSettingsDialog';
import { useConfigStore } from '../../store/configStore';
import { useRef, useState, useEffect } from 'react';

export function Header() {
  const [showGitHubDropdown, setShowGitHubDropdown] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const githubDropdownRef = useRef<HTMLDivElement>(null);
  const resetConfig = useConfigStore((state) => state.resetConfig);
  
  const handleResetConfig = () => {
    if (window.confirm('Are you sure you want to reset to the default configuration? This will clear all your current blocks, segments, and settings.')) {
      resetConfig();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (githubDropdownRef.current && !githubDropdownRef.current.contains(event.target as Node)) {
        setShowGitHubDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#16213e] border-b border-[#0f3460] px-4 py-3 flex items-center justify-between relative">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-600 rounded-lg">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Oh My Posh Configurator</h1>
          <p className="text-xs text-gray-400">Visual Configuration Builder</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleResetConfig}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
          title="Reset to default configuration"
        >
          <NerdIcon icon="action-refresh" size={16} />
          <span className="hidden sm:inline">Reset</span>
        </button>
        
        <SamplePicker />
        
        <button
          onClick={() => setShowAdvancedSettings(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#0f3460] rounded transition-colors relative"
          title="Settings & Tools"
        >
          <NerdIcon icon="tool-settings" size={16} />
          <span className="hidden sm:inline">Settings</span>
        </button>

        <div className="relative" ref={githubDropdownRef}>
          <button
            onClick={() => setShowGitHubDropdown(!showGitHubDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#0f3460] rounded transition-colors"
          >
            <NerdIcon icon="vcs-github" size={16} />
            <span className="hidden sm:inline">GitHub</span>
            <NerdIcon icon="ui-chevron-down" size={14} className={`transition-transform ${showGitHubDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showGitHubDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#1a1a2e] border border-[#0f3460] rounded-lg shadow-xl py-1 z-50">
              <a
                href="https://github.com/JanDeDobbeleer/oh-my-posh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors"
                onClick={() => setShowGitHubDropdown(false)}
              >
                <NerdIcon icon="vcs-github" size={16} />
                <span>Oh My Posh</span>
              </a>
              <a
                href="https://github.com/jamesmontemagno/ohmyposh-configurator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors"
                onClick={() => setShowGitHubDropdown(false)}
              >
                <NerdIcon icon="vcs-github" size={16} />
                <span>Configurator</span>
              </a>
              <a
                href="https://github.com/jamesmontemagno/ohmyposh-configurator/blob/main/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors"
                onClick={() => setShowGitHubDropdown(false)}
              >
                <NerdIcon icon="status-history" size={16} />
                <span>Changelog</span>
              </a>
            </div>
          )}
        </div>

        <a
          href="https://ohmyposh.dev/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#0f3460] rounded transition-colors"
        >
          <NerdIcon icon="misc-book" size={16} />
          <span className="hidden sm:inline">Docs</span>
        </a>
      </div>
      
      {/* Advanced Settings Dialog */}
      <AdvancedSettingsDialog
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
      />
    </header>
  );
}
