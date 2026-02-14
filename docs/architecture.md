# Oh My Posh Configurator 5000 - Architecture Documentation

## Overview

The Oh My Posh Configurator 5000 is a modern React application that provides a visual interface for creating and customizing Oh My Posh terminal prompt configurations. The application runs entirely client-side with no backend dependencies.

## Core Architecture

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript for type safety
- **Build Tool**: Vite 6.4 for fast development and optimized production builds
- **Styling**: Tailwind CSS 4.1 for utility-first styling
- **State Management**: Zustand with localStorage persistence
- **Drag & Drop**: @dnd-kit for intuitive segment arrangement
- **Icons**: Custom Nerd Font icon library (200+ icons) with unique IDs
- **Config Formats**: Support for JSON, YAML, and TOML via js-yaml and @iarna/toml

### Data Flow Architecture

```
┌─────────────────┐
│  SegmentPicker  │  ← Browse & select segments by category
└────────┬────────┘
         │ (drag segment)
         ↓
┌─────────────────┐
│     Canvas      │  ← Arrange blocks and segments
└────────┬────────┘
         │ (select segment)
         ↓
┌─────────────────┐
│ PropertiesPanel │  ← Edit colors, templates, properties, options
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  configStore    │  ← Central state with Zustand
│  (Zustand)      │     - Auto-saves to localStorage
└────────┬────────┘     - Manages all config mutations
         │
         ↓
┌─────────────────┐
│  PreviewPanel   │  ← Live preview of prompt
└─────────────────┘
```

## Key Design Patterns

### 1. Centralized State Management

**Location**: `src/store/configStore.ts`

All configuration state is managed through a single Zustand store that:
- Maintains the current Oh My Posh configuration
- Provides actions for adding, updating, and removing blocks/segments
- Persists state to localStorage automatically
- Uses `generateId()` for creating unique IDs for blocks and segments

**Key Actions**:
- `addBlock()` - Add a new prompt block
- `addSegment()` - Add a segment to a block
- `updateSegment()` - Update segment properties
- `removeSegment()` - Remove a segment from a block
- `reorderSegments()` - Reorder segments within or across blocks
- `loadConfig()` - Load a configuration from JSON/YAML/TOML
- `clearConfig()` - Reset to empty configuration

### 2. Dynamic Segment Loading

**Location**: `src/utils/segmentLoader.ts`

Segments are loaded dynamically from JSON files to improve performance:

```typescript
// Load specific category
const systemSegments = await loadSegmentCategory('system');

// Load all segments
const allSegments = await loadAllSegments();

// Get cached segment metadata
const gitMetadata = getSegmentMetadata('git');
```

**Benefits**:
- Reduced initial bundle size (~19KB saved)
- Easier maintenance (edit JSON, not TypeScript)
- Better organization (8 category files)
- On-demand loading with caching

**Categories**:
1. `system.json` - 14 segments (path, battery, time, etc.)
2. `scm.json` - 8 segments (git, svn, mercurial, etc.)
3. `languages.json` - 26 segments (node, python, go, rust, etc.)
4. `cloud.json` - 12 segments (aws, azure, gcp, kubernetes, etc.)
5. `cli.json` - 30 segments (npm, docker, kubectl, etc.)
6. `web.json` - 7 segments (spotify, ip, weather, etc.)
7. `music.json` - 3 segments (spotify, ytm, lastfm)
8. `health.json` - 3 segments (nightscout, strava, withings)

### 3. Segment Metadata Structure

Each segment includes comprehensive metadata:

```typescript
interface SegmentMetadata {
  type: string;              // Oh My Posh segment type
  name: string;              // Display name in UI
  description: string;       // Brief description
  icon: string;              // Nerd Font icon ID
  defaultTemplate: string;   // Default template string
  
  // Template variables (red in UI)
  properties?: Array<{
    name: string;            // e.g., ".Full", ".Path"
    type: string;            // Data type
    description: string;     // What it represents
  }>;
  
  // Configuration options (green in UI)
  options?: Array<{
    name: string;            // e.g., "home_enabled"
    type: string;            // boolean, string, enum, etc.
    default?: any;           // Default value
    values?: string[];       // For enum types
    description: string;     // What it does
  }>;
}
```

**Properties vs Options**:
- **Properties**: Template variables like `{{ .Full }}` that users can use in templates
- **Options**: Configuration settings like `home_enabled` that control segment behavior

### 4. Configuration Structure

Configurations are stored in two parts:

#### Config Files (Pure Oh My Posh)
**Location**: `public/configs/samples/` and `public/configs/community/`

Contains ONLY Oh My Posh configuration:
```json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "version": 3,
  "final_space": true,
  "blocks": [...]
}
```

#### Manifest Files (Metadata)
**Location**: `public/configs/samples/manifest.json` and `public/configs/community/manifest.json`

Contains configuration metadata:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-30",
  "configs": [
    {
      "id": "my-theme",
      "name": "My Theme",
      "description": "Brief description",
      "icon": "misc-star",
      "author": "Author Name",
      "tags": ["minimal", "developer"],
      "file": "my-theme.json"
    }
  ]
}
```

**Benefits**:
- Config files can be used directly with Oh My Posh
- Metadata centralized and easy to update
- No duplication of information
- Direct import/export compatibility

### 5. Export System

**Location**: `src/utils/configExporter.ts`

Exports configurations in multiple formats:

```typescript
export function exportConfig(
  config: OhMyPoshConfig,
  format: 'json' | 'yaml' | 'toml'
): string
```

**Features**:
- Strips internal `id` fields before export
- Escapes Unicode characters as `\uXXXX` in JSON
- Validates configuration structure
- Supports all Oh My Posh fields

### 6. Color Scheme System

**Location**: `src/data/colorSchemes.ts`

Provides intelligent default colors:

```typescript
// Category-based defaults
const categoryColors = {
  system: { fg: '#ffffff', bg: '#91B3FA' },
  scm: { fg: '#ffffff', bg: '#F1502F' },
  languages: { fg: '#ffffff', bg: '#42E66C' },
  // ... etc
};

// Per-segment overrides
const segmentColorOverrides = {
  git: { fg: '#000000', bg: '#FD9353' },
  path: { fg: '#ffffff', bg: '#6988E8' },
  // ... etc
};
```

## Component Architecture

### Main Components

1. **SegmentPicker** (`src/components/SegmentPicker/`)
   - Displays segment categories
   - Shows available segments with icons and descriptions
   - Supports drag-and-drop to Canvas
   - Click to add segment to current block

2. **Canvas** (`src/components/Canvas/`)
   - Visual representation of prompt blocks
   - Drag-and-drop reordering within and across blocks
   - Block alignment control (left, right)
   - Empty block dropzones

3. **PropertiesPanel** (`src/components/PropertiesPanel/`)
   - Edit segment colors (foreground, background)
   - Edit template strings
   - View available properties (template variables)
   - View available options (configuration settings)
   - Style selection (powerline, diamond, plain)

4. **PreviewPanel** (`src/components/PreviewPanel/`)
   - Live preview of the prompt
   - Sample data for realistic rendering
   - Powerline/diamond character support
   - Toggle dark/light background

5. **ExportBar** (`src/components/ExportBar/`)
   - Export to JSON, YAML, or TOML
   - Import existing configurations
   - Clear/reset configuration
   - Access to samples and community configs

6. **Header** (`src/components/Header/`)
   - Branding and navigation
   - Share button for submitting to community
   - Links to documentation

7. **SamplePicker** (`src/components/SamplePicker/`)
   - Browse sample configurations
   - Browse community configurations
   - Preview and load configs

8. **SubmitConfigDialog** (`src/components/SubmitConfigDialog/`)
   - Share configuration with community
   - Generate PR-ready JSON
   - Collect metadata (name, description, author, tags)

### Custom Components

- **NerdIcon** (`src/components/NerdIcon.tsx`)
  - Unified icon component
  - Supports 200+ custom Nerd Font icons mapped by unique ID
  - Automatic fallback handling

## Build and Deployment

### Development
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run lint         # Run ESLint
npm run validate     # Validate config files
```

### Production
```bash
npm run build        # TypeScript check + Vite build
```

**Output**: `dist/` directory with optimized static files

### Deployment
- Hosted on GitHub Pages at `/ohmyposh-configurator/`
- Automatic deployment via GitHub Actions
- Base path configured in `vite.config.ts`

## Validation System

**Location**: `scripts/validate-configs.js`

Validates all configuration files:

✅ **Checks**:
- Valid JSON syntax
- Required Oh My Posh fields (`$schema`, `blocks`)
- Proper segment structure with `type` fields
- Manifest structure and required metadata
- No duplicate IDs
- File references exist
- Pure Oh My Posh config (no metadata wrapper)

**Usage**:
```bash
npm run validate
```

Runs automatically on PRs via GitHub Actions.

## Icon System

**Location**: `src/constants/nerdFontIcons.ts`

- 200+ custom mapped Nerd Font characters
- Organized into 20 categories
- Searchable with semantic aliases
- Full documentation in `docs/nerd-font-icons-reference.md`

**Categories**:
- UI Controls (13 icons)
- Actions (9 icons)
- Programming Languages (20 icons)
- Cloud & DevOps (6 icons)
- Frameworks (13 icons)
- Databases (8 icons)
- And 14 more categories...

## SEO and Meta Tags

The application includes comprehensive SEO optimization:

- ✅ Structured data (JSON-LD) for search engines
- ✅ Open Graph tags for social media
- ✅ Twitter Card support
- ✅ PWA manifest
- ✅ Sitemap and robots.txt
- ✅ Semantic HTML

## Security Considerations

- **Client-Side Only**: No data sent to servers
- **LocalStorage**: Configurations stored locally in browser
- **No External Dependencies**: All assets bundled or from CDN
- **XSS Prevention**: React's built-in XSS protection
- **CORS**: Not applicable (no API calls)

## Performance Optimizations

1. **Code Splitting**: Vite automatically splits chunks
2. **Lazy Loading**: Segments loaded on-demand
3. **Caching**: Segment metadata cached after first load
4. **Tree Shaking**: Unused code removed in production
5. **Minification**: JavaScript and CSS minified
6. **Asset Optimization**: Images and fonts optimized

## Testing and Quality

### Validation
- Configuration files validated before commit
- TypeScript strict mode for type safety
- ESLint for code quality

### Future Testing
- Unit tests for utilities (exporters, loaders)
- Integration tests for state management
- E2E tests for critical user flows

## Contributing Workflow

1. **Fork Repository**: Create personal fork
2. **Local Development**: Run `npm install` and `npm run dev`
3. **Make Changes**: 
   - Code changes in `src/`
   - Segment additions in `public/segments/`
   - Config contributions in `public/configs/community/`
4. **Validate**: Run `npm run validate` and `npm run lint`
5. **Submit PR**: Create pull request with description
6. **CI Validation**: Automated checks run on PR
7. **Review**: Maintainers review and merge

## Documentation Structure

- `README.md` - User-facing overview and getting started
- `CONTRIBUTING.md` - Contribution guidelines
- `docs/architecture.md` - This file (technical overview)
- `docs/config-structure-update-summary.md` - Config format changes
- `docs/segment-json-migration.md` - Segment refactoring details
- `docs/config-migration-guide.md` - Migration guide for old configs
- `docs/quick-reference.md` - Quick reference for contributors
- `docs/nerd-font-icons-reference.md` - Icon documentation
- `public/segments/README.md` - Segment addition guide
- `scripts/README.md` - Scripts and validation documentation

## Future Enhancements

Potential areas for expansion:

1. **Segment Features**:
   - Add remaining segment types from Oh My Posh
   - Include more detailed options for existing segments
   - Add segment preview with real data

2. **UI Improvements**:
   - Theme customization (dark/light mode)
   - Keyboard shortcuts
   - Undo/redo functionality
   - Segment search and filtering

3. **Export Enhancements**:
   - Direct integration with Oh My Posh CLI
   - Export as image/screenshot
   - Share links (URL-based config sharing)

4. **Community Features**:
   - Voting/rating system for community configs
   - Comments and discussions
   - Featured themes carousel

5. **Testing**:
   - Comprehensive unit test coverage
   - E2E testing with Playwright or Cypress
   - Visual regression testing

## Troubleshooting

### Common Issues

**Segment not displaying**:
- Check segment JSON syntax
- Verify icon ID is valid Nerd Font icon ID
- Ensure segment type matches Oh My Posh documentation

**Export fails**:
- Validate configuration structure
- Check for missing required fields
- Ensure segments have valid `type` field

**Validation errors**:
- Run `npm run validate` for detailed errors
- Check config file structure (no metadata wrapper)
- Verify manifest entries have all required fields

## Resources

- [Oh My Posh Documentation](https://ohmyposh.dev/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Nerd Fonts](https://www.nerdfonts.com/)

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Maintainers**: James Montemagno and contributors
