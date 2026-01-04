import { useState, useRef, useEffect } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { useSavedConfigsStore } from '../../store/savedConfigsStore';
import { exportConfig, downloadConfig, copyToClipboard } from '../../utils/configExporter';
import { ImportDialog } from '../ImportDialog';
import { SubmitConfigDialog } from '../SubmitConfigDialog';
import { SaveConfigDialog } from '../SaveConfigDialog';
import type { ExportFormat } from '../../types/ohmyposh';

const formatOptions: { value: ExportFormat; label: string; iconName: string }[] = [
  { value: 'json', label: 'JSON', iconName: 'file-json' },
  { value: 'yaml', label: 'YAML', iconName: 'file-code' },
  { value: 'toml', label: 'TOML', iconName: 'file-code' },
];

export function ExportBar() {
  const config = useConfigStore((state) => state.config);
  const exportFormat = useConfigStore((state) => state.exportFormat);
  const setExportFormat = useConfigStore((state) => state.setExportFormat);
  const { hasUnsavedChanges, lastLoadedId, configs } = useSavedConfigsStore();
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [importMethod, setImportMethod] = useState<'file' | 'paste'>('file');
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const importDropdownRef = useRef<HTMLDivElement>(null);

  // Get the name of the currently loaded config (if any)
  const currentConfigName = lastLoadedId 
    ? configs.find(c => c.id === lastLoadedId)?.name 
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (importDropdownRef.current && !importDropdownRef.current.contains(event.target as Node)) {
        setShowImportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    const content = exportConfig(config, exportFormat);
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadConfig(config, exportFormat);
  };

  const handleImportOptionClick = (method: 'file' | 'paste') => {
    setImportMethod(method);
    setShowImportDropdown(false);
    setShowImportDialog(true);
  };

  const configContent = showCode ? exportConfig(config, exportFormat) : '';

  return (
    <div className="bg-[#16213e] border-t border-[#0f3460] relative">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-[#0f3460] rounded transition-colors"
          >
            {showCode ? <NerdIcon icon="ui-eye-off" size={16} /> : <NerdIcon icon="ui-eye" size={16} />}
            <span>{showCode ? 'Hide' : 'View'} Config</span>
          </button>
          
          <div className="w-px h-6 bg-[#0f3460]" />
          
          <span className="text-sm text-gray-300">Format:</span>
          <div className="flex items-center gap-1 bg-[#1a1a2e] rounded p-0.5">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                onClick={() => setExportFormat(format.value)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  exportFormat === format.value
                    ? 'bg-[#e94560] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save button */}
          <button
            onClick={() => setShowSaveDialog(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-green-400 hover:bg-green-900/20 rounded transition-colors"
            title={lastLoadedId ? `Update "${currentConfigName}"` : "Save to My Configs"}
          >
            <NerdIcon icon="action-save" size={16} />
            <span>Save</span>
            {/* Unsaved indicator dot */}
            {hasUnsavedChanges && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#16213e]" />
            )}
          </button>

          <div className="relative" ref={importDropdownRef}>
            <button
              onClick={() => setShowImportDropdown(!showImportDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-[#0f3460] rounded transition-colors"
              title="Import configuration"
            >
              <NerdIcon icon="action-upload" size={16} />
              <span>Import</span>
              <NerdIcon icon="ui-chevron-down" size={14} className={`transition-transform ${showImportDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showImportDropdown && (
              <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#1a1a2e] border border-[#0f3460] rounded-lg shadow-xl py-1 z-50">
                <button
                  onClick={() => handleImportOptionClick('file')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors text-left"
                >
                  <NerdIcon icon="file-json" size={16} />
                  <span>Import from File</span>
                </button>
                <button
                  onClick={() => handleImportOptionClick('paste')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors text-left"
                >
                  <NerdIcon icon="file-code" size={16} />
                  <span>Paste Configuration</span>
                </button>
              </div>
            )}
          </div>

          <SubmitConfigDialog />

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-[#0f3460] rounded transition-colors"
          >
            {copied ? <NerdIcon icon="ui-check" size={16} className="text-green-400" /> : <NerdIcon icon="action-copy" size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-[#e94560] hover:bg-[#d63850] rounded transition-colors"
          >
            <NerdIcon icon="action-download" size={16} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {showCode && (
        <div className="border-t border-[#0f3460] max-h-64 overflow-auto">
          <pre className="p-4 text-xs font-mono text-gray-300 whitespace-pre-wrap">
            {configContent}
          </pre>
        </div>
      )}

      {showImportDialog && (
        <ImportDialog 
          isOpen={showImportDialog} 
          onClose={() => setShowImportDialog(false)} 
          initialMethod={importMethod}
        />
      )}

      {/* Save Config Dialog */}
      <SaveConfigDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        editingId={lastLoadedId}
      />
    </div>
  );
}
