import { describe, it, expect, beforeEach } from 'vitest';
import {
  useAdvancedFeaturesStore,
  FEATURE_METADATA,
  hasEnabledFeaturesInCategory,
  getEnabledFeatureCount,
  areAllFeaturesEnabled,
  type AdvancedFeatures,
} from '../advancedFeaturesStore';
import type { OhMyPoshConfig } from '../../types/ohmyposh';

describe('advancedFeaturesStore', () => {
  beforeEach(() => {
    // Reset to defaults before each test
    useAdvancedFeaturesStore.getState().resetToDefaults();
  });

  describe('toggleFeature', () => {
    it('should toggle a feature on', () => {
      expect(useAdvancedFeaturesStore.getState().features.templateAlias).toBe(false);
      
      useAdvancedFeaturesStore.getState().toggleFeature('templateAlias');
      
      expect(useAdvancedFeaturesStore.getState().features.templateAlias).toBe(true);
    });

    it('should toggle a feature off', () => {
      useAdvancedFeaturesStore.getState().setFeature('templateAlias', true);
      
      useAdvancedFeaturesStore.getState().toggleFeature('templateAlias');
      
      expect(useAdvancedFeaturesStore.getState().features.templateAlias).toBe(false);
    });

    it('should only affect the specified feature', () => {
      const initialFeatures = { ...useAdvancedFeaturesStore.getState().features };
      
      useAdvancedFeaturesStore.getState().toggleFeature('templateAlias');
      
      const newFeatures = useAdvancedFeaturesStore.getState().features;
      expect(newFeatures.templateAlias).not.toBe(initialFeatures.templateAlias);
      expect(newFeatures.colorTemplates).toBe(initialFeatures.colorTemplates);
      expect(newFeatures.caching).toBe(initialFeatures.caching);
    });
  });

  describe('setFeature', () => {
    it('should set a feature to true', () => {
      useAdvancedFeaturesStore.getState().setFeature('colorTemplates', true);
      
      expect(useAdvancedFeaturesStore.getState().features.colorTemplates).toBe(true);
    });

    it('should set a feature to false', () => {
      useAdvancedFeaturesStore.getState().setFeature('caching', false);
      
      expect(useAdvancedFeaturesStore.getState().features.caching).toBe(false);
    });
  });

  describe('setAllFeatures', () => {
    it('should enable all features', () => {
      useAdvancedFeaturesStore.getState().setAllFeatures(true);
      
      const features = useAdvancedFeaturesStore.getState().features;
      Object.values(features).forEach((value) => {
        expect(value).toBe(true);
      });
    });

    it('should disable all features', () => {
      useAdvancedFeaturesStore.getState().setAllFeatures(false);
      
      const features = useAdvancedFeaturesStore.getState().features;
      Object.values(features).forEach((value) => {
        expect(value).toBe(false);
      });
    });
  });

  describe('setFeatures', () => {
    it('should update multiple features at once', () => {
      useAdvancedFeaturesStore.getState().setFeatures({
        templateAlias: true,
        colorTemplates: true,
      });
      
      const features = useAdvancedFeaturesStore.getState().features;
      expect(features.templateAlias).toBe(true);
      expect(features.colorTemplates).toBe(true);
    });

    it('should preserve unspecified features', () => {
      const initialCaching = useAdvancedFeaturesStore.getState().features.caching;
      
      useAdvancedFeaturesStore.getState().setFeatures({
        templateAlias: true,
      });
      
      expect(useAdvancedFeaturesStore.getState().features.caching).toBe(initialCaching);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all features to defaults', () => {
      // Modify some features
      useAdvancedFeaturesStore.getState().setAllFeatures(true);
      
      // Reset
      useAdvancedFeaturesStore.getState().resetToDefaults();
      
      const features = useAdvancedFeaturesStore.getState().features;
      // Only caching should be true by default
      expect(features.caching).toBe(true);
      expect(features.templateAlias).toBe(false);
      expect(features.colorTemplates).toBe(false);
      expect(features.tooltips).toBe(false);
    });
  });

  describe('setAutoDetectOnImport', () => {
    it('should enable auto-detect', () => {
      useAdvancedFeaturesStore.getState().setAutoDetectOnImport(true);
      
      expect(useAdvancedFeaturesStore.getState().autoDetectOnImport).toBe(true);
    });

    it('should disable auto-detect', () => {
      useAdvancedFeaturesStore.getState().setAutoDetectOnImport(false);
      
      expect(useAdvancedFeaturesStore.getState().autoDetectOnImport).toBe(false);
    });
  });

  describe('detectAndEnableFeatures', () => {
    beforeEach(() => {
      useAdvancedFeaturesStore.getState().setAutoDetectOnImport(true);
      useAdvancedFeaturesStore.getState().resetToDefaults();
    });

    it('should detect templateAlias', () => {
      const config: OhMyPoshConfig = {
        blocks: [{
          id: '1',
          type: 'prompt',
          segments: [{
            id: '1',
            type: 'text',
            style: 'plain',
            alias: 'my-alias',
          }],
        }],
      };

      const enabled = useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.templateAlias).toBe(true);
      expect(enabled).toContain('Template Alias');
    });

    it('should detect colorTemplates', () => {
      const config: OhMyPoshConfig = {
        blocks: [{
          id: '1',
          type: 'prompt',
          segments: [{
            id: '1',
            type: 'text',
            style: 'plain',
            foreground_templates: ['{{ if eq .Env.TERM "xterm" }}#fff{{ end }}'],
          }],
        }],
      };

      useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.colorTemplates).toBe(true);
    });

    it('should detect tooltips', () => {
      const config: OhMyPoshConfig = {
        blocks: [],
        tooltips: [{
          id: '1',
          type: 'git',
          style: 'plain',
          tips: ['git'],
        }],
      };

      const enabled = useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.tooltips).toBe(true);
      expect(enabled).toContain('Tooltips');
    });

    it('should detect extraPrompts', () => {
      const config: OhMyPoshConfig = {
        blocks: [],
        transient_prompt: { template: '> ' },
      };

      useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.extraPrompts).toBe(true);
    });

    it('should detect diamondSymbols on segments', () => {
      const config: OhMyPoshConfig = {
        blocks: [{
          id: '1',
          type: 'prompt',
          segments: [{
            id: '1',
            type: 'text',
            style: 'diamond',
            leading_diamond: '\ue0b6',
          }],
        }],
      };

      useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.diamondSymbols).toBe(true);
    });

    it('should detect diamondSymbols on blocks', () => {
      const config: OhMyPoshConfig = {
        blocks: [{
          id: '1',
          type: 'prompt',
          leading_diamond: '\ue0b6',
          segments: [],
        }],
      };

      useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.diamondSymbols).toBe(true);
    });

    it('should detect responsiveDisplay', () => {
      const config: OhMyPoshConfig = {
        blocks: [{
          id: '1',
          type: 'prompt',
          segments: [{
            id: '1',
            type: 'text',
            style: 'plain',
            min_width: 100,
          }],
        }],
      };

      useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.responsiveDisplay).toBe(true);
    });

    it('should detect consoleTitle', () => {
      const config: OhMyPoshConfig = {
        blocks: [],
        console_title_template: '{{ .Shell }}',
      };

      useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.consoleTitle).toBe(true);
    });

    it('should detect shellIntegration', () => {
      const config: OhMyPoshConfig = {
        blocks: [],
        shell_integration: true,
      };

      useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.shellIntegration).toBe(true);
    });

    it('should detect paletteVariants', () => {
      const config: OhMyPoshConfig = {
        blocks: [],
        palettes: {
          list: {
            dark: { primary: '#111' },
          },
        },
      };

      useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(useAdvancedFeaturesStore.getState().features.paletteVariants).toBe(true);
    });

    it('should respect autoDetectOnImport flag', () => {
      useAdvancedFeaturesStore.getState().setAutoDetectOnImport(false);
      
      const config: OhMyPoshConfig = {
        blocks: [],
        tooltips: [{
          id: '1',
          type: 'git',
          style: 'plain',
          tips: ['git'],
        }],
      };

      const enabled = useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      expect(enabled).toHaveLength(0);
      expect(useAdvancedFeaturesStore.getState().features.tooltips).toBe(false);
    });

    it('should not re-enable already enabled features', () => {
      useAdvancedFeaturesStore.getState().setFeature('tooltips', true);
      
      const config: OhMyPoshConfig = {
        blocks: [],
        tooltips: [{
          id: '1',
          type: 'git',
          style: 'plain',
          tips: ['git'],
        }],
      };

      const enabled = useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);

      // Should not include "Tooltips" since it was already enabled
      expect(enabled).not.toContain('Tooltips');
    });
  });
});

describe('helper functions', () => {
  describe('hasEnabledFeaturesInCategory', () => {
    it('should return true when segment features are enabled', () => {
      const features: AdvancedFeatures = {
        templateAlias: true,
        colorTemplates: false,
        responsiveDisplay: false,
        folderFilters: false,
        caching: false,
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

      expect(hasEnabledFeaturesInCategory(features, 'segment')).toBe(true);
    });

    it('should return false when no segment features are enabled', () => {
      const features: AdvancedFeatures = {
        templateAlias: false,
        colorTemplates: false,
        responsiveDisplay: false,
        folderFilters: false,
        caching: false,
        templatesLogic: false,
        interactive: false,
        diamondSymbols: false,
        blockOverflow: false,
        blockFiller: false,
        tooltips: true, // global feature
        extraPrompts: false,
        consoleTitle: false,
        shellIntegration: false,
        paletteVariants: false,
      };

      expect(hasEnabledFeaturesInCategory(features, 'segment')).toBe(false);
    });

    it('should return true when block features are enabled', () => {
      const features: AdvancedFeatures = {
        templateAlias: false,
        colorTemplates: false,
        responsiveDisplay: false,
        folderFilters: false,
        caching: false,
        templatesLogic: false,
        interactive: false,
        diamondSymbols: true,
        blockOverflow: false,
        blockFiller: false,
        tooltips: false,
        extraPrompts: false,
        consoleTitle: false,
        shellIntegration: false,
        paletteVariants: false,
      };

      expect(hasEnabledFeaturesInCategory(features, 'block')).toBe(true);
    });

    it('should return true when global features are enabled', () => {
      const features: AdvancedFeatures = {
        templateAlias: false,
        colorTemplates: false,
        responsiveDisplay: false,
        folderFilters: false,
        caching: false,
        templatesLogic: false,
        interactive: false,
        diamondSymbols: false,
        blockOverflow: false,
        blockFiller: false,
        tooltips: true,
        extraPrompts: false,
        consoleTitle: false,
        shellIntegration: false,
        paletteVariants: false,
      };

      expect(hasEnabledFeaturesInCategory(features, 'global')).toBe(true);
    });
  });

  describe('getEnabledFeatureCount', () => {
    it('should return 0 when all features are disabled', () => {
      const features: AdvancedFeatures = {
        templateAlias: false,
        colorTemplates: false,
        responsiveDisplay: false,
        folderFilters: false,
        caching: false,
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

      expect(getEnabledFeatureCount(features)).toBe(0);
    });

    it('should count enabled features correctly', () => {
      const features: AdvancedFeatures = {
        templateAlias: true,
        colorTemplates: true,
        responsiveDisplay: false,
        folderFilters: false,
        caching: true,
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

      expect(getEnabledFeatureCount(features)).toBe(3);
    });
  });

  describe('areAllFeaturesEnabled', () => {
    it('should return false when some features are disabled', () => {
      const features: AdvancedFeatures = {
        templateAlias: true,
        colorTemplates: false,
        responsiveDisplay: true,
        folderFilters: true,
        caching: true,
        templatesLogic: true,
        interactive: true,
        diamondSymbols: true,
        blockOverflow: true,
        blockFiller: true,
        tooltips: true,
        extraPrompts: true,
        consoleTitle: true,
        shellIntegration: true,
        paletteVariants: true,
      };

      expect(areAllFeaturesEnabled(features)).toBe(false);
    });

    it('should return true when all features are enabled', () => {
      const features: AdvancedFeatures = {
        templateAlias: true,
        colorTemplates: true,
        responsiveDisplay: true,
        folderFilters: true,
        caching: true,
        templatesLogic: true,
        interactive: true,
        diamondSymbols: true,
        blockOverflow: true,
        blockFiller: true,
        tooltips: true,
        extraPrompts: true,
        consoleTitle: true,
        shellIntegration: true,
        paletteVariants: true,
      };

      expect(areAllFeaturesEnabled(features)).toBe(true);
    });
  });
});

describe('FEATURE_METADATA', () => {
  it('should have metadata for all feature keys', () => {
    const featureKeys: (keyof AdvancedFeatures)[] = [
      'templateAlias',
      'colorTemplates',
      'responsiveDisplay',
      'folderFilters',
      'caching',
      'templatesLogic',
      'interactive',
      'diamondSymbols',
      'blockOverflow',
      'blockFiller',
      'tooltips',
      'extraPrompts',
      'consoleTitle',
      'shellIntegration',
      'paletteVariants',
    ];

    featureKeys.forEach((key) => {
      expect(FEATURE_METADATA[key]).toBeDefined();
      expect(FEATURE_METADATA[key].label).toBeDefined();
      expect(FEATURE_METADATA[key].description).toBeDefined();
      expect(FEATURE_METADATA[key].category).toBeDefined();
    });
  });

  it('should have valid categories', () => {
    Object.values(FEATURE_METADATA).forEach((meta) => {
      expect(['segment', 'block', 'global']).toContain(meta.category);
    });
  });
});
