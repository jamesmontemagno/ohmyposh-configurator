# Quick Reference: Config File Structure

## ✅ Correct Structure

### Config File (my-theme.json)
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
          "template": " {{ .Path }} "
        }
      ]
    }
  ]
}
```

### Manifest Entry (manifest.json)
```json
{
  "id": "my-theme",
  "name": "My Theme",
  "description": "A brief description",
  "icon": "misc-star",
  "author": "Your Name",
  "tags": ["minimal", "developer"],
  "file": "my-theme.json"
}
```

## ❌ Incorrect Structure (Old Format)

### ❌ DON'T DO THIS
```json
{
  "id": "my-theme",
  "name": "My Theme",
  "description": "A brief description",
  "icon": "misc-star",
  "author": "Your Name",
  "tags": ["minimal", "developer"],
  "config": {
    "$schema": "...",
    "blocks": [...]
  }
}
```

## Checklist for Submissions

- [ ] Config file contains **ONLY** Oh My Posh configuration
- [ ] Config file starts with `$schema` field
- [ ] Config file includes `blocks` array with segments
- [ ] Config file does **NOT** have `id`, `name`, `description`, `author`, or `tags`
- [ ] Manifest entry has all required fields
- [ ] `file` field in manifest matches actual filename
- [ ] Ran `npm run validate` and it passed
- [ ] Config tested with Oh My Posh

## Commands

```bash
# Validate your config
npm run validate

# Start dev server
npm run dev

# Build for production
npm run build
```

## Resources

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Full contribution guide
- [config-migration-guide.md](config-migration-guide.md) - Migrate from old format
- [samples/](../public/configs/samples/) - Example configs
- [Oh My Posh Docs](https://ohmyposh.dev/) - Official documentation

## Common Mistakes

### ❌ Metadata in config file
```json
// DON'T DO THIS in your-theme.json
{
  "id": "my-theme",  // ❌ Remove
  "name": "My Theme",  // ❌ Remove
  "$schema": "...",  // ✅ Keep
  "blocks": []  // ✅ Keep
}
```

### ✅ Correct separation
```json
// your-theme.json - ONLY config
{
  "$schema": "...",
  "blocks": []
}

// manifest.json - ONLY metadata
{
  "configs": [
    {
      "id": "my-theme",
      "name": "My Theme",
      "file": "your-theme.json"
    }
  ]
}
```

## Need Help?

1. Check [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Look at [example configs](../public/configs/samples/)
3. Open a [GitHub Discussion](https://github.com/jamesmontemagno/ohmyposh-configurator/discussions)

---

**Remember:** Config files = Pure Oh My Posh | Manifest = Metadata 🎨
