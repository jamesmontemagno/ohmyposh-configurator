import { useEffect, useRef, useMemo } from 'react';
import { NerdIcon } from '../NerdIcon';
import {
  useAdvancedFeaturesStore,
  FEATURE_METADATA,
  areAllFeaturesEnabled,
  getEnabledFeatureCount,
  type AdvancedFeatures,
} from '../../store/advancedFeaturesStore';

interface AdvancedSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureToggleProps {
  featureKey: keyof AdvancedFeatures;
  enabled: boolean;
  onToggle: () => void;
}

function FeatureToggle({ featureKey, enabled, onToggle }: FeatureToggleProps) {
  const metadata = FEATURE_METADATA[featureKey];
  
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-[#0f0f23] rounded">
      <div className="flex-1 min-w-0 pr-3">
        <p className={`text-sm font-medium ${enabled ? 'text-white' : 'text-gray-400'}`}>
          {metadata.label}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {metadata.description}
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-[#0f3460] peer-checked:bg-[#e94560] rounded-full peer transition-colors"></div>
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
      </label>
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  icon: string;
  category: 'segment' | 'block' | 'global';
  features: AdvancedFeatures;
  onToggleFeature: (feature: keyof AdvancedFeatures) => void;
  onToggleCategory: (enabled: boolean) => void;
}

function CategorySection({ 
  title, 
  icon, 
  category, 
  features, 
  onToggleFeature,
  onToggleCategory,
}: CategorySectionProps) {
  const categoryFeatures = useMemo(() => 
    Object.entries(FEATURE_METADATA)
      .filter(([, meta]) => meta.category === category)
      .map(([key]) => key as keyof AdvancedFeatures),
    [category]
  );
  
  const enabledCount = categoryFeatures.filter(key => features[key]).length;
  const allEnabled = enabledCount === categoryFeatures.length;
  const someEnabled = enabledCount > 0 && !allEnabled;
  
  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-[#0f3460]">
      {/* Category Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#0f3460]">
        <div className="flex items-center gap-2">
          <NerdIcon icon={icon} className="text-[#e94560]" size={18} />
          <h3 className="font-medium text-white">{title}</h3>
          <span className="text-xs text-gray-500">
            ({enabledCount}/{categoryFeatures.length})
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={allEnabled}
            ref={(el) => {
              if (el) el.indeterminate = someEnabled;
            }}
            onChange={() => onToggleCategory(!allEnabled)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#0f3460] peer-checked:bg-[#e94560] rounded-full peer transition-colors"></div>
          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
        </label>
      </div>
      
      {/* Feature Toggles */}
      <div className="p-2 space-y-1">
        {categoryFeatures.map((featureKey) => (
          <FeatureToggle
            key={featureKey}
            featureKey={featureKey}
            enabled={features[featureKey]}
            onToggle={() => onToggleFeature(featureKey)}
          />
        ))}
      </div>
    </div>
  );
}

export function AdvancedSettingsDialog({ isOpen, onClose }: AdvancedSettingsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Advanced features store
  const features = useAdvancedFeaturesStore((state) => state.features);
  const autoDetectOnImport = useAdvancedFeaturesStore((state) => state.autoDetectOnImport);
  const toggleFeature = useAdvancedFeaturesStore((state) => state.toggleFeature);
  const setAllFeatures = useAdvancedFeaturesStore((state) => state.setAllFeatures);
  const setFeatures = useAdvancedFeaturesStore((state) => state.setFeatures);
  const resetToDefaults = useAdvancedFeaturesStore((state) => state.resetToDefaults);
  const setAutoDetectOnImport = useAdvancedFeaturesStore((state) => state.setAutoDetectOnImport);

  const allEnabled = areAllFeaturesEnabled(features);
  const enabledCount = getEnabledFeatureCount(features);
  const totalCount = Object.keys(features).length;

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

  const handleToggleCategory = (category: 'segment' | 'block' | 'global', enabled: boolean) => {
    const categoryFeatures = Object.entries(FEATURE_METADATA)
      .filter(([, meta]) => meta.category === category)
      .map(([key]) => key as keyof AdvancedFeatures);
    
    const updates: Partial<AdvancedFeatures> = {};
    for (const key of categoryFeatures) {
      updates[key] = enabled;
    }
    setFeatures(updates);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div 
        ref={dialogRef}
        className="bg-[#0f0f23] border border-[#0f3460] rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#0f3460]">
          <div className="flex items-center gap-2">
            <NerdIcon icon="tool-settings" className="text-[#e94560] text-xl" />
            <div>
              <h2 className="text-lg font-semibold text-white">Advanced Features</h2>
              <p className="text-xs text-gray-500">
                Toggle advanced options to customize your editing experience
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

        {/* Master Toggle */}
        <div className="p-4 border-b border-[#0f3460] bg-[#1a1a2e]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e94560]/20 rounded-lg">
                <NerdIcon icon="status-check-circle" className="text-[#e94560]" size={20} />
              </div>
              <div>
                <p className="font-medium text-white">Show All Features</p>
                <p className="text-xs text-gray-500">
                  {enabledCount} of {totalCount} features enabled
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allEnabled}
                onChange={() => setAllFeatures(!allEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#0f3460] peer-checked:bg-[#e94560] rounded-full peer transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Segment Features */}
          <CategorySection
            title="Segment Features"
            icon="misc-puzzle"
            category="segment"
            features={features}
            onToggleFeature={toggleFeature}
            onToggleCategory={(enabled) => handleToggleCategory('segment', enabled)}
          />

          {/* Block Features */}
          <CategorySection
            title="Block Features"
            icon="file-package"
            category="block"
            features={features}
            onToggleFeature={toggleFeature}
            onToggleCategory={(enabled) => handleToggleCategory('block', enabled)}
          />

          {/* Global Features */}
          <CategorySection
            title="Global Features"
            icon="ui-globe"
            category="global"
            features={features}
            onToggleFeature={toggleFeature}
            onToggleCategory={(enabled) => handleToggleCategory('global', enabled)}
          />

          {/* Auto-detect setting */}
          <div className="bg-[#1a1a2e] rounded-lg border border-[#0f3460] p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <NerdIcon icon="status-info" className="text-blue-400" size={16} />
                <div>
                  <p className="text-sm font-medium text-white">Auto-detect on Import</p>
                  <p className="text-xs text-gray-500">
                    Automatically enable features when importing configs that use them
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDetectOnImport}
                  onChange={(e) => setAutoDetectOnImport(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#0f3460] peer-checked:bg-[#e94560] rounded-full peer transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-4 border-t border-[#0f3460]">
          <button
            onClick={resetToDefaults}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-[#0f3460] rounded transition-colors"
          >
            Reset Feature Toggles
          </button>
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
