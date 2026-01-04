/**
 * Fetch Official Themes Script
 * 
 * This script fetches theme filenames from the Oh My Posh GitHub repository
 * and generates a manifest file with inferred tags for each theme.
 * 
 * Usage: node scripts/fetch-official-themes.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_API_URL = 'https://api.github.com/repos/JanDeDobbeleer/oh-my-posh/contents/themes';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'configs', 'official', 'manifest.json');

/**
 * Infer tags from theme filename and common patterns
 */
function inferTags(name, filename) {
  const tags = [];
  const lowerName = name.toLowerCase();
  
  // Style tags
  if (lowerName.includes('minimal')) {
    tags.push('minimal', 'nerd-font-free');
  }
  if (lowerName.includes('diamond') || lowerName.includes('bubbles')) {
    tags.push('diamond');
  }
  if (lowerName.includes('plain') || lowerName.includes('pure') || lowerName.includes('spaceship')) {
    tags.push('plain');
  }

  // Color scheme tags
  if (lowerName.includes('catppuccin')) {
    tags.push('catppuccin');
  }
  if (lowerName.includes('dracula')) {
    tags.push('dracula');
  }
  if (lowerName.includes('gruvbox')) {
    tags.push('gruvbox');
  }
  if (lowerName.includes('nord')) {
    tags.push('nord');
  }
  if (lowerName.includes('tokyo')) {
    tags.push('tokyo-night');
  }
  if (lowerName.includes('onehalf')) {
    tags.push('onehalf');
  }
  if (lowerName.includes('material')) {
    tags.push('material');
  }

  // Theme tone
  if (lowerName.includes('dark') || lowerName.includes('night') || lowerName.includes('mocha') || lowerName.includes('frappe') || lowerName.includes('macchiato')) {
    tags.push('dark');
  }
  if (lowerName.includes('light') || lowerName.includes('latte')) {
    tags.push('light');
  }

  // Color tags
  if (lowerName.includes('rainbow') || lowerName.includes('unicorn') || lowerName.includes('neon')) {
    tags.push('colorful', 'rainbow');
  }
  if (lowerName.includes('blue')) {
    tags.push('blue');
  }

  // Cloud/DevOps tags
  if (lowerName.includes('cloud') || lowerName.includes('azure')) {
    tags.push('cloud');
  }
  if (lowerName.includes('azure')) {
    tags.push('azure');
  }
  if (lowerName.includes('aws')) {
    tags.push('aws');
  }
  if (lowerName.includes('gcp')) {
    tags.push('gcp');
  }

  // Special tags
  if (lowerName.includes('git')) {
    tags.push('git');
  }
  if (lowerName.includes('robbyrussell') || lowerName.includes('oh-my-zsh') || lowerName.includes('ys')) {
    tags.push('oh-my-zsh');
  }
  if (lowerName.includes('fish')) {
    tags.push('fish-style');
  }
  
  // Powerline (most themes use it unless minimal or plain)
  if (!tags.includes('minimal') && !tags.includes('plain')) {
    tags.push('powerline');
  }

  // Default git tag for most themes
  if (!tags.includes('git') && !lowerName.includes('minimal')) {
    tags.push('git');
  }

  // Remove duplicates
  return [...new Set(tags)];
}

/**
 * Check if theme is minimal (doesn't require Nerd Fonts)
 */
function isMinimalTheme(name) {
  const lowerName = name.toLowerCase();
  return lowerName.includes('minimal') || lowerName.includes('.minimal');
}

/**
 * Get the image name for a theme (may differ from config name)
 * The ohmyposh.dev site uses specific naming conventions
 */
function getImageName(name) {
  // Most images match the theme name, but some have variations
  // The site uses the name without the .minimal suffix for images
  return name;
}

/**
 * Fetch themes from GitHub API
 */
async function fetchThemesFromGitHub() {
  console.log('🔍 Fetching themes from GitHub...');
  
  const response = await fetch(GITHUB_API_URL, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ohmyposh-configurator'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const files = await response.json();
  return files
    .filter(file => file.name.endsWith('.omp.json') || file.name.endsWith('.omp.yaml') || file.name.endsWith('.omp.yml'))
    .map(file => ({
      name: file.name.replace(/\.omp\.(json|yaml|yml)$/, ''),
      file: file.name
    }));
}

/**
 * Generate manifest from theme list
 */
function generateManifest(themes) {
  const manifest = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    themes: themes.map(theme => ({
      name: theme.name,
      file: theme.file,
      isMinimal: isMinimalTheme(theme.name),
      tags: inferTags(theme.name, theme.file),
      imageUrl: `https://ohmyposh.dev/img/themes/${getImageName(theme.name)}.png`,
      githubUrl: `https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/themes/${theme.file}`
    })).sort((a, b) => a.name.localeCompare(b.name))
  };

  return manifest;
}

/**
 * Main function
 */
async function main() {
  try {
    // Fetch themes from GitHub
    const themes = await fetchThemesFromGitHub();
    console.log(`✓ Found ${themes.length} themes`);

    // Generate manifest
    const manifest = generateManifest(themes);
    
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write manifest file
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));
    console.log(`✓ Manifest written to ${OUTPUT_PATH}`);

    // Print summary
    const minimalCount = manifest.themes.filter(t => t.isMinimal).length;
    const tagCounts = {};
    manifest.themes.forEach(theme => {
      theme.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    console.log('\n📊 Summary:');
    console.log(`   Total themes: ${manifest.themes.length}`);
    console.log(`   Minimal themes (no Nerd Font): ${minimalCount}`);
    console.log(`   Regular themes: ${manifest.themes.length - minimalCount}`);
    console.log('\n🏷️  Top tags:');
    Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([tag, count]) => {
        console.log(`   ${tag}: ${count}`);
      });

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
