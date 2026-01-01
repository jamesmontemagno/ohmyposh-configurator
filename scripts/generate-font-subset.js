#!/usr/bin/env node

/**
 * Font Subset Generation Script
 * 
 * Generates a subset of the Nerd Font containing only the icons used in the app.
 * This reduces the font file size from ~1.5MB to ~50-100KB.
 * 
 * Prerequisites:
 *   - Python 3.x
 *   - fonttools: pip install fonttools brotli
 * 
 * Usage: node scripts/generate-font-subset.js
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

/**
 * Check if fonttools is installed
 */
function checkFontTools() {
  try {
    execSync('pyftsubset --help', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Print fonttools installation instructions
 */
function printInstallInstructions() {
  console.error(`${colors.red}✗ fonttools not found${colors.reset}\n`);
  console.log(`${colors.cyan}To generate font subsets, you need to install fonttools:${colors.reset}\n`);
  console.log(`${colors.yellow}macOS/Linux:${colors.reset}`);
  console.log(`  pip3 install fonttools brotli\n`);
  console.log(`${colors.yellow}Windows:${colors.reset}`);
  console.log(`  pip install fonttools brotli\n`);
  console.log(`${colors.cyan}Or using conda:${colors.reset}`);
  console.log(`  conda install -c conda-forge fonttools brotli\n`);
  console.log(`${colors.cyan}For more information:${colors.reset}`);
  console.log(`  https://github.com/fonttools/fonttools\n`);
}

/**
 * Extract unicode code points from nerdFontIcons.ts
 */
function extractIconUnicodePoints() {
  const iconFilePath = join(rootDir, 'src/constants/nerdFontIcons.ts');
  const content = readFileSync(iconFilePath, 'utf-8');
  
  const unicodePoints = new Set();
  
  // Match char definitions like: char: '\uf067'
  const charRegex = /char:\s*'(\\u[0-9a-fA-F]{4})'/g;
  let match;
  
  while ((match = charRegex.exec(content)) !== null) {
    const unicodeEscape = match[1]; // e.g., '\uf067'
    const codePoint = parseInt(unicodeEscape.slice(2), 16);
    unicodePoints.add(codePoint);
  }
  
  return unicodePoints;
}

/**
 * Extract unicode from hardcoded templates in segment JSON files
 */
function extractTemplateUnicodePoints(dir) {
  const unicodePoints = new Set();
  
  function processFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Process segment metadata files
      if (Array.isArray(data)) {
        data.forEach(segment => {
          if (segment.defaultTemplate) {
            extractUnicodeFromString(segment.defaultTemplate, unicodePoints);
          }
        });
      }
      // Process config files
      else if (data.blocks && Array.isArray(data.blocks)) {
        data.blocks.forEach(block => {
          if (block.segments && Array.isArray(block.segments)) {
            block.segments.forEach(segment => {
              if (segment.template) {
                extractUnicodeFromString(segment.template, unicodePoints);
              }
            });
          }
        });
      }
    } catch (error) {
      // Silently skip invalid files
    }
  }
  
  function processDirectory(dir) {
    if (!existsSync(dir)) return;
    
    const files = readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const fullPath = join(dir, file.name);
      if (file.isDirectory()) {
        processDirectory(fullPath);
      } else if (file.name.endsWith('.json')) {
        processFile(fullPath);
      }
    });
  }
  
  processDirectory(dir);
  return unicodePoints;
}

/**
 * Extract unicode characters from a string
 */
function extractUnicodeFromString(str, unicodePoints) {
  // Match \uXXXX patterns
  const unicodeRegex = /\\u([0-9a-fA-F]{4})/g;
  let match;
  
  while ((match = unicodeRegex.exec(str)) !== null) {
    const codePoint = parseInt(match[1], 16);
    unicodePoints.add(codePoint);
  }
}

/**
 * Get powerline symbols that must be included
 */
function getPowerlineSymbols() {
  return new Set([
    0xe0b0, // Right-pointing triangle
    0xe0b2, // Leading diamond
    0xe0b4, // Trailing diamond
    0xe0b6, // Alternative diamond
  ]);
}

/**
 * Download the Nerd Font if not present
 */
function downloadNerdFont() {
  const fontDir = join(rootDir, 'public/fonts');
  const originalFontPath = join(fontDir, 'SymbolsNerdFontMono-Regular.ttf');
  
  if (existsSync(originalFontPath)) {
    console.log(`${colors.green}✓${colors.reset} Nerd Font already downloaded`);
    return originalFontPath;
  }
  
  console.log(`${colors.cyan}📥 Downloading Nerd Font...${colors.reset}`);
  
  if (!existsSync(fontDir)) {
    mkdirSync(fontDir, { recursive: true });
  }
  
  try {
    // Use curl to download the font
    execSync(
      `curl -L "https://cdn.jsdelivr.net/gh/ryanoasis/nerd-fonts@latest/patched-fonts/NerdFontsSymbolsOnly/SymbolsNerdFontMono-Regular.ttf" -o "${originalFontPath}"`,
      { stdio: 'inherit' }
    );
    console.log(`${colors.green}✓${colors.reset} Downloaded Nerd Font to ${originalFontPath}`);
    return originalFontPath;
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to download Nerd Font: ${error.message}`);
    throw error;
  }
}

/**
 * Generate font subset using pyftsubset
 */
function generateSubset(originalFontPath, unicodePoints, outputDir) {
  console.log(`${colors.cyan}⚙ Generating font subset...${colors.reset}`);
  console.log(`${colors.blue}ℹ${colors.reset} Including ${unicodePoints.size} unique glyphs\n`);
  
  // Convert unicode points to comma-separated list
  const unicodeList = Array.from(unicodePoints)
    .map(cp => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`)
    .join(',');
  
  // Generate WOFF2 (primary format - best compression)
  const woff2Path = join(outputDir, 'nerd-symbols-subset.woff2');
  console.log(`${colors.cyan}📦 Creating WOFF2 format...${colors.reset}`);
  try {
    execSync(
      `pyftsubset "${originalFontPath}" --unicodes="${unicodeList}" --flavor=woff2 --output-file="${woff2Path}" --layout-features='*' --name-IDs='*' --notdef-outline --recommended-glyphs`,
      { stdio: 'inherit' }
    );
    console.log(`${colors.green}✓${colors.reset} Generated ${woff2Path}`);
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to generate WOFF2: ${error.message}`);
    throw error;
  }
  
  // Generate TTF (fallback format)
  const ttfPath = join(outputDir, 'nerd-symbols-subset.ttf');
  console.log(`\n${colors.cyan}📦 Creating TTF fallback...${colors.reset}`);
  try {
    execSync(
      `pyftsubset "${originalFontPath}" --unicodes="${unicodeList}" --output-file="${ttfPath}" --layout-features='*' --name-IDs='*' --notdef-outline --recommended-glyphs`,
      { stdio: 'inherit' }
    );
    console.log(`${colors.green}✓${colors.reset} Generated ${ttfPath}`);
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to generate TTF: ${error.message}`);
    throw error;
  }
  
  return { woff2Path, ttfPath };
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  const stats = existsSync(filePath) ? readFileSync(filePath).length : 0;
  return (stats / 1024).toFixed(2);
}

/**
 * Generate a manifest file with metadata about the subset
 */
function generateManifest(unicodePoints, outputDir) {
  const manifest = {
    generated: new Date().toISOString(),
    version: '1.0.0',
    glyphCount: unicodePoints.size,
    unicodeRanges: Array.from(unicodePoints)
      .sort((a, b) => a - b)
      .map(cp => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`),
  };
  
  const manifestPath = join(outputDir, 'subset-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n${colors.green}✓${colors.reset} Generated manifest: ${manifestPath}`);
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}   Nerd Font Subset Generator${colors.reset}`);
  console.log(`${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  // Check for fonttools
  if (!checkFontTools()) {
    printInstallInstructions();
    process.exit(1);
  }
  
  console.log(`${colors.green}✓${colors.reset} fonttools is installed\n`);
  
  // Extract unicode points from icon definitions
  console.log(`${colors.cyan}🔍 Extracting icon unicode points from nerdFontIcons.ts...${colors.reset}`);
  const iconUnicodePoints = extractIconUnicodePoints();
  console.log(`${colors.green}✓${colors.reset} Found ${iconUnicodePoints.size} icon definitions\n`);
  
  // Extract unicode from templates
  console.log(`${colors.cyan}🔍 Scanning segment templates for hardcoded unicode...${colors.reset}`);
  const templateUnicodePoints = extractTemplateUnicodePoints(join(rootDir, 'public/segments'));
  console.log(`${colors.green}✓${colors.reset} Found ${templateUnicodePoints.size} hardcoded unicode characters\n`);
  
  // Add powerline symbols
  console.log(`${colors.cyan}➕ Adding powerline symbols...${colors.reset}`);
  const powerlineSymbols = getPowerlineSymbols();
  console.log(`${colors.green}✓${colors.reset} Added ${powerlineSymbols.size} powerline symbols\n`);
  
  // Combine all unicode points
  const allUnicodePoints = new Set([
    ...iconUnicodePoints,
    ...templateUnicodePoints,
    ...powerlineSymbols,
  ]);
  
  console.log(`${colors.blue}📊 Total unique glyphs: ${allUnicodePoints.size}${colors.reset}\n`);
  
  // Download font if needed
  const originalFontPath = downloadNerdFont();
  const originalSize = getFileSizeKB(originalFontPath);
  console.log(`${colors.blue}ℹ${colors.reset} Original font size: ${originalSize} KB\n`);
  
  // Generate subset
  const outputDir = join(rootDir, 'public/fonts');
  const { woff2Path, ttfPath } = generateSubset(originalFontPath, allUnicodePoints, outputDir);
  
  // Generate manifest
  generateManifest(allUnicodePoints, outputDir);
  
  // Show size comparison
  const woff2Size = getFileSizeKB(woff2Path);
  const ttfSize = getFileSizeKB(ttfPath);
  const reduction = ((1 - parseFloat(woff2Size) / parseFloat(originalSize)) * 100).toFixed(1);
  
  console.log(`\n${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✓ Font subset generated successfully!${colors.reset}\n`);
  console.log(`${colors.blue}📊 Size Comparison:${colors.reset}`);
  console.log(`  Original TTF:  ${originalSize} KB`);
  console.log(`  Subset WOFF2:  ${woff2Size} KB (${colors.green}${reduction}% smaller${colors.reset})`);
  console.log(`  Subset TTF:    ${ttfSize} KB`);
  console.log(`\n${colors.cyan}📁 Output files:${colors.reset}`);
  console.log(`  ${woff2Path}`);
  console.log(`  ${ttfPath}`);
  console.log(`${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}\n`);
}

// Run the script
try {
  main();
} catch (error) {
  console.error(`\n${colors.red}✗ Font subset generation failed:${colors.reset}`, error.message);
  process.exit(1);
}
