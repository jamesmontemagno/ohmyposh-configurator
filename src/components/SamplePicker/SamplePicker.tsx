import { useState, useMemo, useCallback, useRef } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { useSavedConfigsStore } from '../../store/savedConfigsStore';
import { useConfirm } from '../../hooks/useConfirm';
import { ConfirmDialog } from '../ConfirmDialog';
import type { ConfigMetadata } from '../../utils/configLoader';
import { loadAllConfigs, loadConfig } from '../../utils/configLoader';
import type { OfficialTheme } from '../../utils/officialThemeLoader';
import { loadOfficialThemeManifest, fetchOfficialTheme } from '../../utils/officialThemeLoader';
import { OfficialThemeCard } from './OfficialThemeCard';
import { SavedConfigCard } from './SavedConfigCard';
import type { SavedConfigsBundle } from '../../types/ohmyposh';

type TabType = 'my-configs' | 'samples' | 'community' | 'official';

const THEMES_PER_PAGE = 25;
const MAX_CONFIGS = 50;

export function SamplePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('my-configs');
  const [sampleConfigs, setSampleConfigs] = useState<ConfigMetadata[]>([]);
  const [communityConfigs, setCommunityConfigs] = useState<ConfigMetadata[]>([]);
  const [officialThemes, setOfficialThemes] = useState<OfficialTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTheme, setLoadingTheme] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Official themes pagination and search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const setConfig = useConfigStore((state) => state.setConfig);
  const { 
    configs: savedConfigs, 
    lastLoadedId, 
    loadConfig: loadSavedConfig,
    renameConfig,
    duplicateConfig,
    deleteConfig,
    exportAllConfigs,
    importConfigsBundle,
    loadFromStorage,
    clearLastLoadedId,
  } = useSavedConfigsStore();
  
  const { confirm, ConfirmDialogProps } = useConfirm();

  const loadConfigs = async () => {
    setLoading(true);
    const configs = await loadAllConfigs();
    setSampleConfigs(configs.samples);
    setCommunityConfigs(configs.community);
    setLoading(false);
  };

  const loadOfficialThemes = useCallback(async () => {
    if (officialThemes.length === 0) {
      setLoading(true);
      const manifest = await loadOfficialThemeManifest();
      setOfficialThemes(manifest.themes);
      setLoading(false);
    }
  }, [officialThemes.length]);

  // Handle tab change - load official themes when tab becomes active
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'official' && officialThemes.length === 0) {
      loadOfficialThemes();
    }
  };

  // Handle search change - reset page to 1
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleLoadConfig = async (category: TabType, filename: string) => {
    if (category === 'official' || category === 'my-configs') return; // Handled separately
    const config = await loadConfig(category as 'samples' | 'community', filename);
    if (config) {
      setConfig(config);
      clearLastLoadedId(); // No longer working on a saved config
      setIsOpen(false);
    }
  };

  const handleLoadOfficialTheme = async (theme: OfficialTheme) => {
    setLoadingTheme(theme.file);
    const config = await fetchOfficialTheme(theme.file);
    if (config) {
      setConfig(config);
      clearLastLoadedId(); // No longer working on a saved config
      setIsOpen(false);
    }
    setLoadingTheme(null);
  };

  // My Configs handlers
  const handleLoadSavedConfig = (id: string) => {
    loadSavedConfig(id);
    setIsOpen(false);
  };

  const handleRenameConfig = async (id: string, newName: string) => {
    await renameConfig(id, newName);
  };

  const handleDuplicateConfig = async (id: string) => {
    await duplicateConfig(id);
  };

  const handleDeleteConfig = async (id: string) => {
    const config = savedConfigs.find(c => c.id === id);
    const confirmed = await confirm({
      title: 'Delete Config',
      message: `Are you sure you want to delete "${config?.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteConfig(id);
    }
  };

  const handleExportAll = () => {
    const bundle = exportAllConfigs();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-configs-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportError(null);
    
    try {
      const text = await file.text();
      const bundle = JSON.parse(text) as SavedConfigsBundle;
      
      // Validate bundle structure
      if (!bundle.version || !Array.isArray(bundle.configs)) {
        setImportError('Invalid backup file format');
        return;
      }
      
      // Import with rename strategy (can be changed to 'skip' if preferred)
      const result = await importConfigsBundle(bundle, 'rename');
      
      if (result.imported === 0 && result.skipped > 0) {
        setImportError(`All ${result.skipped} configs were skipped (duplicates or limit reached)`);
      }
    } catch {
      setImportError('Failed to parse backup file');
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sort saved configs by updatedAt (most recent first)
  const sortedSavedConfigs = useMemo(() => {
    return [...savedConfigs].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [savedConfigs]);

  // Filter official themes by search query (name and tags)
  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) {
      return officialThemes;
    }
    const query = searchQuery.toLowerCase().trim();
    return officialThemes.filter(
      (theme) =>
        theme.name.toLowerCase().includes(query) ||
        theme.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [officialThemes, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredThemes.length / THEMES_PER_PAGE);
  const paginatedThemes = useMemo(() => {
    const start = (currentPage - 1) * THEMES_PER_PAGE;
    return filteredThemes.slice(start, start + THEMES_PER_PAGE);
  }, [filteredThemes, currentPage]);

  const activeConfigs = activeTab === 'samples' ? sampleConfigs : communityConfigs;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          loadConfigs();
          loadFromStorage();
        }}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        title="Load Sample Configuration"
      >
        <NerdIcon icon="misc-star" size={16} />
        <span className="text-sm font-medium">Theme Library</span>
      </button>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportFile}
        className="hidden"
      />

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b2e] border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <NerdIcon icon="misc-star" size={24} className="text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Theme Library</h2>
                  <p className="text-sm text-gray-400">
                    Your saved configs, samples, and official themes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <NerdIcon icon="ui-close" size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 bg-[#0f0f23] px-6">
              <button
                onClick={() => handleTabChange('my-configs')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'my-configs'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <NerdIcon icon="action-save" size={16} />
                <span className="font-medium">My Configs</span>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  {savedConfigs.length}/{MAX_CONFIGS}
                </span>
              </button>
              <button
                onClick={() => handleTabChange('samples')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'samples'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <NerdIcon icon="misc-lightbulb" size={16} />
                <span className="font-medium">Samples</span>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  {sampleConfigs.length}
                </span>
              </button>
              <button
                onClick={() => handleTabChange('community')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'community'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <NerdIcon icon="ui-users" size={16} />
                <span className="font-medium">Community</span>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  {communityConfigs.length}
                </span>
              </button>
              <button
                onClick={() => handleTabChange('official')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'official'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <NerdIcon icon="dev-terminal" size={16} />
                <span className="font-medium">Official Themes</span>
              </button>
            </div>

            {/* My Configs header with export/import */}
            {activeTab === 'my-configs' && savedConfigs.length > 0 && (
              <div className="px-6 py-3 bg-[#0f0f23] border-b border-gray-700 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {savedConfigs.length} saved config{savedConfigs.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleImportClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    <NerdIcon icon="action-import" size={14} />
                    Import
                  </button>
                  <button
                    onClick={handleExportAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    <NerdIcon icon="action-export" size={14} />
                    Export All
                  </button>
                </div>
              </div>
            )}

            {/* Import error message */}
            {importError && activeTab === 'my-configs' && (
              <div className="mx-6 mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-sm text-red-300">{importError}</p>
              </div>
            )}

            {/* Search bar for official themes */}
            {activeTab === 'official' && (
              <div className="px-6 py-4 bg-[#0f0f23] border-b border-gray-700">
                <div className="relative">
                  <NerdIcon 
                    icon="action-search" 
                    size={16} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    placeholder="Search themes by name or tag..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <NerdIcon icon="ui-close" size={14} />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-2 text-sm text-gray-400">
                    Found {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading && activeTab !== 'my-configs' ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                  <p className="text-gray-400 text-sm">
                    {activeTab === 'official' ? 'Loading official themes...' : 'Loading configurations...'}
                  </p>
                </div>
              ) : activeTab === 'my-configs' ? (
                // My Configs grid
                savedConfigs.length === 0 ? (
                  <div className="text-center py-12">
                    <NerdIcon icon="action-save" size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No saved configs yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Click the &quot;Save&quot; button in the header to save your current config
                    </p>
                    <button
                      onClick={handleImportClick}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <NerdIcon icon="action-import" size={16} />
                      Import from Backup
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedSavedConfigs.map((config) => (
                      <SavedConfigCard
                        key={config.id}
                        config={config}
                        isCurrentlyLoaded={config.id === lastLoadedId}
                        onLoad={() => handleLoadSavedConfig(config.id)}
                        onRename={(newName) => handleRenameConfig(config.id, newName)}
                        onDuplicate={() => handleDuplicateConfig(config.id)}
                        onDelete={() => handleDeleteConfig(config.id)}
                      />
                    ))}
                  </div>
                )
              ) : activeTab === 'official' ? (
                // Official themes grid
                filteredThemes.length === 0 ? (
                  <div className="text-center py-12">
                    <NerdIcon icon="action-search" size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {searchQuery
                        ? `No themes found matching "${searchQuery}"`
                        : 'No official themes available'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedThemes.map((theme) => (
                      <OfficialThemeCard
                        key={theme.name}
                        theme={theme}
                        onSelect={handleLoadOfficialTheme}
                        isLoading={loadingTheme === theme.file}
                      />
                    ))}
                  </div>
                )
              ) : activeConfigs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">
                    {activeTab === 'community'
                      ? 'No community themes yet. Be the first to contribute!'
                      : 'No configurations available'}
                  </p>
                  {activeTab === 'community' && (
                    <a
                      href="https://github.com/jamesmontemagno/ohmyposh-configurator/blob/main/CONTRIBUTING.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <NerdIcon icon="ui-users" size={16} />
                      Learn How to Contribute
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeConfigs.map((config) => (
                    <button
                      key={config.id}
                      onClick={() => handleLoadConfig(activeTab, config.file)}
                      className="group relative flex flex-col items-start p-5 bg-[#0f0f23] hover:bg-[#16172e] border border-gray-700 hover:border-purple-500 rounded-lg transition-all text-left"
                    >
                      {/* Icon Badge */}
                      <div className="absolute -top-3 -right-3 transform group-hover:scale-110 transition-transform bg-purple-600 rounded-full p-2">
                        <NerdIcon icon={config.icon} size={20} className="text-white" />
                      </div>

                      {/* Content */}
                      <div className="w-full">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          {config.name}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-3">
                          {config.description}
                        </p>

                        {/* Tags and Author */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {config.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-gray-500">by {config.author}</p>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/50 rounded-lg pointer-events-none"></div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination for official themes */}
            {activeTab === 'official' && filteredThemes.length > THEMES_PER_PAGE && (
              <div className="px-6 py-4 border-t border-gray-700 bg-[#0f0f23] flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <NerdIcon icon="ui-chevron-left" size={16} />
                  Previous
                </button>
                <span className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  Next
                  <NerdIcon icon="ui-chevron-right" size={16} />
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-[#0f0f23]">
              <p className="text-xs text-gray-500 text-center">
                {activeTab === 'my-configs' 
                  ? 'Your saved configs are stored locally in your browser'
                  : `Loading a ${activeTab === 'official' ? 'theme' : 'sample'} will replace your current configuration`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Dialog */}
      <ConfirmDialog {...ConfirmDialogProps} />
    </>
  );
}
