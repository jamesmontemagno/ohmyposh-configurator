# Segments Structure

This directory contains segment metadata organized by category for the Oh My Posh configurator.

## Organization

Segments are split into separate JSON files by category:

- `system.json` - System-related segments (path, os, battery, etc.)
- `scm.json` - Source control management (git, svn, etc.)
- `languages.json` - Programming language segments (node, python, go, etc.)
- `cloud.json` - Cloud provider and infrastructure segments (aws, azure, gcp, etc.)
- `cli.json` - CLI tool segments (kubectl, docker, terraform, etc.)
- `web.json` - Web-related segments (spotify, wakatime, etc.)
- `music.json` - Music player segments
- `health.json` - Health and fitness tracker segments

## JSON Structure

Each segment in the JSON files has the following structure:

```json
{
  "type": "segment-type",
  "name": "Display Name",
  "description": "Brief description of what this segment does",
  "icon": "lang-python",
  "defaultTemplate": " {{ .TemplateProperty }} ",
  "properties": [
    {
      "name": ".TemplateProperty",
      "type": "string",
      "description": "Description of this template variable"
    }
  ],
  "options": [
    {
      "name": "option_name",
      "type": "boolean",
      "default": true,
      "description": "Description of this configuration option"
    }
  ]
}
```

### Field Descriptions

- **type**: The Oh My Posh segment type (must match official segment types)
- **name**: Human-readable display name shown in the UI
- **description**: Brief explanation of what the segment does
- **icon**: [Nerd Font icon ID](../../docs/nerd-font-icons-reference.md) for visual representation
- **defaultTemplate**: Default template string using Oh My Posh template syntax
- **properties** (optional): Array of template variables available for use in `{{ }}` templates
  - Shows users what data they can display in their templates
  - Displayed in the PropertiesPanel with a red color scheme
- **options** (optional): Array of configuration settings for the segment
  - Controls segment behavior (e.g., `home_enabled`, `fetch_version`)
  - Displayed in the PropertiesPanel with a green color scheme
  - Can include `type` (boolean, string, enum), `default` value, and `values` for enums

## Adding New Segments

To add a new segment:

1. Determine which category it belongs to (system, scm, languages, cloud, cli, web, music, health)
2. Open the appropriate JSON file (e.g., `languages.json`)
3. Add your segment object to the array with all required fields
4. Add `properties` array listing all template variables available in Oh My Posh
5. Add `options` array listing all configuration settings from Oh My Posh documentation
6. Keep segments alphabetized by name within each file
7. Use a [Nerd Font icon ID](../../docs/nerd-font-icons-reference.md) for the `icon` field
8. Test in the configurator to verify proper display and functionality

### Example

Here's a complete example with properties and options:

```json
{
  "type": "python",
  "name": "Python",
  "description": "Displays the current Python version",
  "icon": "lang-python",
  "defaultTemplate": " {{ .Full }} ",
  "properties": [
    {
      "name": ".Full",
      "type": "string",
      "description": "The full Python version"
    },
    {
      "name": ".Major",
      "type": "string",
      "description": "Major version number"
    },
    {
      "name": ".Minor",
      "type": "string",
      "description": "Minor version number"
    },
    {
      "name": ".Venv",
      "type": "string",
      "description": "Virtual environment name"
    }
  ],
  "options": [
    {
      "name": "home_enabled",
      "type": "boolean",
      "default": false,
      "description": "Display segment in the HOME directory"
    },
    {
      "name": "fetch_version",
      "type": "boolean",
      "default": true,
      "description": "Fetch the Python version"
    },
    {
      "name": "fetch_virtual_env",
      "type": "boolean",
      "default": true,
      "description": "Fetch virtual environment name"
    },
    {
      "name": "display_mode",
      "type": "enum",
      "default": "context",
      "values": ["always", "files", "context", "environment"],
      "description": "When to display this segment"
    }
  ]
}
```

## Dynamic Loading

Segments are loaded on-demand using the `segmentLoader.ts` utility. This:

- Reduces initial bundle size
- Improves maintainability
- Makes it easier to add/modify segments
- Allows for category-based lazy loading

## Color Schemes

Default colors are applied automatically based on the segment type and category using the `colorSchemes.ts` file. You don't need to specify colors in the JSON files.

## Validation

Before adding or modifying segments, ensure they match the Oh My Posh segment schema. The segments should be valid according to the [Oh My Posh documentation](https://ohmyposh.dev/docs/segments).
