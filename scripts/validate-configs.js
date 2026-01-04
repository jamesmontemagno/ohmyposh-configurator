#!/usr/bin/env node

/**
 * Validation script for Oh My Posh Configurator config files
 * Validates manifest.json and individual config files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIGS_DIR = path.join(__dirname, '../public/configs');
const CATEGORIES = ['samples', 'community'];

// Required fields for manifest entries
const MANIFEST_REQUIRED_FIELDS = ['id', 'name', 'description', 'icon', 'author', 'tags', 'file'];

// Required fields for Oh My Posh config files (no metadata wrapper)
const OMP_CONFIG_REQUIRED_FIELDS = ['$schema', 'blocks'];

let errors = [];
let warnings = [];

function log(message, type = 'info') {
  const prefix = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✗'
  }[type];
  console.log(`${prefix} ${message}`);
}

function addError(message) {
  errors.push(message);
  log(message, 'error');
}

function addWarning(message) {
  warnings.push(message);
  log(message, 'warning');
}

function validateJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    addError(`Invalid JSON in ${filePath}: ${error.message}`);
    return null;
  }
}

function validateManifest(category, manifestPath) {
  log(`Validating ${category}/manifest.json...`);
  
  const manifest = validateJSON(manifestPath);
  if (!manifest) return [];

  // Check required manifest structure
  if (!manifest.version) {
    addError(`${category}/manifest.json missing 'version' field`);
  }
  
  if (!manifest.configs || !Array.isArray(manifest.configs)) {
    addError(`${category}/manifest.json missing or invalid 'configs' array`);
    return [];
  }

  const configIds = new Set();
  const configFiles = new Set();

  // Validate each config entry
  manifest.configs.forEach((config, index) => {
    const prefix = `${category}/manifest.json entry ${index}`;

    // Check required fields
    MANIFEST_REQUIRED_FIELDS.forEach(field => {
      if (!config[field]) {
        addError(`${prefix}: missing required field '${field}'`);
      }
    });

    // Check for duplicate IDs
    if (config.id) {
      if (configIds.has(config.id)) {
        addError(`${prefix}: duplicate ID '${config.id}'`);
      }
      configIds.add(config.id);
    }

    // Check tags is an array
    if (config.tags && !Array.isArray(config.tags)) {
      addError(`${prefix}: 'tags' must be an array`);
    }

    // Track files to validate
    if (config.file) {
      configFiles.add(config.file);
    }
  });

  log(`Found ${manifest.configs.length} configs in ${category}/manifest.json`, 'success');
  return Array.from(configFiles);
}

/**
 * Validate palette references in a config
 * Checks that all p:name references exist in the palette
 */
function validatePaletteReferences(config, prefix) {
  const palette = config.palette || {};
  const paletteKeys = new Set(Object.keys(palette));
  const missingRefs = new Set();

  // Helper to check a color value
  function checkColorRef(value, location) {
    if (typeof value === 'string' && value.startsWith('p:')) {
      const refName = value.slice(2); // Remove 'p:' prefix
      if (!paletteKeys.has(refName)) {
        missingRefs.add(`${location}: '${value}' not found in palette`);
      }
    }
  }

  // Helper to check an object with foreground/background properties
  function checkColorObject(obj, location) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.foreground) checkColorRef(obj.foreground, `${location} foreground`);
    if (obj.background) checkColorRef(obj.background, `${location} background`);
    if (obj.foreground_templates) {
      obj.foreground_templates.forEach((tpl, i) => {
        checkColorRef(tpl, `${location} foreground_templates[${i}]`);
      });
    }
    if (obj.background_templates) {
      obj.background_templates.forEach((tpl, i) => {
        checkColorRef(tpl, `${location} background_templates[${i}]`);
      });
    }
  }

  // Check global settings that can have colors
  const globalColorSettings = [
    'transient_prompt',
    'secondary_prompt', 
    'debug_prompt',
    'valid_line',
    'error_line',
    'osc99',
    'tooltip'
  ];
  
  globalColorSettings.forEach(setting => {
    if (config[setting]) {
      checkColorObject(config[setting], setting);
    }
  });

  // Check all segments for color references
  if (config.blocks && Array.isArray(config.blocks)) {
    config.blocks.forEach((block, blockIndex) => {
      if (block.segments && Array.isArray(block.segments)) {
        block.segments.forEach((segment, segmentIndex) => {
          const loc = `block ${blockIndex}, segment ${segmentIndex} (${segment.type || 'unknown'})`;
          checkColorObject(segment, loc);
        });
      }
    });
  }

  // Report missing palette references as errors
  missingRefs.forEach(msg => {
    addError(`${prefix}: palette reference ${msg}`);
  });

  // Info about palette usage
  if (paletteKeys.size > 0) {
    log(`  Using palette with ${paletteKeys.size} color definitions`, 'info');
  } else {
    // Count how many hardcoded colors are used
    let hardcodedColorCount = 0;
    const colorPattern = /^#[0-9A-Fa-f]{3,8}$/;
    
    function countColors(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (obj.foreground && colorPattern.test(obj.foreground)) hardcodedColorCount++;
      if (obj.background && colorPattern.test(obj.background)) hardcodedColorCount++;
    }
    
    if (config.blocks && Array.isArray(config.blocks)) {
      config.blocks.forEach(block => {
        if (block.segments && Array.isArray(block.segments)) {
          block.segments.forEach(segment => countColors(segment));
        }
      });
    }
    
    if (hardcodedColorCount > 0) {
      addWarning(`${prefix}: consider using a palette for easier color management (found ${hardcodedColorCount} hardcoded colors)`);
    }
  }
}

function validateConfigFile(category, fileName) {
  const filePath = path.join(CONFIGS_DIR, category, fileName);
  log(`Validating ${category}/${fileName}...`);

  if (!fs.existsSync(filePath)) {
    addError(`${category}/${fileName}: file referenced in manifest but not found`);
    return;
  }

  const config = validateJSON(filePath);
  if (!config) return;

  const prefix = `${category}/${fileName}`;

  // Config files now contain only the Oh My Posh configuration (no metadata wrapper)
  // Validate required Oh My Posh config fields
  OMP_CONFIG_REQUIRED_FIELDS.forEach(field => {
    if (!config[field]) {
      addError(`${prefix}: missing required Oh My Posh config field '${field}'`);
    }
  });

  // Validate $schema
  if (config.$schema && !config.$schema.includes('oh-my-posh')) {
    addWarning(`${prefix}: $schema doesn't appear to be for Oh My Posh`);
  }

  // Validate blocks structure
  if (config.blocks) {
    if (!Array.isArray(config.blocks)) {
      addError(`${prefix}: blocks must be an array`);
    } else {
      config.blocks.forEach((block, blockIndex) => {
        if (!block.type) {
          addError(`${prefix}: block ${blockIndex} missing 'type' field`);
        }
        if (!block.segments || !Array.isArray(block.segments)) {
          addError(`${prefix}: block ${blockIndex} missing or invalid 'segments' array`);
        } else if (block.segments.length === 0) {
          addWarning(`${prefix}: block ${blockIndex} has no segments`);
        } else {
          // Validate each segment has required fields
          block.segments.forEach((segment, segmentIndex) => {
            if (!segment.type) {
              addError(`${prefix}: block ${blockIndex}, segment ${segmentIndex} missing 'type' field`);
            }
          });
        }
      });
    }
  }

  // Validate palette references (version 2+ configs can use palette)
  if (config.version >= 2) {
    validatePaletteReferences(config, prefix);
  }

  log(`${category}/${fileName} validated`, 'success');
}

function validateCategory(category) {
  log(`\n📁 Validating ${category} category...`, 'info');
  
  const categoryPath = path.join(CONFIGS_DIR, category);
  const manifestPath = path.join(categoryPath, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    addError(`${category}/manifest.json not found`);
    return;
  }

  // Validate manifest and get list of config files
  const configFiles = validateManifest(category, manifestPath);

  // Validate each config file
  configFiles.forEach(fileName => {
    validateConfigFile(category, fileName);
  });

  // Check for orphaned files (files not in manifest)
  const actualFiles = fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.json') && f !== 'manifest.json');
  
  actualFiles.forEach(file => {
    if (!configFiles.includes(file)) {
      addWarning(`${category}/${file}: file exists but not referenced in manifest`);
    }
  });
}

function main() {
  console.log('\n🔍 Oh My Posh Configurator - Config Validation\n');
  console.log('='.repeat(50));

  // Check configs directory exists
  if (!fs.existsSync(CONFIGS_DIR)) {
    addError(`Configs directory not found: ${CONFIGS_DIR}`);
    process.exit(1);
  }

  // Validate each category
  CATEGORIES.forEach(category => {
    const categoryPath = path.join(CONFIGS_DIR, category);
    if (fs.existsSync(categoryPath)) {
      validateCategory(category);
    } else {
      addError(`Category directory not found: ${category}`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Validation Summary:\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    log('All validations passed! ✨', 'success');
    process.exit(0);
  } else {
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} warning(s)`);
    }
    if (errors.length > 0) {
      console.log(`✗ ${errors.length} error(s)`);
      console.log('\nValidation failed. Please fix the errors above.');
      process.exit(1);
    } else {
      log('Validation passed with warnings', 'success');
      process.exit(0);
    }
  }
}

main();
