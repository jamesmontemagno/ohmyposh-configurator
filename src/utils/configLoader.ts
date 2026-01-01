import type { OhMyPoshConfig } from '../types/ohmyposh';
import { generateId } from '../store/configStore';

export interface ConfigMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  author: string;
  tags: string[];
  file: string;
}

export interface ConfigManifest {
  version: string;
  lastUpdated: string;
  configs: ConfigMetadata[];
}

// Config files now contain only the Oh My Posh configuration
// Metadata is stored separately in manifest.json
export type ConfigFile = Omit<OhMyPoshConfig, 'blocks'> & {
  blocks: Array<{
    type: 'prompt' | 'rprompt';
    alignment?: 'left' | 'right';
    newline?: boolean;
    segments: Array<{
      type: string;
      style: string;
      [key: string]: unknown;
    }>;
  }>;
};

const BASE_PATH = import.meta.env.BASE_URL || '/';

/**
 * Fetch configs manifest from a category (samples or community)
 */
export async function fetchConfigManifest(category: 'samples' | 'community'): Promise<ConfigManifest> {
  try {
    const response = await fetch(`${BASE_PATH}configs/${category}/manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} manifest`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${category} manifest:`, error);
    return { version: '1.0.0', lastUpdated: new Date().toISOString(), configs: [] };
  }
}

/**
 * Fetch a specific config file
 */
export async function fetchConfigFile(
  category: 'samples' | 'community',
  filename: string
): Promise<ConfigFile | null> {
  try {
    const response = await fetch(`${BASE_PATH}configs/${category}/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch config file: ${filename}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading config file ${filename}:`, error);
    return null;
  }
}

/**
 * Load and convert config file to runtime config with unique IDs
 */
export async function loadConfig(
  category: 'samples' | 'community',
  filename: string
): Promise<OhMyPoshConfig | null> {
  const configFile = await fetchConfigFile(category, filename);
  if (!configFile) return null;

  // Config file is now a pure Oh My Posh config, just add IDs
  return {
    ...configFile,
    blocks: configFile.blocks.map((block) => ({
      ...block,
      id: generateId(),
      segments: block.segments.map((segment) => ({
        ...segment,
        id: generateId(),
      })),
    })),
  } as OhMyPoshConfig;
}

/**
 * Load all configs from both categories
 */
export async function loadAllConfigs(): Promise<{
  samples: ConfigMetadata[];
  community: ConfigMetadata[];
}> {
  const [samplesManifest, communityManifest] = await Promise.all([
    fetchConfigManifest('samples'),
    fetchConfigManifest('community'),
  ]);

  return {
    samples: samplesManifest.configs,
    community: communityManifest.configs,
  };
}
