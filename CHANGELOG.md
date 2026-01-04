# Changelog

All notable changes to the Oh My Posh Visual Configurator project will be documented in this file.

## [2026-01-04]

### Share Button with Multiple Options

- **Share Dropdown**: Replaced single "Submit" button with a "Share" dropdown offering two options:
  - **Add to Theme Library**: Opens the existing community submission dialog with instructions for contributing via PR
  - **Create GitHub Gist**: Copies config to clipboard, opens gist.github.com in new tab, and shows step-by-step instructions

### My Configs - Local Config Library

**Save, Manage, and Restore Your Configurations Locally**
- **My Configs Tab**: New first tab in Theme Library for managing saved configs
  - Grid view of saved configs sorted by last updated
  - Config count display with 50 config limit indicator
  - Export All / Import buttons for backup and restore
  
- **Save Config Dialog**: Save current config with name, description, and tags
  - Accessible via new "Save" button in header
  - Duplicate name validation
  - Update existing config or save as new
  - Tag support (up to 5 tags per config)
  
- **Saved Config Cards**: Rich display for each saved config
  - Name, description preview, and tags
  - Relative timestamp ("Updated 2h ago")
  - "Active" badge for currently loaded config
  - Overflow menu with Rename, Duplicate, and Delete actions
  - Inline rename with keyboard support
  
- **Auto-Save Drafts**: Never lose work with automatic draft recovery
  - Drafts auto-saved every 5 seconds to IndexedDB
  - Recovery banner on app load if unsaved changes detected
  - One-click restore or discard options
  
- **Unsaved Changes Indicator**: Amber dot on Save button when changes detected
  - Visual feedback that current work differs from last save
  - Helps users remember to save before closing
  
- **Bundle Export/Import**: Backup and transfer all configs
  - "Export All" downloads `my-configs-backup-{date}.json`
  - Import handles duplicates with auto-rename strategy
  - Respects 50 config limit during import

- **IndexedDB Storage**: Persistent local storage using `idb-keyval`
  - Configs persist across browser sessions
  - No server required - 100% client-side

### Official Themes Browser

**Browse and Load Official Oh My Posh Themes**
- **Official Themes Tab**: New third tab in the Theme Library (Configs button) to browse all official Oh My Posh themes directly from the repository
  - Paginated grid view with 12 themes per page
  - Preview images loaded from ohmyposh.dev with lazy loading and fallback placeholders
  - "No Nerd Font" badge for minimal themes that work without special fonts
  - Direct GitHub links to view theme source files
  
- **Search and Filter**: Find themes quickly by name or tags
  - Real-time search across theme names and tags
  - Tag-based filtering (e.g., "catppuccin", "powerline", "minimal", "dark")
  - Results count display during search
  
- **On-Demand Loading**: Themes are fetched directly from GitHub when selected
  - Supports both JSON and YAML theme files
  - Automatic ID generation for blocks, segments, and tooltips
  - Caching to avoid redundant downloads
  
- **Theme Manifest Generator**: New script to update the official themes list
  - `npm run generate:official-themes` fetches themes from GitHub API
  - Auto-infers tags from theme names (catppuccin, dracula, powerline, minimal, etc.)
  - Identifies minimal themes that don't require Nerd Fonts

### Advanced Features System

**New Settings System for Managing UI Complexity**
- **Advanced Settings Dialog**: Progressive disclosure system to hide advanced Oh My Posh features until users need them
  - Access via "Settings" button in Header (shows count of enabled features)
  - Master "Show All" toggle to quickly enable/disable all advanced features
  - Organized into 3 categories: Segment Features, Block Features, and Global Features
  - 15 toggleable features: Template Alias, Conditional Colors, Responsive Display, Folder Filters, Caching, Multiple Templates, Interactive, Diamond Symbols, Block Overflow, Block Filler, Tooltips, Extra Prompts, Console Title, Shell Integration, and Palette Variants
  - Reset to Defaults button to restore initial state (only Caching enabled by default)
  
- **Auto-detection on Import**: Automatically enables features when importing configs that use them
  - Scans for advanced properties (aliases, templates, tooltips, extra prompts, etc.)
  - Shows notification listing newly enabled features
  - Can be toggled off in Advanced Settings dialog

- **Conditional UI Rendering**: All advanced controls now respect feature toggles
  - SegmentProperties: Template Alias, Conditional Colors, Responsive Width, Interactive, Folder Filters, and Cache sections
  - BlockProperties: Diamond symbols, Overflow, and Filler controls
  - GlobalSettings: Console Title, Shell Integration, Tooltips action, and Extra Prompts
  - Canvas: Tooltips section visibility
  - PaletteEditor: Palette Variants section

### Full Oh My Posh Schema Support

**Complete Type System Coverage**
- Added missing TypeScript interfaces for Oh My Posh v4 schema:
  - `SegmentCache` interface for caching configuration
  - `CycleSettings` interface for color cycling
  - `UpgradeSettings` interface for auto-update settings
  - `ITermFeature` type for iTerm2 integration flags
  - `Tooltip` interface for command-based tooltips
  
- **Enhanced Import/Export**: Full support for all schema properties
  - Import: `upgrade`, `iterm_features`, `extends`, `tooltips`, `tooltips_action`
  - Export: Clean output (no empty arrays/objects), proper ID stripping
  - All formats supported: JSON, YAML, TOML

### Default Cache Settings

**Intelligent Caching for Better Performance**
- **Segment Metadata Cache Defaults**: Added `defaultCache` field to segment definitions
  - Includes `duration` (e.g., `2s`, `1h`, `168h`) and `strategy` (`session` or `folder`)
  - Strategy Guide in segments README with recommendations for each category:
    - SCM segments: `2s` session (repository changes frequently)
    - Language segments: `168h` folder (versions rarely change per project)
    - Cloud segments: `1h` session for providers, `5m` folder for IaC tools
    - System segments: `24h` session (or no cache for real-time data)
  
- **Auto-population on Add**: When adding a segment from picker, cache settings automatically applied from metadata
  - Users get optimal defaults immediately
  - Still fully customizable via Properties Panel

### Tooltips Support

**Command-Triggered Custom Prompts**
- **Tooltip Infrastructure**: Complete implementation of Oh My Posh tooltips feature
  - New store actions: `addTooltip`, `updateTooltip`, `removeTooltip`, `selectTooltip`, `duplicateTooltip`, `reorderTooltips`
  - Selection states are mutually exclusive with blocks/segments
  - Full import/export support with ID normalization
  
- **TooltipCard Component**: Visual representation in Canvas
  - Displays trigger commands as green badges (e.g., `git`, `npm`)
  - Shows style (powerline/diamond/plain), colors, and template preview
  - Drag-and-drop reordering with dnd-kit
  - Duplicate and delete actions
  
- **Canvas Tooltips Section**: Dedicated management area
  - Collapsible section with count badge
  - Grid layout with drag-and-drop reordering
  - "Add Tooltip" button creates git tooltip with sensible defaults
  - Empty state with helpful guidance
  
- **TooltipProperties Panel**: Full editor for tooltip configuration
  - TipsEditor component for managing trigger commands (add/edit/remove)
  - All segment properties: type, style, colors, template
  - Style-specific controls (powerline/diamond symbols)
  - Conditional color templates and responsive display
  - Segment-specific options
  
- **Tooltip Preview**: Visual representation in PreviewPanel
  - Shows trigger command → tooltip output
  - Full style rendering with palette color resolution
  - Click to select for editing
  
- **Global Tooltips Action**: Configure how tooltips interact with main prompt
  - Three modes: Replace (default), Extend (append), Prepend (insert before)
  - Setting added to GlobalSettings panel

### Extra Prompts Support

**Secondary Prompt Configuration**
- **ExtraPromptsDialog**: Configure all 5 Oh My Posh secondary prompts
  - Prompt types: transient_prompt, secondary_prompt, valid_line, error_line, debug_prompt
  - Enable/disable toggle for each type
  - Expandable editor sections with template, colors, and options
  - Shell compatibility information for each prompt type
  - Launch via GlobalSettings button (shows enabled count badge)
  
- **New GlobalSettings Fields**: Added missing top-level config options
  - `pwd`: Working directory protocol (OSC 99, OSC 7, OSC 51)
  - `async`: Enable async prompt rendering
  - `patch_pwsh_bleed`: Fix PowerShell color issues (Windows)
  
- **Store Actions**: `setExtraPrompt` and `updateExtraPrompt` for managing secondary prompts

### Advanced Segment Properties

**Comprehensive Property Editors**
- **FolderFilterEditor**: Manage `include_folders` and `exclude_folders` arrays
  - Separate sections for whitelist (include) and blacklist (exclude)
  - Glob pattern syntax help with examples
  - Inline editing with Enter key support
  
- **ColorTemplateEditor**: Edit `foreground_templates` and `background_templates`
  - Multi-line textarea with syntax validation
  - Template format help and examples
  - Ctrl+Enter for quick addition
  
- **CacheSettingsEditor**: Configure segment caching
  - Duration input with format hints (s/m/h)
  - Strategy dropdown (session vs folder)
  - Quick preset buttons (2s to 168h)
  - Segment-type-aware suggestions

### Segment Configuration Options

**Additional Controls for Advanced Users**
- **Template Alias**: Reference segments in templates by custom name
  - Validation: must start with letter, alphanumeric + underscores only
  - Duplicate alias detection with warnings
  - Dynamic help text showing usage example
  
- **Templates Logic**: Control multi-template evaluation
  - `first_match`: Use first template with non-empty output (default)
  - `join`: Concatenate all non-empty template outputs
  - Only shown when segment has `templates` array
  
- **Responsive Display**: Control segment visibility by terminal width
  - `min_width`: Minimum columns to show segment
  - `max_width`: Maximum columns to show segment
  - Collapsed by default to reduce clutter
  
- **Powerline Controls**: Additional powerline customization
  - `invert_powerline`: Flip symbol vertically
  - `leading_powerline_symbol`: Add symbol at segment start
  - Only shown for powerline-style segments
  - Enables "floating" effects with symbols on both sides
  
- **Interactive Toggle**: Enable OSC 8 hyperlinks
  - Makes segments clickable in supported terminals
  - Clear terminal compatibility information

### UI/UX Improvements

- **Confirmation Dialogs**: Added `useConfirm` hook and `ConfirmDialog` component for delete actions
  - Prevents accidental deletions of segments, blocks, and tooltips
  - Uses `useRef` for proper async resolve handling
  
- **Component Organization**: Refactored PropertiesPanel with reusable sections
  - New section components: `TemplateSection`, `StyleSection`, `ColorsSection`, `OptionsSection`, `ResponsiveSection`
  - Reduces code duplication across SegmentProperties and TooltipProperties
  - Consistent UI patterns throughout the app
  
- **Font Subset Updates**: Regenerated Nerd Font subset with improved unicode handling
  - Better symbol display quality
  - Optimized file size
  
- **SegmentCard Enhancements**: Improved palette color resolution and styling
  - More accurate color preview in Canvas
  - Better visual feedback for segment state
  
- **SegmentPicker Layout**: Adjusted spacing and layout for improved usability

### Data & Documentation

- **Segment Metadata Updates**: Updated CLI, Cloud, Languages, SCM, System, Web, and Health segments
  - Added `defaultCache` field to all segments
  - Icon consistency improvements
  - Enhanced templates with better formatting
  
- **Test Configuration**: Added `powerline-test.json` demonstrating recent features
  
- **Segments Documentation**: Updated README with Cache Strategy Guide and authoring instructions

## [2026-01-03] - Palette Support & Enhanced Template Preview

### Added
- **All Segments Sample Config**: Comprehensive test configuration (`all-segments.json`) with 70+ segment types across 18 blocks covering system, SCM, languages, cloud, CLI, frameworks, package managers, build tools, AI, system info, music, health, and web services. Uses version 4 with full palette support (105 color definitions).
- **Palette Reference Validation**: Config validator now validates palette references (`p:name`), ensuring all referenced colors exist in the palette. Reports palette usage statistics during validation.
- **Palette Support**: Full support for Oh My Posh's `palette` and `palettes` features
  - **Palette Editor Dialog**: New dialog accessible via "Palette" button in header to manage color palettes
  - **Base Palette**: Define reusable colors referenced as `p:key-name` throughout segments
  - **Palette Variants**: Create multiple named palette variants (e.g., dark/light themes) with template-based selection
  - **Preview Palette Selector**: Switch between palette variants for preview
- **Enhanced Color Input**: Three-mode color selector supporting:
  - Direct hex color values
  - Named CSS colors (including context-dependent colors like `parentBackground`, `foreground`, `accent`)
  - Palette references (`p:key-name`) with color swatches
- **Template Autocomplete**: Type `<p:` in template fields to get autocomplete suggestions for palette color keys
- **Inline Palette Colors**: Preview panel now resolves `<p:key-name>` inline color tags in templates
- **Context-Dependent Color Indicators**: Visual indicators for colors that inherit from adjacent segments at runtime
- **Unresolved Palette Warnings**: Warning indicators when palette references cannot be resolved
- **HTML Formatting in Templates**: Preview panel now supports HTML formatting tags in templates including `<b>` (bold), `<i>` (italic), `<u>` (underline), `<s>` and `<strike>` (strikethrough). Multiple formatting styles can be combined and work alongside existing color codes.
- **Enhanced Template Processing**: Added support for additional Go template functions:
  - `url` - Creates hyperlinks from text and URL arguments
  - `trunc` - Truncates strings to specified length
  - `path` - Path rendering with location
  - `now | date` - Current time with Go date format patterns (e.g., `15:04:05`)
  - `.Segments.Contains` - Check if a segment type exists
  - `trimPrefix` - Remove prefix from strings
  - `coalesce` - Returns first non-empty value
  - `printf` - String formatting
  - `or` - Logical OR operation
  - `hresult` - Windows error code formatting
  - `eq` - Equality comparison
- **Cross-Segment Template Data**: Added `.Segments` accessor for templates that reference other segments (e.g., `.Segments.Git.HEAD`, `.Segments.Path.Path`)
- **Environment Variables**: Mock data now includes `.Env` object with common environment variables (TMUX, WT_PROFILE_ID, HOME, etc.)

### Changed
- **Mock Data Architecture**: Refactored mock data to be organized by segment type (`segmentMockData`) for easier maintenance. Each segment now has its own complete, self-contained mock data without duplicates.
- **Go Date Format Parsing**: Template date formatting now properly parses Go's reference time patterns (e.g., `{{ .CurrentDate | date "15:04:05" }}` displays as `14:30:45` instead of full Date object)

### Fixed
- Fixed preview crash when accessing undefined mock data properties
- Fixed date/time display showing full Date object instead of formatted time

## [2026-01-02] - Latest Updates

### Fixed
- Use literal escaped strings (`\uf07c`) instead of Unicode characters in templates for better compatibility

## [2026-01-01] - Major Enhancements

### Added
- **Onboarding Tutorial**: First-time user onboarding with interactive tutorial and preview disclaimer
- **Segment Tooltips**: Tooltips displaying segment name and description on hover
- **DevContainer Configuration**: Initial development container setup for consistent dev environments
- **WinGet Segment**: New segment type for Windows Package Manager

### Changed
- **Default Templates**: Updated all segment defaultTemplates with improved icons and formatting
- **Powerline Symbols**: Expanded powerline symbol set with better unicode extraction from config files
- **Code Quality**: Enhanced type definitions using `unknown` instead of `any` for better type safety
- **JSON Loading**: Refactored JSON configurations and improved loading mechanisms

### Fixed
- Removed leading backslashes from defaultTemplate formatting
- Updated defaultConfig templates with improved icon codes

### Removed
- Mock data handling from BlockPreview and SegmentPreview components
- Deprecated sampleConfigs file and associated loadSampleConfig function
- getPowerlineSymbols function in favor of improved unicode handling

## [2025-12-31] - Configuration & Documentation

### Added
- **Import Dialog**: File upload and paste configuration options for importing Oh My Posh configs
- **Architecture Documentation**: Comprehensive architecture docs explaining system design
- **Segment Properties & Methods**: Support for segment methods and enhanced GitHub Copilot segment

### Changed
- **Config Version**: Bumped all configuration versions to v4
- **Template Parser**: Handle method calls with optional parentheses in template parser
- **README & CONTRIBUTING**: Updated documentation with segment properties/options information

### Fixed
- Memory leaks in dialog components
- Reset pasted config on dialog open
- Differentiated import methods for better UX
- Code review issues with method descriptions and gauge representations

## [2025-12-30] - Core Features & Improvements

### Added
- **Properties Panel**: Complete properties panel with segment option editing
- **Nerd Font Picker**: Icon picker with full Nerd Font icons support
- **Segment Methods**: Display of available methods for segments (e.g., `.Count`, `.Enabled`)
- **Mock Data System**: Segment-specific mock data for better preview accuracy
- **Background Options**: Configurable background in preview panel
- **WinGet Segment**: Initial WinGet package manager segment
- **Validation Comments**: Enhanced validation in GitHub Actions workflows
- **Scripts**: Management scripts for segment options and properties

### Changed
- **Configuration Structure**: Updated to use 'options' instead of 'properties' for segment configuration
- **Default Templates**: Improved templates across all segments
- **Segment Icons**: Updated icons and added Nerd Font icons reference
- **Preview Panel**: Enhanced with comprehensive segment properties and accordion support
- **SegmentCard**: Improved display and functionality
- **GitHub Copilot Segment**: Enhanced with better preview text and configuration

### Fixed
- Segment creation now properly inherits styles and colors
- Category section functionality improvements
- Preview text retrieval logic
- Header component link updated

## [2025-12-29] - Initial Release

### Added
- **Core Application**: Oh My Posh Visual Configuration Builder with React 19 + TypeScript + Vite
- **Drag & Drop Interface**: Intuitive canvas for building terminal prompts
- **Segment Metadata**: Refactored into JSON files organized by category (system, scm, languages, cloud, cli, web, music, health)
- **Dynamic Icon Component**: NerdIcon component for displaying Nerd Font icons
- **Sample Picker**: Theme selection interface with multiple sample configurations
- **Configuration Export**: Export configurations in JSON, YAML, and TOML formats
- **File Import**: Header component with file import functionality and success notifications
- **Sample Configurations**: Multiple sample configs (minimal, developer-pro, full-stack, data-scientist, streamer, cloud-engineer)
- **Community Configurations**: Community-contributed themes (dotnet-azure-developer, cinnamon-1_shell)
- **SEO & Metadata**: Enhanced with structured data, favicons, manifest, robots.txt, sitemap.xml, and humans.txt
- **Screen Size Warning**: Component to notify users on small screens
- **Segment Metadata Hook**: useSegmentMetadata hook with preload functionality
- **GitHub Actions**: PR validation workflow with permissions
- **Blog Post**: Announcement blog post with app screenshots

### Technical
- Zustand state management with persistence
- Color schemes with category-based defaults and per-segment overrides
- Unicode escape handling utilities
- Configuration validation scripts
- Custom font subset with Nerd Font icons

---

## Project Information

**Repository**: [jamesmontemagno/ohmyposh-configurator](https://github.com/jamesmontemagno/ohmyposh-configurator)  
**Live Demo**: [GitHub Pages](https://jamesmontemagno.github.io/ohmyposh-configurator/)  
**License**: See LICENSE file

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).
