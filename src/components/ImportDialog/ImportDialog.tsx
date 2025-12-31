import { useState, useRef } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { importConfig } from '../../utils/configImporter';

type ImportMethod = 'file' | 'paste';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const [activeMethod, setActiveMethod] = useState<ImportMethod>('file');
  const [pastedConfig, setPastedConfig] = useState('');
  const [format, setFormat] = useState<'json' | 'yaml' | 'toml'>('json');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setConfig = useConfigStore((state) => state.setConfig);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      const text = await file.text();
      const importedConfig = importConfig(text, file.name);
      setConfig(importedConfig);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import configuration');
    }
  };

  const handlePasteImport = () => {
    if (!pastedConfig.trim()) {
      setError('Please paste a configuration');
      return;
    }

    try {
      setError('');
      const filename = `config.${format}`;
      const importedConfig = importConfig(pastedConfig, filename);
      setConfig(importedConfig);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPastedConfig('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import configuration');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1b2e] border border-gray-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <NerdIcon icon="action-upload" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Import Configuration</h2>
              <p className="text-sm text-gray-400">
                Load a configuration from a file or paste it directly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <NerdIcon icon="ui-close" size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-[#0f0f23] px-6">
          <button
            onClick={() => {
              setActiveMethod('file');
              setError('');
            }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeMethod === 'file'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <NerdIcon icon="fileJson" size={16} />
            <span className="font-medium">Import from File</span>
          </button>
          <button
            onClick={() => {
              setActiveMethod('paste');
              setError('');
            }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeMethod === 'paste'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <NerdIcon icon="fileCode" size={16} />
            <span className="font-medium">Paste Configuration</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeMethod === 'file' ? (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  Select a JSON, YAML, or TOML configuration file to import
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml,.toml"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleFileClick}
                className="w-full flex flex-col items-center justify-center gap-3 p-12 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg transition-colors group"
              >
                <div className="p-4 bg-gray-800 group-hover:bg-purple-600/20 rounded-full transition-colors">
                  <NerdIcon icon="action-upload" size={32} className="text-gray-400 group-hover:text-purple-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">Click to select a file</p>
                  <p className="text-sm text-gray-400">Supports .json, .yaml, .yml, and .toml files</p>
                </div>
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-300 flex items-center gap-2">
                    <NerdIcon icon="ui-check" size={16} />
                    Configuration imported successfully!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  Paste your Oh My Posh configuration below and select the format
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Configuration Format
                </label>
                <div className="flex items-center gap-2 bg-[#0f0f23] rounded p-0.5">
                  <button
                    onClick={() => setFormat('json')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      format === 'json'
                        ? 'bg-[#e94560] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setFormat('yaml')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      format === 'yaml'
                        ? 'bg-[#e94560] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    YAML
                  </button>
                  <button
                    onClick={() => setFormat('toml')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      format === 'toml'
                        ? 'bg-[#e94560] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    TOML
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Configuration Content
                </label>
                <textarea
                  value={pastedConfig}
                  onChange={(e) => {
                    setPastedConfig(e.target.value);
                    setError('');
                  }}
                  placeholder={`Paste your ${format.toUpperCase()} configuration here...`}
                  rows={12}
                  className="w-full px-3 py-2 bg-[#0f0f23] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-300 flex items-center gap-2">
                    <NerdIcon icon="ui-check" size={16} />
                    Configuration imported successfully!
                  </p>
                </div>
              )}

              <button
                onClick={handlePasteImport}
                disabled={!pastedConfig.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                <NerdIcon icon="action-upload" size={16} />
                Import Configuration
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-[#0f0f23]">
          <p className="text-xs text-gray-500 text-center">
            Importing will replace your current configuration
          </p>
        </div>
      </div>
    </div>
  );
}
