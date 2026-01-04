# Contributing to Oh My Posh Configurator

Thank you for your interest in contributing to the Oh My Posh Configurator! We welcome contributions from the community, especially sharing your custom Oh My Posh configurations.

## Ways to Contribute

### 1. Share Your Configuration Theme

The easiest way to contribute is by sharing your Oh My Posh configuration with the community! If you've created a beautiful or useful prompt theme, we'd love to include it in our Community Collection.

#### How to Submit Your Configuration

**Using the Built-in Tool (Recommended):**

1. Open the Oh My Posh Configurator at https://jamesmontemagno.github.io/ohmyposh-configurator/
2. Design your configuration using the visual editor
3. Click the "Share" button in the header
4. Fill in the required information:
   - Configuration Name
   - Description
   - Your Name/Username
   - Tags (optional, but helpful)
5. Click "Copy Configuration" to copy your theme JSON
6. Follow the submission steps provided in the dialog

**Manual Submission:**

1. Fork this repository
2. Create a new JSON file in `public/configs/community/` named `your-theme-name.json`
3. Follow the structure below for your configuration file
4. Update `public/configs/community/manifest.json` to include your configuration
5. Submit a pull request

#### Configuration File Structure

Your configuration file should contain **only** the Oh My Posh configuration (no metadata wrapper). The metadata is stored separately in the manifest.json file.

```json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "version": 3,
  "final_space": true,
  "blocks": [
    {
      "type": "prompt",
      "alignment": "left",
      "segments": [
        {
          "type": "path",
          "style": "powerline",
          "foreground": "#ffffff",
          "background": "#61AFEF",
          "template": " {{ .Path }} ",
          "properties": {
            "style": "folder"
          }
        }
      ]
    }
  ]
}
```

**Important:** 
- Config files contain **ONLY** the Oh My Posh configuration
- Do **NOT** include `id`, `name`, `description`, `icon`, `author`, or `tags` fields in the config file
- These metadata fields belong in the `manifest.json` file only
- Each segment can have `properties` (template variables) and `options` (configuration settings)

#### Updating the Manifest

Add your configuration's **metadata** to `public/configs/community/manifest.json`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-30",
  "configs": [
    {
      "id": "my-awesome-theme",
      "name": "My Awesome Theme",
      "description": "A brief description of what makes your theme special",
      "icon": "Star",
      "author": "Your Name",
      "tags": ["minimal", "developer", "colorful"],
      "file": "my-awesome-theme.json"
    }
  ]
}
```

**Metadata Field Requirements:**

- `id`: Lowercase, hyphenated unique identifier matching your filename (e.g., `my-theme-name`)
- `name`: Display name for your theme
- `description`: Brief description (1-2 sentences recommended)
- `icon`: [Nerd Font icon ID](docs/nerd-font-icons-reference.md) (e.g., `misc-star`, `ui-code`, `misc-rocket`) - **must use format `category-name`**
- `author`: Your name or GitHub username
- `tags`: Array of relevant tags (e.g., `["minimal", "developer", "python"]`)
- `file`: The filename of your config JSON file

#### Icon Usage Guidelines

**Important:** All icon references must use valid icon IDs from [docs/nerd-font-icons-reference.md](docs/nerd-font-icons-reference.md).

**Icon ID Format:**
- Icon IDs use the format `category-name` (e.g., `misc-star`, `lang-python`, `ui-code`)
- **NOT** just the name (e.g., ~~`Star`~~, ~~`Python`~~)

**Finding Icon IDs:**
1. Browse the complete list in [docs/nerd-font-icons-reference.md](docs/nerd-font-icons-reference.md)
2. Use the icon picker in the configurator's "Submit Config" dialog
3. Search by category:
   - `ui-*` - UI elements (chevrons, arrows, etc.)
   - `lang-*` - Programming languages
   - `fw-*` - Frameworks
   - `vcs-*` - Version control
   - `cloud-*` - Cloud services
   - `misc-*` - Miscellaneous icons

**Validation:**
- Icon references are automatically validated in CI and pre-commit hooks
- Invalid icon IDs will cause build failures
- Only icons from `nerdFontIcons.ts` are allowed to keep the font subset optimized

**Example:**
```json
{
  "icon": "misc-star",  // ✅ Correct
  "icon": "Star"        // ❌ Wrong - will fail validation
}
```

### 2. Report Bugs

Found a bug? Please open an issue on GitHub with:

- A clear description of the problem
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots if applicable
- Browser and OS information

### 3. Suggest Features

Have an idea for a new feature? Open an issue with:

- A clear description of the feature
- Use cases and benefits
- Any relevant examples or mockups

### 4. Code Contributions

Want to contribute code? Great!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a pull request

#### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ohmyposh-configurator.git
cd ohmyposh-configurator

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Validate configuration files
npm run validate

# Validate icon references
npm run validate-icons

# Generate optimized font subset (requires fonttools)
npm run generate-font-subset
```

#### Prerequisites for Font Work

If you're working on features that require regenerating the font subset:

1. **Install Python 3.x** (if not already installed)
2. **Install fonttools:**
   ```bash
   # macOS/Linux
   pip3 install fonttools brotli
   
   # Windows
   pip install fonttools brotli
   
   # Or using conda
   conda install -c conda-forge fonttools brotli
   ```
3. See [docs/font-subset-process.md](docs/font-subset-process.md) for detailed information

#### Testing Your Configuration

Before submitting your PR, validate your configuration files:

```bash
npm run validate
```

The validation script automatically runs on all pull requests via GitHub Actions and validates:

- ✅ Valid JSON syntax in all config files
- ✅ Required Oh My Posh fields present (`$schema`, `blocks`)
- ✅ Blocks contain valid segments with `type` fields
- ✅ Manifest entries have all required metadata fields
- ✅ No duplicate IDs in manifest
- ✅ All files referenced in manifest exist
- ✅ Config files contain pure Oh My Posh configuration (no metadata wrapper)
- ✅ All icon references use valid IDs from `nerdFontIcons.ts`
- ✅ No hardcoded unicode characters outside of known powerline symbols

## Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing code style (Prettier/ESLint)
- Write meaningful commit messages
- Add comments for complex logic
- Keep components focused and reusable

### Adding New Segments

If you're adding a new segment type to the configurator:

1. Add the segment to the appropriate JSON file in `public/segments/` (e.g., `languages.json`)
2. Include all required fields:
   ```json
   {
     "type": "segment-type",
     "name": "Display Name", 
     "description": "Brief description",
     "icon": "lang-python",
     "defaultTemplate": " {{ .Property }} ",
     "properties": [
       {
         "name": ".Property",
         "type": "string",
         "description": "What this template variable represents"
       }
     ],
     "options": [
       {
         "name": "option_name",
         "type": "boolean",
         "default": true,
         "description": "What this configuration option does"
       }
     ],
     "defaultCache": {
       "duration": "168h",
       "strategy": "folder"
     }
   }
   ```
3. **Properties** define template variables users can use in `{{ }}` templates
4. **Options** define configuration settings for the segment's behavior
5. **defaultCache** (optional) provides recommended caching - see Cache Strategy Guide in `public/segments/README.md`
6. Keep segments alphabetized by name within each category file
7. Test the segment in the configurator to ensure it displays and exports correctly
8. See [public/segments/README.md](public/segments/README.md) for more details

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others when you can
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## Review Process

1. All contributions will be reviewed by maintainers
2. We may request changes or improvements
3. Once approved, your contribution will be merged
4. Community configurations will be visible immediately after the next deployment

## Questions?

If you have questions about contributing, feel free to:

- Open a [Discussion](https://github.com/jamesmontemagno/ohmyposh-configurator/discussions)
- Comment on an existing issue
- Reach out to the maintainers

## License

By contributing to this project, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

Thank you for helping make Oh My Posh Configurator better! 🎨✨
