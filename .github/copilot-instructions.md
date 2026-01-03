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

**State Management**: Single Zustand store in [src/store/configStore.ts](src/store/configStore.ts) with persistence. All config mutations go through store actions. Use `generateId()` for new blocks/segments.

**Segment Metadata**: Stored as JSON in [public/segments/](public/segments/) by category (system, scm, languages, cloud, cli, web, music, health). Each segment defines `type`, `name`, `icon`, `defaultTemplate`, `properties`, and `options`. Loaded dynamically via [src/utils/segmentLoader.ts](src/utils/segmentLoader.ts).

**Color Schemes**: Default colors in [src/data/colorSchemes.ts](src/data/colorSchemes.ts) - category-based with per-segment overrides. New segments inherit from category unless specified in `segmentColorOverrides`.

**Export/Import**: [src/utils/configExporter.ts](src/utils/configExporter.ts) strips internal `id` fields before export. Supports JSON/YAML/TOML. Unicode chars escaped as `\uXXXX` in JSON.

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
5. Optionally add color override in `colorSchemes.ts`

### Config Structure
- Sample configs: `public/configs/samples/` 
- Community configs: `public/configs/community/`
- Each category has `manifest.json` listing configs with metadata
- Config files contain ONLY Oh My Posh config (no wrapper metadata)

## Important Patterns

### Segment Options vs Properties
- **Properties**: Template variables like `{{ .Full }}` - display in template help
- **Options**: Runtime config like `home_enabled`, `fetch_version` - editable in `options` object

### Unicode Handling
Use [src/utils/unicode.ts](src/utils/unicode.ts) functions:
- `unicodeToEscapes()` - display in UI
- `parseUnicodeEscapes()` - parse user input

### Drag and Drop
Uses @dnd-kit. Canvas handles cross-block segment moves. Segments identified by `id` field. `EmptyBlockDropzone` for empty blocks.

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
