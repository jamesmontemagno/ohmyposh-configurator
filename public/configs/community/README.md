# Community Configurations

This directory contains community-contributed Oh My Posh configurations.

## Submission Guidelines

To submit your configuration:

1. Create a new JSON file in this directory with **only** the Oh My Posh configuration (no metadata wrapper)
2. Update `manifest.json` to include your configuration's metadata
3. Submit a pull request using the provided template

For detailed instructions, see [CONTRIBUTING.md](../../CONTRIBUTING.md)

## File Structure

**Config Files** (`your-theme-name.json`):
- Contains **ONLY** the Oh My Posh configuration
- Should start with `$schema` and include `blocks`
- **Do NOT include** `id`, `name`, `description`, `author`, or `tags` in the config file

**Manifest File** (`manifest.json`):
- Contains metadata for all community configs
- Each entry includes: `id`, `name`, `description`, `icon`, `author`, `tags`, and `file`

Example config file structure:
```json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "version": 4,
  "final_space": true,
  "blocks": [
    {
      "type": "prompt",
      "alignment": "left",
      "segments": [
        // Your segments here
      ]
    }
  ]
}
```

## File Naming

- Use lowercase with hyphens: `my-theme-name.json`
- Be descriptive but concise
- Avoid special characters

## Quality Standards

All community configurations should:
- Contain **ONLY** the Oh My Posh configuration (no metadata wrapper)
- Follow the Oh My Posh schema with valid `$schema` URL
- Include at least one block with segments
- Have metadata properly defined in `manifest.json`
- Be tested and working
- Be your original work or properly attributed

## Examples

See the `samples/` directory for examples of properly formatted configurations.

## Questions?

Check out [CONTRIBUTING.md](../../CONTRIBUTING.md) or open a discussion on GitHub.
