import { create } from 'zustand';
import { get, set, del, keys } from 'idb-keyval';
import type { OhMyPoshConfig, SavedConfig, SavedConfigsBundle } from '../types/ohmyposh';
import { useConfigStore, generateId } from './configStore';

const CONFIGS_STORAGE_KEY = 'ohmyposh-saved-configs';
const DRAFT_STORAGE_KEY = 'ohmyposh-draft-config';
const MAX_CONFIGS = 50;
const DRAFT_DEBOUNCE_MS = 5000;

interface DraftData {
  config: OhMyPoshConfig;
  savedAt: string;
}

interface SavedConfigsState {
  configs: SavedConfig[];
  draftConfig: OhMyPoshConfig | null;
  draftSavedAt: string | null;
  lastLoadedId: string | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  loadFromStorage: () => Promise<void>;
  saveConfig: (name: string, description?: string, tags?: string[]) => Promise<SavedConfig | null>;
  updateConfig: (id: string, updates: Partial<Omit<SavedConfig, 'id' | 'createdAt'>>) => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
  loadConfig: (id: string) => void;
  duplicateConfig: (id: string) => Promise<SavedConfig | null>;
  renameConfig: (id: string, newName: string) => Promise<void>;
  
  // Draft actions
  saveDraft: (config: OhMyPoshConfig) => Promise<void>;
  clearDraft: () => Promise<void>;
  loadDraft: () => Promise<DraftData | null>;
  restoreDraft: () => void;
  
  // Bundle actions
  exportAllConfigs: () => SavedConfigsBundle;
  importConfigsBundle: (bundle: SavedConfigsBundle, strategy: 'skip' | 'rename') => Promise<{ imported: number; skipped: number }>;
  
  // State management
  setHasUnsavedChanges: (value: boolean) => void;
  clearLastLoadedId: () => void;
}

// Helper to persist configs to IndexedDB
const persistConfigs = async (configs: SavedConfig[]) => {
  await set(CONFIGS_STORAGE_KEY, configs);
};

export const useSavedConfigsStore = create<SavedConfigsState>((setState, getState) => ({
  configs: [],
  draftConfig: null,
  draftSavedAt: null,
  lastLoadedId: null,
  isLoading: true,
  hasUnsavedChanges: false,

  loadFromStorage: async () => {
    setState({ isLoading: true });
    try {
      const storedConfigs = await get<SavedConfig[]>(CONFIGS_STORAGE_KEY);
      setState({ 
        configs: storedConfigs || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load saved configs:', error);
      setState({ configs: [], isLoading: false });
    }
  },

  saveConfig: async (name, description, tags) => {
    const { configs } = getState();
    
    // Check limit
    if (configs.length >= MAX_CONFIGS) {
      console.error(`Cannot save: Maximum of ${MAX_CONFIGS} configs reached`);
      return null;
    }
    
    // Check for duplicate name
    if (configs.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      console.error('A config with this name already exists');
      return null;
    }
    
    const currentConfig = useConfigStore.getState().config;
    const now = new Date().toISOString();
    
    const newConfig: SavedConfig = {
      id: generateId(),
      name,
      description,
      config: JSON.parse(JSON.stringify(currentConfig)), // Deep clone
      createdAt: now,
      updatedAt: now,
      tags,
    };
    
    const updatedConfigs = [...configs, newConfig];
    await persistConfigs(updatedConfigs);
    
    setState({ 
      configs: updatedConfigs,
      lastLoadedId: newConfig.id,
      hasUnsavedChanges: false,
    });
    
    // Clear draft after explicit save
    await getState().clearDraft();
    
    return newConfig;
  },

  updateConfig: async (id, updates) => {
    const { configs } = getState();
    const index = configs.findIndex(c => c.id === id);
    if (index === -1) return;
    
    // If updating name, check for duplicates
    if (updates.name) {
      const duplicate = configs.some(
        c => c.id !== id && c.name.toLowerCase() === updates.name!.toLowerCase()
      );
      if (duplicate) {
        console.error('A config with this name already exists');
        return;
      }
    }
    
    const updatedConfig: SavedConfig = {
      ...configs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // If config content is being updated, use current config from store
    if (updates.config) {
      updatedConfig.config = JSON.parse(JSON.stringify(updates.config));
    }
    
    const updatedConfigs = [...configs];
    updatedConfigs[index] = updatedConfig;
    
    await persistConfigs(updatedConfigs);
    setState({ configs: updatedConfigs, hasUnsavedChanges: false });
    
    // Clear draft after explicit save
    await getState().clearDraft();
  },

  deleteConfig: async (id) => {
    const { configs, lastLoadedId } = getState();
    const updatedConfigs = configs.filter(c => c.id !== id);
    
    await persistConfigs(updatedConfigs);
    setState({ 
      configs: updatedConfigs,
      lastLoadedId: lastLoadedId === id ? null : lastLoadedId,
    });
  },

  loadConfig: (id) => {
    const { configs } = getState();
    const config = configs.find(c => c.id === id);
    if (!config) return;
    
    // Deep clone and set config
    const loadedConfig = JSON.parse(JSON.stringify(config.config));
    useConfigStore.getState().setConfig(loadedConfig);
    
    setState({ 
      lastLoadedId: id,
      hasUnsavedChanges: false,
    });
    
    // Clear draft when loading a saved config
    getState().clearDraft();
  },

  duplicateConfig: async (id) => {
    const { configs } = getState();
    
    // Check limit
    if (configs.length >= MAX_CONFIGS) {
      console.error(`Cannot duplicate: Maximum of ${MAX_CONFIGS} configs reached`);
      return null;
    }
    
    const original = configs.find(c => c.id === id);
    if (!original) return null;
    
    // Generate unique name
    let newName = `${original.name} (Copy)`;
    let counter = 1;
    while (configs.some(c => c.name.toLowerCase() === newName.toLowerCase())) {
      counter++;
      newName = `${original.name} (Copy ${counter})`;
    }
    
    const now = new Date().toISOString();
    const duplicated: SavedConfig = {
      id: generateId(),
      name: newName,
      description: original.description,
      config: JSON.parse(JSON.stringify(original.config)),
      createdAt: now,
      updatedAt: now,
      tags: original.tags ? [...original.tags] : undefined,
    };
    
    const updatedConfigs = [...configs, duplicated];
    await persistConfigs(updatedConfigs);
    setState({ configs: updatedConfigs });
    
    return duplicated;
  },

  renameConfig: async (id, newName) => {
    await getState().updateConfig(id, { name: newName });
  },

  // Draft management
  saveDraft: async (config) => {
    const draftData: DraftData = {
      config: JSON.parse(JSON.stringify(config)),
      savedAt: new Date().toISOString(),
    };
    await set(DRAFT_STORAGE_KEY, draftData);
    setState({ 
      draftConfig: draftData.config,
      draftSavedAt: draftData.savedAt,
    });
  },

  clearDraft: async () => {
    await del(DRAFT_STORAGE_KEY);
    setState({ draftConfig: null, draftSavedAt: null });
  },

  loadDraft: async () => {
    try {
      const draftData = await get<DraftData>(DRAFT_STORAGE_KEY);
      if (draftData) {
        setState({ 
          draftConfig: draftData.config,
          draftSavedAt: draftData.savedAt,
        });
      }
      return draftData || null;
    } catch {
      return null;
    }
  },

  restoreDraft: () => {
    const { draftConfig } = getState();
    if (!draftConfig) return;
    
    useConfigStore.getState().setConfig(draftConfig);
    setState({ hasUnsavedChanges: true });
  },

  // Bundle export/import
  exportAllConfigs: () => {
    const { configs } = getState();
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      configs,
    };
  },

  importConfigsBundle: async (bundle, strategy) => {
    const { configs } = getState();
    let imported = 0;
    let skipped = 0;
    
    const newConfigs: SavedConfig[] = [];
    
    for (const config of bundle.configs) {
      // Check limit
      if (configs.length + newConfigs.length >= MAX_CONFIGS) {
        skipped += bundle.configs.length - imported - skipped;
        break;
      }
      
      const existingByName = configs.some(
        c => c.name.toLowerCase() === config.name.toLowerCase()
      );
      const alreadyAdded = newConfigs.some(
        c => c.name.toLowerCase() === config.name.toLowerCase()
      );
      
      if (existingByName || alreadyAdded) {
        if (strategy === 'skip') {
          skipped++;
          continue;
        } else {
          // Rename strategy: generate unique name
          let newName = config.name;
          let counter = 1;
          while (
            configs.some(c => c.name.toLowerCase() === newName.toLowerCase()) ||
            newConfigs.some(c => c.name.toLowerCase() === newName.toLowerCase())
          ) {
            counter++;
            newName = `${config.name} (${counter})`;
          }
          config.name = newName;
        }
      }
      
      const now = new Date().toISOString();
      newConfigs.push({
        ...config,
        id: generateId(), // Generate new ID to avoid conflicts
        createdAt: now,
        updatedAt: now,
      });
      imported++;
    }
    
    if (newConfigs.length > 0) {
      const updatedConfigs = [...configs, ...newConfigs];
      await persistConfigs(updatedConfigs);
      setState({ configs: updatedConfigs });
    }
    
    return { imported, skipped };
  },

  setHasUnsavedChanges: (value) => {
    setState({ hasUnsavedChanges: value });
  },

  clearLastLoadedId: () => {
    setState({ lastLoadedId: null });
  },
}));

// Auto-save draft with debounce
let draftTimeout: ReturnType<typeof setTimeout> | null = null;

export const setupDraftAutoSave = () => {
  return useConfigStore.subscribe((state) => {
    // Clear any pending timeout
    if (draftTimeout) {
      clearTimeout(draftTimeout);
    }
    
    // Set new timeout
    draftTimeout = setTimeout(() => {
      useSavedConfigsStore.getState().saveDraft(state.config);
      useSavedConfigsStore.getState().setHasUnsavedChanges(true);
    }, DRAFT_DEBOUNCE_MS);
  });
};

// Helper to check if stored keys exist (for debugging)
export const debugStorageKeys = async () => {
  const allKeys = await keys();
  console.log('IndexedDB keys:', allKeys);
};
