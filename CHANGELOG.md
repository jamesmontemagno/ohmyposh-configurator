# Changelog

All notable changes to the Oh My Posh Visual Configurator project will be documented in this file.

## [2026-01-04] - Phase 2 Completion: Global Settings & Extra Prompts

### Added
- **ExtraPromptsDialog Component** (Issue #36): New dialog for managing secondary prompts
  - Configure all 5 extra prompt types: transient_prompt, secondary_prompt, valid_line, error_line, debug_prompt
  - Enable/disable toggle for each prompt type with toggle switch UI
  - Expandable editor sections with template, foreground/background colors, filler (transient only), and newline options
  - Shell compatibility information shown for each prompt type
  - Launch button in GlobalSettings with enabled count badge
  - Escape key and backdrop click to close dialog
  - Links to official Oh My Posh documentation

- **New GlobalSettings Fields** (Issue #35): Added missing top-level configuration options
  - `pwd` dropdown: Working directory protocol (OSC 99, OSC 7, OSC 51) for terminal "Open Here" features
  - `async` checkbox: Async prompt rendering for faster shell startup
  - `patch_pwsh_bleed` checkbox: Fix PowerShell color bleeding issues (Windows)
  - All new fields properly typed, imported, and exported

- **Store Actions for Extra Prompts** (Issue #37): Added Zustand store actions for managing extra prompts
  - `setExtraPrompt(type, prompt)`: Set or clear an entire extra prompt
  - `updateExtraPrompt(type, updates)`: Partially update an extra prompt's properties
  - Automatically clears empty prompts from config (no orphaned empty objects)
  - Verified import/export support already exists for all 5 extra prompt types

## [2026-01-04] - Phase 1 Completion: Advanced Segment Properties

### Added
- **FolderFilterEditor Component** (Issue #32): New collapsible editor for managing `include_folders` and `exclude_folders` arrays
  - Add, edit, and remove folder patterns with intuitive interface
  - Glob pattern syntax help with examples (`~/projects/**`, `**/node_modules`, exact paths)
  - Separate sections for include (whitelist) and exclude (blacklist) folders
  - Enter key support for quick pattern addition
  - Empty arrays automatically removed from config
  
- **ColorTemplateEditor Component** (Issue #33): New collapsible editor for `foreground_templates` and `background_templates`
  - Multi-line textarea for template editing
  - Basic syntax validation (balanced `{{ }}` braces)
  - Syntax help showing template format
  - Shows count badge when templates exist
  - Displays default color fallback value
  - Ctrl+Enter support for quick template addition
  
- **CacheSettingsEditor Component** (Issue #34): New collapsible editor for segment cache configuration
  - Duration input with format hints (s=seconds, m=minutes, h=hours)
  - Strategy dropdown (session vs folder)
  - Quick preset buttons (2s, 30s, 1m, 5m, 1h, 24h, 168h)
  - Segment-type-aware suggestions (git=2s, node/python/etc=168h, cloud=1h)
  - Enable/disable toggle with suggested defaults
  - Shows current cache status in collapsed header

## [2026-01-04] - Interactive Checkbox

### Added
- **Interactive Toggle**: New checkbox in SegmentProperties panel for enabling interactive escape sequences
  - Enables OSC 8 hyperlinks for clickable elements in segments
  - Clear description with terminal compatibility information (iTerm2, Windows Terminal, Hyper, etc.)
  - Checkbox positioned before Options section for easy access
  - Uses `ui-external-link` icon for visual consistency
  - Full import/export support across JSON, YAML, and TOML formats
  - False values not exported to keep configs clean

## [2026-01-04] - Powerline Controls

### Added
- **Powerline Options**: New controls in SegmentProperties panel for powerline-style segments
  - `invert_powerline` checkbox: Flip the powerline symbol vertically
  - `leading_powerline_symbol` picker: Add an additional powerline symbol at the start of the segment
  - Controls only visible when segment style is set to 'powerline'
  - Leading powerline symbol picker includes left-pointing symbols (Round Left, Angle Left, Flame Left, Ice Left, Pixel Left)
  - Full import/export support across JSON, YAML, and TOML formats
  - Enables "floating" segment effects with powerline symbols on both sides

## [2026-01-04] - Templates Logic Control

### Added
- **Templates Logic Dropdown**: New dropdown control in SegmentProperties panel for controlling how multiple templates are evaluated
  - Only appears when segment has a `templates` array (hidden for single `template` property)
  - Two logic modes available:
    - `first_match`: Use the first template that produces non-empty output (default)
    - `join`: Concatenate all non-empty template outputs
  - Added `templates?: string[]` field to Segment interface
  - Full import/export support across JSON, YAML, and TOML formats
  - Help text explains template evaluation behavior
  - Properly positioned in the Template section for intuitive access

## [2026-01-04] - Template Alias Support

### Added
- **Template Alias Input**: New input field in SegmentProperties panel for setting segment aliases
  - Allows users to reference segments in templates using custom names (e.g., `{{ .Segments.MyAlias.Output }}`)
  - Input validation ensures aliases start with a letter and contain only letters, numbers, and underscores
  - Duplicate alias detection warns when the same alias is used by multiple segments
  - Help text dynamically shows how to reference the alias in templates
  - Empty values treated as `undefined` (not stored in config)
  - Uses `vcs-tag` icon for visual consistency
  - Full import/export support across JSON, YAML, and TOML formats

## [2026-01-04] - Responsive Width Controls

### Added
- **Responsive Display Controls**: New collapsible section in SegmentProperties panel for controlling segment visibility based on terminal width
  - `min_width` input field: Specify minimum terminal width (in columns) to show segment
  - `max_width` input field: Specify maximum terminal width (in columns) to show segment
  - Empty values treated as `undefined` (no limit) rather than 0
  - Section collapsed by default to reduce UI clutter
  - Uses `ui-monitor` icon for visual consistency
  - Full import/export support across JSON, YAML, and TOML formats

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
