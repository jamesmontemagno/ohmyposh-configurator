import yaml from 'js-yaml';
import type { OhMyPoshConfig } from '../types/ohmyposh';
import { generateId } from '../store/configStore';

/**
 * Represents an official Oh My Posh theme from the repository
 */
export interface OfficialTheme {
  name: string;
  file: string;
  isMinimal: boolean;
  tags: string[];
  imageUrl: string;
  githubUrl: string;
}

/**
 * Manifest structure for official themes
 */
export interface OfficialThemeManifest {
  version: string;
  lastUpdated: string;
  themes: OfficialTheme[];
}

const BASE_PATH = import.meta.env.BASE_URL || '/';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes';

// Cache for manifest and theme configs
let manifestCache: OfficialThemeManifest | null = null;
let manifestPromise: Promise<OfficialThemeManifest> | null = null;
const themeConfigCache = new Map<string, OhMyPoshConfig>();
const themeConfigPromises = new Map<string, Promise<OhMyPoshConfig | null>>();

/**
 * Load the official themes manifest with caching
 */
export async function loadOfficialThemeManifest(): Promise<OfficialThemeManifest> {
  if (manifestCache) {
    return manifestCache;
  }

  if (manifestPromise) {
    return manifestPromise;
  }

  manifestPromise = (async () => {
    try {
      const response = await fetch(`${BASE_PATH}configs/official/manifest.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch official themes manifest');
      }
      const data = await response.json();
      manifestCache = data;
      manifestPromise = null;
      return data;
    } catch (error) {
      console.error('Error loading official themes manifest:', error);
      manifestPromise = null;
      return { version: '1.0.0', lastUpdated: new Date().toISOString(), themes: [] };
    }
  })();

  return manifestPromise;
}

/**
 * Parse config content based on file extension
 */
function parseConfigContent(content: string, filename: string): unknown {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (extension === 'yaml' || extension === 'yml') {
    return yaml.load(content);
  }
  
  // Default to JSON
  return JSON.parse(content);
}

/**
 * Fetch an official theme config from GitHub and add runtime IDs
 */
export async function fetchOfficialTheme(filename: string): Promise<OhMyPoshConfig | null> {
  // Check cache first
  if (themeConfigCache.has(filename)) {
    return themeConfigCache.get(filename)!;
  }

  // Check if already fetching
  if (themeConfigPromises.has(filename)) {
    return themeConfigPromises.get(filename)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${GITHUB_RAW_BASE}/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch theme: ${filename}`);
      }
      
      const content = await response.text();
      const rawConfig = parseConfigContent(content, filename) as Record<string, unknown>;
      
      // Add runtime IDs to blocks and segments
      const config: OhMyPoshConfig = {
        ...rawConfig,
        blocks: Array.isArray(rawConfig.blocks) 
          ? rawConfig.blocks.map((block: Record<string, unknown>) => ({
              ...block,
              id: generateId(),
              segments: Array.isArray(block.segments)
                ? block.segments.map((segment: Record<string, unknown>) => ({
                    ...segment,
                    id: generateId(),
                  }))
                : [],
            }))
          : [],
        // Add IDs to tooltips if present
        tooltips: Array.isArray(rawConfig.tooltips)
          ? rawConfig.tooltips.map((tooltip: Record<string, unknown>) => ({
              ...tooltip,
              id: generateId(),
            }))
          : undefined,
      } as OhMyPoshConfig;

      themeConfigCache.set(filename, config);
      themeConfigPromises.delete(filename);
      return config;
    } catch (error) {
      console.error(`Error fetching official theme ${filename}:`, error);
      themeConfigPromises.delete(filename);
      return null;
    }
  })();

  themeConfigPromises.set(filename, promise);
  return promise;
}

/**
 * Get the preview image URL for a theme
 * Uses the imageUrl from manifest if available, otherwise constructs from name
 */
export function getThemePreviewUrl(theme: OfficialTheme): string {
  return theme.imageUrl || `https://ohmyposh.dev/img/themes/${theme.name}.png`;
}

/**
 * Clear all caches (useful for testing or forced refresh)
 */
export function clearOfficialThemeCache(): void {
  manifestCache = null;
  manifestPromise = null;
  themeConfigCache.clear();
  themeConfigPromises.clear();
}
