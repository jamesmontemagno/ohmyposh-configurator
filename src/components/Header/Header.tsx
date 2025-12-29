import { Github, Book, RotateCcw, Sparkles, Upload, ChevronDown } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { SamplePicker } from '../SamplePicker';
import { importConfig } from '../../utils/configImporter';
import { useRef, useState, useEffect } from 'react';

export function Header() {
  const resetConfig = useConfigStore((state) => state.resetConfig);
  const setConfig = useConfigStore((state) => state.setConfig);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGitHubDropdown, setShowGitHubDropdown] = useState(false);
  const githubDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const config = importConfig(text, file.name);
      setConfig(config);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset file input so the same file can be imported again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to import config:', error);
      alert(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <header className="bg-[#16213e] border-b border-[#0f3460] px-4 py-3 flex items-center justify-between relative">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-purple-400" />
        <div>
          <h1 className="text-lg font-bold text-white">Oh My Posh Configurator</h1>
          <p className="text-xs text-gray-400">Visual Configuration Builder</p>
        </div>
      </div>
      
      {/* Success notification */}
      {showSuccess && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 transition-opacity duration-300">
          ✓ Configuration imported successfully
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.yaml,.yml,.toml"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#0f3460] rounded transition-colors"
          title="Import configuration from file"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Import</span>
        </button>
        
        <SamplePicker />
        
        <button
          onClick={resetConfig}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#0f3460] rounded transition-colors"
          title="Reset to default configuration"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <div className="relative" ref={githubDropdownRef}>
          <button
            onClick={() => setShowGitHubDropdown(!showGitHubDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#0f3460] rounded transition-colors"
          >
            <Github size={16} />
            <span className="hidden sm:inline">GitHub</span>
            <ChevronDown size={14} className={`transition-transform ${showGitHubDropdown ? 'rotate-180' : ''}`} />
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
                <Github size={16} />
                <span>Oh My Posh</span>
              </a>
              <a
                href="https://github.com/jamesmontemagno/ohmyposh-configurator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors"
                onClick={() => setShowGitHubDropdown(false)}
              >
                <Github size={16} />
                <span>Configurator</span>
              </a>
            </div>
          )}
        </div>

        <a
          href="https://ohmyposh.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#0f3460] rounded transition-colors"
        >
          <Book size={16} />
          <span className="hidden sm:inline">Docs</span>
        </a>
        
        <a
          href="https://github.com/JanDeDobbeleer/oh-my-posh"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#0f3460] rounded transition-colors"
        >
          <Github size={16} />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
}
