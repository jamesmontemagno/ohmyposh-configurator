# Copilot Instructions for Oh My Posh Configurator

## Project Overview

Visual configurator for Oh My Posh terminal prompts. React 19 + TypeScript + Vite app with drag-and-drop interface. Runs 100% client-side, hosted on GitHub Pages at `/ohmyposh-configurator/`.

## Architecture

### Core Data Flow
```
SegmentPicker → Canvas → PropertiesPanel
       ↓           ↓            ↓
    (drag)     (blocks)    (edit segment)
              ↘    ↓    ↙
           configStore (Zustand)
                  ↓
             PreviewPanel
```

### Key Patterns

**State Management**: Two Zustand stores with persistence:
- [src/store/configStore.ts](src/store/configStore.ts) - Main config state with blocks, segments, tooltips, and global settings. Use `generateId()` for new blocks/segments/tooltips.
- [src/store/advancedFeaturesStore.ts](src/store/advancedFeaturesStore.ts) - Advanced feature toggles for progressive disclosure. Controls visibility of advanced UI controls across the app.

**Segment Metadata**: Stored as JSON in [public/segments/](public/segments/) by category (system, scm, languages, cloud, cli, web, music, health). Each segment defines `type`, `name`, `icon`, `defaultTemplate`, `properties`, `options`, and optionally `defaultCache`. Loaded dynamically via [src/utils/segmentLoader.ts](src/utils/segmentLoader.ts).

**Default Cache Settings**: Segment metadata includes optional `defaultCache` field with `duration` and `strategy`. When adding segments, these defaults are auto-applied. See Cache Strategy Guide in `public/segments/README.md`.

**Color Schemes**: Default colors in [src/data/colorSchemes.ts](src/data/colorSchemes.ts) - category-based with per-segment overrides. New segments inherit from category unless specified in `segmentColorOverrides`.

**Export/Import**: [src/utils/configExporter.ts](src/utils/configExporter.ts) strips internal `id` fields before export. Supports JSON/YAML/TOML. Unicode chars escaped as `\uXXXX` in JSON. Import automatically detects and enables advanced features when `autoDetectOnImport` is enabled.

## Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite build
npm run validate     # Validate configs in public/configs/
npm run lint         # ESLint check
```

## Code Conventions

### Components
- Located in [src/components/](src/components/), each major component has its own folder with `index.ts` re-export
- Use `NerdIcon` component for all icons (uses custom Nerd Font icons with unique IDs)
- **Icon Validation**: When using `NerdIcon`, always verify the icon ID exists in [src/constants/nerdFontIcons.ts](src/constants/nerdFontIcons.ts). Search the file first to find an appropriate existing icon, or add a new one if needed. Invalid icon IDs will render as "?" in the UI.
- Tailwind CSS with project colors: `#0f0f23` (bg-dark), `#1a1a2e` (bg-panel), `#0f3460` (borders), `#e94560` (accent)

### Types
- All Oh My Posh types in [src/types/ohmyposh.ts](src/types/ohmyposh.ts)
- `Segment` and `Block` have internal `id` fields (stripped on export)
- `SegmentMetadata` defines picker display info + available `properties` and `options`

### Adding New Segments
1. Add to appropriate JSON file in `public/segments/` (keep alphabetized)
2. Include `type`, `name`, `description`, `icon`, `defaultTemplate`
3. Add `properties` array for template variables (e.g., `.Full`, `.Path`)
4. Add `options` array for configurable settings with `name`, `type`, `default`, `description`
5. Optionally add `defaultCache` with `duration` and `strategy` (see Cache Strategy Guide in `public/segments/README.md`)
6. Optionally add color override in `colorSchemes.ts`

### Config Structure
- Sample configs: `public/configs/samples/` 
- Community configs: `public/configs/community/`
- Each category has `manifest.json` listing configs with metadata
- Config files contain ONLY Oh My Posh config (no wrapper metadata)

## Important Patterns

### Segment Options vs Properties
- **Properties**: Template variables like `{{ .Full }}` - display in template help
- **Options**: Runtime config like `home_enabled`, `fetch_version` - editable in `options` object

### Advanced Features System
- Use `advancedFeaturesStore` to check if advanced UI controls should be shown
- Pattern: `const { caching } = useAdvancedFeaturesStore(); if (!caching) return null;`
- Always respect feature flags when rendering advanced controls (aliases, templates logic, responsive width, folder filters, cache, interactive, color templates, diamond symbols, block overflow, filler, tooltips, extra prompts, console title, shell integration, palette variants)
- Auto-detection on import: When importing configs, scan for advanced features and enable them if `autoDetectOnImport` is true

### Tooltips Feature
- Tooltips are command-triggered custom prompts (e.g., show git status when typing `git`)
- Stored separately from blocks in config, managed by `addTooltip`, `updateTooltip`, `removeTooltip` actions
- Each tooltip has `id`, `tips` (trigger commands), and extends `Segment` interface
- Canvas has dedicated TooltipsSection with drag-and-drop support
- Selection is mutually exclusive with blocks/segments
- Preview shows trigger command → tooltip output

### Confirmation Dialogs
- Use `useConfirm` hook for delete confirmations: `const confirm = useConfirm();`
- Call with message and optional title: `const confirmed = await confirm('Delete this segment?');`
- Hook uses `useRef` for proper async resolve handling (avoid closure issues)
- `ConfirmDialog` component handles the actual dialog rendering

### Component Section Organization
- PropertiesPanel sections are now separate components for reusability:
  - `TemplateSection` - Template/templates input with logic dropdown
  - `StyleSection` - Style picker and style-specific controls
  - `ColorsSection` - Foreground/background colors with optional color templates
  - `OptionsSection` - Segment-specific options rendering
  - `ResponsiveSection` - Min/max width controls
- Use these sections consistently in SegmentProperties and TooltipProperties
- Pass `showColorTemplates` prop to ColorsSection to conditionally show templates editor

### Unicode Handling
Use [src/utils/unicode.ts](src/utils/unicode.ts) functions:
- `unicodeToEscapes()` - display in UI
- `parseUnicodeEscapes()` - parse user input

### Drag and Drop
Uses @dnd-kit. Canvas handles cross-block segment moves and tooltip reordering. Items identified by `id` field. `EmptyBlockDropzone` for empty blocks.

## Best Practices & Linting

- **React Hooks**: Avoid using `useEffect` to synchronize state with props or reset state. Use conditional rendering with `key` props to reset components, or lazy state initialization.
- **Type Safety**: Avoid `any` at all costs. Use `unknown` for external data and cast to specific interfaces.
- **Unused Variables**: Prefix intentional unused variables with `_` (e.g., `const [_unused, value] = ...`).
- **CI Enforcement**: The GitHub Actions CI pipeline enforces zero linting errors and successful builds.

## Testing Changes

1. Run `npm run dev` and test in browser
2. Validate configs: `npm run validate`
3. Test export in all formats (JSON/YAML/TOML)
4. Verify preview renders correctly with powerline symbols
5. **Mandatory**: Run `npm run lint` and `npm run build` to ensure CI will pass.

## Changelog Maintenance

When implementing features, bug fixes, or making significant changes:

1. **Update CHANGELOG.md**: Add entries under the current date section (or create a new date section if needed)
2. **Categorize Changes**: Use appropriate sections:
   - **Added**: New features, components, or capabilities
   - **Changed**: Modifications to existing functionality
   - **Fixed**: Bug fixes and corrections
   - **Removed**: Deprecated or removed features
3. **Be Descriptive**: Write clear, user-facing descriptions of what changed and why it matters
4. **Link PRs**: Reference pull request numbers when applicable (e.g., `(#123)`)
5. **Update Before PR**: Ensure CHANGELOG.md is updated as part of the same commit/PR that introduces the change
