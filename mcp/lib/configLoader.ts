/**
 * Configuration Loader for MCP Server
 * Loads sample and community configurations from JSON files
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { OhMyPoshConfig } from '../../src/types/ohmyposh.js';

export interface ConfigManifestEntry {
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
  lastUpdated?: string;
  configs: ConfigManifestEntry[];
}

export type ConfigCategory = 'samples' | 'community';

/**
 * Load manifest for a specific category
 */
export async function loadManifest(
  category: ConfigCategory,
  configsDir: string
): Promise<ConfigManifest | null> {
  try {
    const manifestPath = join(configsDir, category, 'manifest.json');
    const content = await readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${category} manifest:`, error);
    return null;
  }
}

/**
 * Load a specific configuration file
 */
export async function loadConfig(
  category: ConfigCategory,
  fileName: string,
  configsDir: string
): Promise<OhMyPoshConfig | null> {
  try {
    const configPath = join(configsDir, category, fileName);
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${category}/${fileName}:`, error);
    return null;
  }
}

/**
 * Load configuration by ID from manifest
 */
export async function loadConfigById(
  category: ConfigCategory,
  configId: string,
  configsDir: string
): Promise<{ config: OhMyPoshConfig; metadata: ConfigManifestEntry } | null> {
  const manifest = await loadManifest(category, configsDir);
  if (!manifest) return null;

  const entry = manifest.configs.find((c) => c.id === configId);
  if (!entry) return null;

  const config = await loadConfig(category, entry.file, configsDir);
  if (!config) return null;

  return { config, metadata: entry };
}

/**
 * List all available configurations in a category
 */
export async function listConfigs(
  category: ConfigCategory,
  configsDir: string
): Promise<ConfigManifestEntry[]> {
  const manifest = await loadManifest(category, configsDir);
  return manifest?.configs || [];
}

/**
 * Search configurations by tags or name
 */
export async function searchConfigs(
  query: string,
  configsDir: string
): Promise<{ category: ConfigCategory; config: ConfigManifestEntry }[]> {
  const results: { category: ConfigCategory; config: ConfigManifestEntry }[] = [];
  const categories: ConfigCategory[] = ['samples', 'community'];
  const lowerQuery = query.toLowerCase();

  for (const category of categories) {
    const manifest = await loadManifest(category, configsDir);
    if (!manifest) continue;

    for (const config of manifest.configs) {
      if (
        config.name.toLowerCase().includes(lowerQuery) ||
        config.description.toLowerCase().includes(lowerQuery) ||
        config.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        config.author.toLowerCase().includes(lowerQuery)
      ) {
        results.push({ category, config });
      }
    }
  }

  return results;
}

/**
 * Get all configurations from both categories
 */
export async function getAllConfigs(
  configsDir: string
): Promise<{ category: ConfigCategory; configs: ConfigManifestEntry[] }[]> {
  const categories: ConfigCategory[] = ['samples', 'community'];
  const results: { category: ConfigCategory; configs: ConfigManifestEntry[] }[] = [];

  for (const category of categories) {
    const configs = await listConfigs(category, configsDir);
    results.push({ category, configs });
  }

  return results;
}
