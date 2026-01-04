import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OhMyPoshConfig } from '../types/ohmyposh';

/**
 * Advanced features that can be toggled on/off in the UI
 * When disabled, the UI hides these options to reduce complexity for new users
 */
export interface AdvancedFeatures {
  // Segment-level features
  templateAlias: boolean;        // Template alias for cross-segment references
  colorTemplates: boolean;       // Conditional foreground/background templates
  responsiveDisplay: boolean;    // Min/max width for responsive segments
  folderFilters: boolean;        // Include/exclude folder patterns
  caching: boolean;              // Segment caching settings
  templatesLogic: boolean;       // Multiple templates with templates_logic
  interactive: boolean;          // OSC 8 hyperlink support
  
  // Block-level features
  diamondSymbols: boolean;       // Leading/trailing diamond symbols
  blockOverflow: boolean;        // Overflow behavior for right-aligned blocks
  blockFiller: boolean;          // Filler character between blocks
  
  // Global/config features
  tooltips: boolean;             // Tooltip segments
  extraPrompts: boolean;         // Transient, secondary, valid/error, debug prompts
  consoleTitle: boolean;         // Console title template
  shellIntegration: boolean;     // Shell integration, cursor positioning, pwd
  paletteVariants: boolean;      // Multiple palette variants with templates
}

interface AdvancedFeaturesState {
  features: AdvancedFeatures;
  autoDetectOnImport: boolean;
  
  // Actions
  toggleFeature: (feature: keyof AdvancedFeatures) => void;
  setFeature: (feature: keyof AdvancedFeatures, enabled: boolean) => void;
  setAllFeatures: (enabled: boolean) => void;
  setFeatures: (features: Partial<AdvancedFeatures>) => void;
  resetToDefaults: () => void;
  setAutoDetectOnImport: (enabled: boolean) => void;
  detectAndEnableFeatures: (config: OhMyPoshConfig) => string[];
}

// Default: only caching enabled
const defaultFeatures: AdvancedFeatures = {
  templateAlias: false,
  colorTemplates: false,
  responsiveDisplay: false,
  folderFilters: false,
  caching: true, // Default ON as requested
  templatesLogic: false,
  interactive: false,
  diamondSymbols: false,
  blockOverflow: false,
  blockFiller: false,
  tooltips: false,
  extraPrompts: false,
  consoleTitle: false,
  shellIntegration: false,
  paletteVariants: false,
};

/**
 * Feature metadata for display in settings dialog
 */
export const FEATURE_METADATA: Record<keyof AdvancedFeatures, {
  label: string;
  description: string;
  category: 'segment' | 'block' | 'global';
}> = {
  templateAlias: {
    label: 'Template Alias',
    description: 'Reference segment data in other segments using .Segments.Alias',
    category: 'segment',
  },
  colorTemplates: {
    label: 'Conditional Colors',
    description: 'Use Go templates to dynamically change segment colors',
    category: 'segment',
  },
  responsiveDisplay: {
    label: 'Responsive Display',
    description: 'Show/hide segments based on terminal width (min/max width)',
    category: 'segment',
  },
  folderFilters: {
    label: 'Folder Filters',
    description: 'Include or exclude segments in specific folders',
    category: 'segment',
  },
  caching: {
    label: 'Segment Caching',
    description: 'Cache segment output for improved performance',
    category: 'segment',
  },
  templatesLogic: {
    label: 'Multiple Templates',
    description: 'Use multiple templates with first_match logic',
    category: 'segment',
  },
  interactive: {
    label: 'Interactive Segments',
    description: 'Make segments clickable with OSC 8 hyperlinks',
    category: 'segment',
  },
  diamondSymbols: {
    label: 'Diamond Symbols',
    description: 'Use leading/trailing diamond shapes for segments',
    category: 'block',
  },
  blockOverflow: {
    label: 'Block Overflow',
    description: 'Control overflow behavior for right-aligned blocks',
    category: 'block',
  },
  blockFiller: {
    label: 'Block Filler',
    description: 'Fill space between left and right prompt blocks',
    category: 'block',
  },
  tooltips: {
    label: 'Tooltips',
    description: 'Show context info when typing specific commands',
    category: 'global',
  },
  extraPrompts: {
    label: 'Extra Prompts',
    description: 'Transient, secondary, valid/error line, and debug prompts',
    category: 'global',
  },
  consoleTitle: {
    label: 'Console Title',
    description: 'Customize the terminal window title',
    category: 'global',
  },
  shellIntegration: {
    label: 'Shell Integration',
    description: 'Shell integration, cursor positioning, and working directory',
    category: 'global',
  },
  paletteVariants: {
    label: 'Palette Variants',
    description: 'Multiple color palettes with template-based switching',
    category: 'global',
  },
};

/**
 * Detect which advanced features are used in a config
 */
function detectFeaturesInConfig(config: OhMyPoshConfig): Set<keyof AdvancedFeatures> {
  const detected = new Set<keyof AdvancedFeatures>();
  
  // Check segments in blocks
  for (const block of config.blocks || []) {
    // Block-level features
    if (block.leading_diamond || block.trailing_diamond) {
      detected.add('diamondSymbols');
    }
    if (block.overflow) {
      detected.add('blockOverflow');
    }
    if (block.filler) {
      detected.add('blockFiller');
    }
    
    for (const segment of block.segments || []) {
      if (segment.alias) {
        detected.add('templateAlias');
      }
      if (segment.foreground_templates?.length || segment.background_templates?.length) {
        detected.add('colorTemplates');
      }
      if (segment.min_width !== undefined || segment.max_width !== undefined) {
        detected.add('responsiveDisplay');
      }
      if (segment.include_folders?.length || segment.exclude_folders?.length) {
        detected.add('folderFilters');
      }
      if (segment.cache) {
        detected.add('caching');
      }
      if (segment.templates?.length && segment.templates_logic) {
        detected.add('templatesLogic');
      }
      if (segment.interactive) {
        detected.add('interactive');
      }
      if (segment.leading_diamond || segment.trailing_diamond) {
        detected.add('diamondSymbols');
      }
    }
  }
  
  // Check tooltips
  if (config.tooltips?.length) {
    detected.add('tooltips');
    
    // Also check tooltip segments for advanced features
    for (const tooltip of config.tooltips) {
      if (tooltip.foreground_templates?.length || tooltip.background_templates?.length) {
        detected.add('colorTemplates');
      }
      if (tooltip.cache) {
        detected.add('caching');
      }
      if (tooltip.leading_diamond || tooltip.trailing_diamond) {
        detected.add('diamondSymbols');
      }
    }
  }
  
  // Check extra prompts
  if (config.transient_prompt || config.secondary_prompt || 
      config.valid_line || config.error_line || config.debug_prompt) {
    detected.add('extraPrompts');
  }
  
  // Check console title
  if (config.console_title_template) {
    detected.add('consoleTitle');
  }
  
  // Check shell integration features
  if (config.shell_integration || config.enable_cursor_positioning || config.pwd) {
    detected.add('shellIntegration');
  }
  
  // Check palette variants
  if (config.palettes?.list && Object.keys(config.palettes.list).length > 0) {
    detected.add('paletteVariants');
  }
  
  return detected;
}

export const useAdvancedFeaturesStore = create<AdvancedFeaturesState>()(
  persist(
    (set, get) => ({
      features: { ...defaultFeatures },
      autoDetectOnImport: true,
      
      toggleFeature: (feature) =>
        set((state) => ({
          features: {
            ...state.features,
            [feature]: !state.features[feature],
          },
        })),
      
      setFeature: (feature, enabled) =>
        set((state) => ({
          features: {
            ...state.features,
            [feature]: enabled,
          },
        })),
      
      setAllFeatures: (enabled) =>
        set(() => ({
          features: Object.keys(defaultFeatures).reduce((acc, key) => {
            acc[key as keyof AdvancedFeatures] = enabled;
            return acc;
          }, {} as AdvancedFeatures),
        })),
      
      setFeatures: (features) =>
        set((state) => ({
          features: {
            ...state.features,
            ...features,
          },
        })),
      
      resetToDefaults: () =>
        set(() => ({
          features: { ...defaultFeatures },
        })),
      
      setAutoDetectOnImport: (enabled) =>
        set(() => ({
          autoDetectOnImport: enabled,
        })),
      
      detectAndEnableFeatures: (config) => {
        const state = get();
        if (!state.autoDetectOnImport) return [];
        
        const detected = detectFeaturesInConfig(config);
        const newlyEnabled: string[] = [];
        
        // Only enable features that are currently disabled
        const updates: Partial<AdvancedFeatures> = {};
        for (const feature of detected) {
          if (!state.features[feature]) {
            updates[feature] = true;
            newlyEnabled.push(FEATURE_METADATA[feature].label);
          }
        }
        
        if (Object.keys(updates).length > 0) {
          set((state) => ({
            features: {
              ...state.features,
              ...updates,
            },
          }));
        }
        
        return newlyEnabled;
      },
    }),
    {
      name: 'ohmyposh-advanced-features', // Separate storage key
    }
  )
);

// Helper to check if any features in a category are enabled
export const hasEnabledFeaturesInCategory = (
  features: AdvancedFeatures,
  category: 'segment' | 'block' | 'global'
): boolean => {
  return Object.entries(FEATURE_METADATA)
    .filter(([, meta]) => meta.category === category)
    .some(([key]) => features[key as keyof AdvancedFeatures]);
};

// Helper to get count of enabled features
export const getEnabledFeatureCount = (features: AdvancedFeatures): number => {
  return Object.values(features).filter(Boolean).length;
};

// Helper to check if all features are enabled
export const areAllFeaturesEnabled = (features: AdvancedFeatures): boolean => {
  return Object.values(features).every(Boolean);
};
