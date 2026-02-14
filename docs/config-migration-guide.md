# Configuration File Migration Guide

## Overview

As of December 30, 2025, the Oh My Posh Configurator 5000 has updated its configuration file structure to separate metadata from the actual Oh My Posh configuration. This guide will help you migrate your existing configurations to the new format.

## What Changed?

### Before (Old Format)
Configuration files contained both metadata and the Oh My Posh config wrapped together:

```json
{
  "id": "my-theme",
  "name": "My Theme",
  "description": "A cool theme",
  "icon": "Star",
  "author": "Your Name",
  "tags": ["minimal", "developer"],
  "config": {
    "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
    "version": 2,
    "blocks": [...]
  }
}
```

### After (New Format)

**Config File** (`my-theme.json`): Contains **ONLY** the Oh My Posh configuration
```json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "version": 3,
  "blocks": [...]
}
```

**Manifest File** (`manifest.json`): Contains all metadata
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-30",
  "configs": [
    {
      "id": "my-theme",
      "name": "My Theme",
      "description": "A cool theme",
      "icon": "misc-star",
      "author": "Your Name",
      "tags": ["minimal", "developer"],
      "file": "my-theme.json"
    }
  ]
}
```

## Why This Change?

1. **Cleaner Separation**: Config files are now pure Oh My Posh configurations that can be used directly
2. **Better Organization**: Metadata is centralized in manifest files
3. **Easier Maintenance**: Updating metadata doesn't require editing the config structure
4. **Direct Compatibility**: Config files can be directly imported/exported to/from Oh My Posh

## Migration Steps

### Step 1: Extract the Config

From your old config file, take only the content inside the `config` property:

```json
// OLD: my-theme.json
{
  "id": "my-theme",
  "name": "My Theme",
  // ... other metadata
  "config": {
    // THIS PART ONLY ↓
    "$schema": "...",
    "version": 2,
    "blocks": [...]
  }
}
```

### Step 2: Update Config File

Replace the entire file content with just the config:

```json
// NEW: my-theme.json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "version": 3,
  "blocks": [...]
}
```

### Step 3: Update Manifest

Add or update the entry in `manifest.json`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-30",
  "configs": [
    {
      "id": "my-theme",
      "name": "My Theme",
      "description": "A cool theme",
      "icon": "misc-star",
      "author": "Your Name",
      "tags": ["minimal", "developer"],
      "file": "my-theme.json"
    }
  ]
}
```

### Step 4: Validate

Run the validation script to ensure everything is correct:

```bash
npm run validate
```

## Automated Migration Script

If you have multiple config files to migrate, you can use this Node.js script:

```javascript
const fs = require('fs');
const path = require('path');

function migrateConfig(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Extract metadata for manifest
  const metadata = {
    id: content.id,
    name: content.name,
    description: content.description,
    icon: content.icon,
    author: content.author,
    tags: content.tags,
    file: path.basename(filePath)
  };
  
  // Extract pure config
  const config = content.config;
  
  // Write new config file
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
  
  return metadata;
}

// Usage:
// const metadata = migrateConfig('./my-theme.json');
// Then add metadata to manifest.json manually or programmatically
```

## Validation

After migration, your config files should:

- ✅ Start with `$schema` field
- ✅ Contain `blocks` array with segments
- ✅ NOT contain `id`, `name`, `description`, `author`, or `tags` fields
- ✅ Be valid JSON
- ✅ Match the Oh My Posh schema

Run validation:
```bash
npm run validate
```

## Troubleshooting

### Error: "missing required Oh My Posh config field"
Your config file is missing essential Oh My Posh fields. Make sure it includes `$schema` and `blocks`.

### Error: "unexpected field in config"
If you see warnings about `id`, `name`, etc., these fields need to be moved to `manifest.json`.

### Error: "file referenced in manifest but not found"
Make sure the `file` field in your manifest entry exactly matches your config filename.

## Need Help?

- Check [CONTRIBUTING.md](../CONTRIBUTING.md) for the latest structure
- Review [examples in the samples folder](../public/configs/samples/)
- Open a [GitHub Discussion](https://github.com/jamesmontemagno/ohmyposh-configurator/discussions) if you need assistance

## Summary

The new structure provides cleaner separation between configuration and metadata:

- **Config files** = Pure Oh My Posh configuration (ready to use anywhere)
- **Manifest files** = Metadata for the configurator UI

This makes configs more portable and easier to manage! 🎨✨
