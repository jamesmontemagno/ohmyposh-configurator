#!/usr/bin/env node

/**
 * Icon Validation Script
 * 
 * Validates that all icon references in segment JSON files and configs
 * use valid icon IDs from nerdFontIcons.ts
 * 
 * Usage: node scripts/validate-icons.js
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let hasErrors = false;
let warningCount = 0;

/**
 * Extract valid icon IDs from nerdFontIcons.ts
 */
function extractValidIconIds() {
  const iconFilePath = join(rootDir, 'src/constants/nerdFontIcons.ts');
  const content = readFileSync(iconFilePath, 'utf-8');
  
  const iconIds = new Set();
  const unicodeMap = new Map(); // Map unicode chars to icon IDs
  
  // Match icon definitions like: 'icon-id': { ... char: '\uf067', ... }
  const iconRegex = /'([^']+)':\s*\{[^}]*char:\s*'([^']+)'[^}]*\}/g;
  let match;
  
  while ((match = iconRegex.exec(content)) !== null) {
    const [, iconId, unicodeChar] = match;
    iconIds.add(iconId);
    unicodeMap.set(unicodeChar, iconId);
  }
  
  return { iconIds, unicodeMap };
}

/**
 * Extract powerline symbols that are allowed
 */
function getPowerlineSymbols() {
  return new Set([
    '\ue0b0', // Right-pointing triangle
    '\ue0b2', // Leading diamond
    '\ue0b4', // Trailing diamond
    '\ue0b6', // Alternative diamond
  ]);
}

/**
 * Find all hardcoded unicode characters in a string
 */
function findHardcodedUnicode(text, filePath) {
  const unicodeRegex = /\\u[0-9a-fA-F]{4}/g;
  const matches = [];
  let match;
  
  while ((match = unicodeRegex.exec(text)) !== null) {
    matches.push({
      unicode: match[0],
      char: String.fromCharCode(parseInt(match[0].slice(2), 16)),
      position: match.index,
    });
  }
  
  return matches;
}

/**
 * Validate a single JSON file
 */
function validateJsonFile(filePath, validIconIds, unicodeMap, powerlineSymbols) {
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to read ${filePath}: ${error.message}`);
    hasErrors = true;
    return;
  }
  
  let data;
  try {
    data = JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Invalid JSON in ${filePath}: ${error.message}`);
    hasErrors = true;
    return;
  }
  
  const fileErrors = [];
  const fileWarnings = [];
  
  // Check if it's a segment metadata file (has array of segments)
  if (Array.isArray(data)) {
    data.forEach((segment, index) => {
      // Check icon field
      if (segment.icon && !validIconIds.has(segment.icon)) {
        fileErrors.push(`  Segment[${index}] "${segment.name || segment.type}": Invalid icon ID "${segment.icon}"`);
      }
      
      // Check for hardcoded unicode in defaultTemplate
      if (segment.defaultTemplate) {
        const hardcodedUnicode = findHardcodedUnicode(segment.defaultTemplate, filePath);
        hardcodedUnicode.forEach(({ unicode, char }) => {
          if (!powerlineSymbols.has(char) && !unicodeMap.has(char)) {
            fileWarnings.push(`  Segment[${index}] "${segment.name || segment.type}": Hardcoded unicode ${unicode} (${char}) in template - consider using NerdIcon component`);
          }
        });
      }
    });
  }
  // Check if it's a config file (has blocks)
  else if (data.blocks && Array.isArray(data.blocks)) {
    data.blocks.forEach((block, blockIndex) => {
      if (block.segments && Array.isArray(block.segments)) {
        block.segments.forEach((segment, segIndex) => {
          // Check for hardcoded unicode in templates
          if (segment.template) {
            const hardcodedUnicode = findHardcodedUnicode(segment.template, filePath);
            hardcodedUnicode.forEach(({ unicode, char }) => {
              if (!powerlineSymbols.has(char) && !unicodeMap.has(char)) {
                fileWarnings.push(`  Block[${blockIndex}] Segment[${segIndex}] "${segment.type}": Hardcoded unicode ${unicode} (${char}) in template`);
              }
            });
          }
        });
      }
    });
  }
  
  // Report errors
  if (fileErrors.length > 0) {
    console.error(`\n${colors.red}✗${colors.reset} ${filePath}:`);
    fileErrors.forEach(error => console.error(`  ${colors.red}${error}${colors.reset}`));
    hasErrors = true;
  }
  
  // Report warnings
  if (fileWarnings.length > 0) {
    console.warn(`\n${colors.yellow}⚠${colors.reset} ${filePath}:`);
    fileWarnings.forEach(warning => console.warn(`  ${colors.yellow}${warning}${colors.reset}`));
    warningCount += fileWarnings.length;
  }
  
  // Report success
  if (fileErrors.length === 0 && fileWarnings.length === 0) {
    console.log(`${colors.green}✓${colors.reset} ${filePath}`);
  }
}

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir, fileList = []) {
  const files = readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = join(dir, file.name);
    
    if (file.isDirectory()) {
      findJsonFiles(fullPath, fileList);
    } else if (file.name.endsWith('.json') && file.name !== 'package.json' && file.name !== 'tsconfig.json') {
      fileList.push(fullPath);
    }
  });
  
  return fileList;
}

/**
 * Main validation function
 */
function main() {
  console.log(`${colors.cyan}🔍 Validating icon references...${colors.reset}\n`);
  
  // Extract valid icon IDs from nerdFontIcons.ts
  const { iconIds: validIconIds, unicodeMap } = extractValidIconIds();
  const powerlineSymbols = getPowerlineSymbols();
  
  console.log(`${colors.blue}ℹ${colors.reset} Found ${validIconIds.size} valid icon IDs in nerdFontIcons.ts\n`);
  
  // Find all JSON files to validate
  const segmentFiles = findJsonFiles(join(rootDir, 'public/segments'));
  const configFiles = findJsonFiles(join(rootDir, 'public/configs'));
  
  const allFiles = [...segmentFiles, ...configFiles];
  
  console.log(`${colors.blue}ℹ${colors.reset} Validating ${allFiles.length} JSON files...\n`);
  
  // Validate each file
  allFiles.forEach(file => {
    validateJsonFile(file, validIconIds, unicodeMap, powerlineSymbols);
  });
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  if (hasErrors) {
    console.error(`${colors.red}✗ Validation failed with errors${colors.reset}`);
    process.exit(1);
  } else if (warningCount > 0) {
    console.warn(`${colors.yellow}⚠ Validation completed with ${warningCount} warning(s)${colors.reset}`);
    console.log(`${colors.cyan}ℹ Consider using icon IDs from nerdFontIcons.ts instead of hardcoded unicode${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.green}✓ All icons validated successfully!${colors.reset}`);
    process.exit(0);
  }
}

// Run validation
main();
