# Scripts

This directory contains utility scripts for the Oh My Posh Configurator project.

## validate-configs.js

Validates all configuration files in the `public/configs/` directory.

### What it checks:

- ✅ **JSON Syntax**: Ensures all JSON files are valid
- ✅ **Manifest Structure**: Validates `manifest.json` files in both `samples/` and `community/`
- ✅ **Manifest Fields**: Checks that all required metadata fields are present in manifest entries
- ✅ **File References**: Ensures config files listed in manifest actually exist
- ✅ **Duplicate IDs**: Detects duplicate configuration IDs in manifests
- ✅ **Oh My Posh Schema**: Validates config files contain pure Oh My Posh configurations
- ✅ **Blocks & Segments**: Ensures proper block and segment structure with required fields
- ✅ **No Metadata Wrapper**: Verifies config files contain only Oh My Posh config (no metadata wrapper)

### Important: Config File Structure

Config files should contain **ONLY** the Oh My Posh configuration:
- ✅ Start with `$schema` field
- ✅ Include `blocks` array
- ❌ **Do NOT** include `id`, `name`, `description`, `author`, or `tags` in config files
- ℹ️ All metadata belongs in `manifest.json` only

### Usage:

```bash
# Run validation
npm run validate

# Or directly with node
node scripts/validate-configs.js
```

### Exit Codes:

- `0`: All validations passed
- `1`: Validation errors found

### When it runs:

- **Locally**: Run manually before submitting PRs
- **GitHub Actions**: Automatically runs on PRs that modify config files
- **CI/CD**: Part of the pull request validation workflow

### Example Output:

```
🔍 Oh My Posh Configurator - Config Validation

==================================================

📁 Validating samples category...
ℹ️ Validating samples/manifest.json...
✓ Found 6 configs in samples/manifest.json
ℹ️ Validating samples/developer-pro.json...
✓ samples/developer-pro.json validated
...

==================================================

📊 Validation Summary:

✓ All validations passed! ✨
```

### For Contributors:

If you're submitting a community configuration:

1. Add your config JSON file to `public/configs/community/` with **only** the Oh My Posh configuration
2. Update `public/configs/community/manifest.json` with your config's metadata
3. Run `npm run validate` to check for errors
4. Fix any validation errors before submitting your PR

**Remember**: Config files should NOT contain metadata fields. All metadata goes in `manifest.json`.

The validation will automatically run on your PR via GitHub Actions.

### Common Errors:

**Missing required Oh My Posh fields:**
```
✗ community/my-config.json: missing required Oh My Posh config field '$schema'
```
→ Add the `$schema` field to your config file

**Missing manifest metadata:**
```
✗ community/manifest.json entry 0: missing required field 'author'
```
→ Add the missing field to the manifest entry

**Duplicate ID:**
```
✗ community/manifest.json entry 3: duplicate ID 'my-theme'
```
→ Change the ID in manifest to be unique

**File not found:**
```
✗ community/my-config.json: file referenced in manifest but not found
```
→ Ensure the filename in manifest matches the actual file

**Invalid JSON:**
```
✗ Invalid JSON in community/my-config.json: Unexpected token } in JSON at position 42
```
→ Fix JSON syntax errors (missing comma, extra bracket, etc.)

**Metadata in config file (deprecated):**
If you see errors about unexpected fields like `id`, `name`, or `description` in your config file, these fields should be moved to `manifest.json` instead. Config files should contain only the Oh My Posh configuration.

## minify-json.js

Minifies JSON files by removing all whitespace and indentation.

### Usage:

```bash
# Minify files in dist/ (default)
node scripts/minify-json.js dist

# Minify files in public/
npm run minify
```

## format-json.js

Formats JSON files with 2-space indentation for human readability.

### Usage:

```bash
# Format files in public/ (default)
npm run format:json

# Format files in another directory
node scripts/format-json.js some-dir
```
