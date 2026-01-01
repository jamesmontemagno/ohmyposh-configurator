import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import type { ConfigMetadata } from '../../utils/configLoader';
import { loadAllConfigs, loadConfig } from '../../utils/configLoader';

type TabType = 'samples' | 'community';

export function SamplePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('samples');
  const [sampleConfigs, setSampleConfigs] = useState<ConfigMetadata[]>([]);
  const [communityConfigs, setCommunityConfigs] = useState<ConfigMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const setConfig = useConfigStore((state) => state.setConfig);

  const loadConfigs = async () => {
    setLoading(true);
    const configs = await loadAllConfigs();
    setSampleConfigs(configs.samples);
    setCommunityConfigs(configs.community);
    setLoading(false);
  };

  const handleLoadConfig = async (category: TabType, filename: string) => {
    const config = await loadConfig(category, filename);
    if (config) {
      setConfig(config);
      setIsOpen(false);
    }
  };

  const activeConfigs = activeTab === 'samples' ? sampleConfigs : communityConfigs;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          loadConfigs();
        }}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        title="Load Sample Configuration"
      >
        <NerdIcon icon="misc-star" size={16} />
        <span className="text-sm font-medium">Sample Configs</span>
      </button>

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
                    Choose from official samples or community-contributed themes
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
                onClick={() => setActiveTab('samples')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'samples'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <NerdIcon icon="misc-lightbulb" size={16} />
                <span className="font-medium">Official Samples</span>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  {sampleConfigs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('community')}
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
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
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

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-[#0f0f23]">
              <p className="text-xs text-gray-500 text-center">
                Loading a sample will replace your current configuration
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
