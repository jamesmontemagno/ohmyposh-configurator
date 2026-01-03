# Changelog

All notable changes to the Oh My Posh Visual Configurator project will be documented in this file.

## [2026-01-03] - HTML Formatting Support

### Added
- **HTML Formatting in Templates**: Preview panel now supports HTML formatting tags in templates including `<b>` (bold), `<i>` (italic), `<u>` (underline), `<s>` and `<strike>` (strikethrough). Multiple formatting styles can be combined and work alongside existing color codes.

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
