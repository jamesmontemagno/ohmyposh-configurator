# Font Subset Process

This document explains how the Oh My Posh Configurator optimizes font loading using a subset of the Nerd Font, reducing the initial download size from **~1.5MB to ~50-100KB** (~95% reduction).

## Overview

The app uses a custom subset of the [Nerd Fonts Symbols Only](https://github.com/ryanoasis/nerd-fonts) font containing only the ~240 glyphs actually used in the application. This dramatically improves initial page load performance while maintaining full visual fidelity.

## Why Font Subsetting?

**Problem:** The full Nerd Font TTF file contains thousands of glyphs and is ~1.5MB in size. On every page refresh, browsers re-download this large font file, significantly impacting performance, especially on slower connections.

**Solution:** Extract only the glyphs we actually use (icons from `nerdFontIcons.ts`, hardcoded template symbols, and powerline symbols) into a much smaller subset font file.

**Benefits:**
- ⚡ **95% smaller font file** (~50-100KB vs 1.5MB)
- 🚀 **Faster page loads** (especially on mobile/slow connections)
- 💾 **Better caching** (smaller files cached more efficiently)
- 🎯 **Only includes used glyphs** (prevents bloat from unused icons)

## Font Subset Contents

The subset includes three categories of glyphs:

### 1. Icon Definitions (189 icons)
All icons defined in [src/constants/nerdFontIcons.ts](../src/constants/nerdFontIcons.ts):
- UI & Navigation: chevrons, arrows, buttons, etc.
- Programming Languages: Python, Rust, Go, JavaScript, etc.
- Frameworks: React, Vue, Angular, Django, etc.
- Version Control: Git, Mercurial, Fossil, etc.
- Cloud Services: AWS, Azure, Docker, Kubernetes, etc.
- Tools & Utilities: npm, pip, Maven, etc.

### 2. Powerline Symbols (4 glyphs)
Essential structural symbols for segment styling:
- `\ue0b0` - Right-pointing triangle (powerline separator)
- `\ue0b2` - Leading diamond
- `\ue0b4` - Trailing diamond
- `\ue0b6` - Alternative diamond

### 3. Hardcoded Template Unicode (~35 glyphs)
Unicode characters found in segment `defaultTemplate` fields and config templates that are hardcoded (not using the NerdIcon component).

## Generated Files

The subset generation process creates:

1. **`public/fonts/nerd-symbols-subset.woff2`** (primary format)
   - Modern, highly compressed web font format
   - Best compression ratio (~30-40% smaller than TTF)
   - Supported by all modern browsers

2. **`public/fonts/nerd-symbols-subset.ttf`** (fallback format)
   - TrueType format for older browsers
   - Ensures universal compatibility

3. **`public/fonts/subset-manifest.json`** (metadata)
   - Generated timestamp
   - Glyph count
   - Complete list of included unicode ranges
   - Used for validation and debugging

## How to Regenerate the Subset

### Prerequisites

**Python 3.x and fonttools must be installed:**

#### macOS/Linux
```bash
pip3 install fonttools brotli
```

#### Windows
```bash
pip install fonttools brotli
```

#### Using Conda
```bash
conda install -c conda-forge fonttools brotli
```

**Verify installation:**
```bash
pyftsubset --help
```

### Regeneration Process

**When to regenerate:**
- New icons added to [src/constants/nerdFontIcons.ts](../src/constants/nerdFontIcons.ts)
- New segments with hardcoded unicode in templates
- Powerline symbols changed
- Font file updated from upstream

**Command:**
```bash
npm run generate-font-subset
```

**What it does:**
1. Extracts unicode code points from `nerdFontIcons.ts`
2. Scans all segment JSON files for hardcoded unicode in templates
3. Adds powerline structural symbols
4. Downloads the full Nerd Font if not present
5. Generates subset using `pyftsubset` with optimal settings
6. Creates both WOFF2 (primary) and TTF (fallback) formats
7. Generates manifest with metadata

**Expected output:**
```
═══════════════════════════════════════════════════════
   Nerd Font Subset Generator
═══════════════════════════════════════════════════════

✓ fonttools is installed

🔍 Extracting icon unicode points from nerdFontIcons.ts...
✓ Found 189 icon definitions

🔍 Scanning segment templates for hardcoded unicode...
✓ Found 35 hardcoded unicode characters

➕ Adding powerline symbols...
✓ Added 4 powerline symbols

📊 Total unique glyphs: 228

✓ Nerd Font already downloaded
ℹ Original font size: 1543.23 KB

⚙ Generating font subset...
ℹ Including 228 unique glyphs

📦 Creating WOFF2 format...
✓ Generated public/fonts/nerd-symbols-subset.woff2

📦 Creating TTF fallback...
✓ Generated public/fonts/nerd-symbols-subset.ttf

✓ Generated manifest: public/fonts/subset-manifest.json

═══════════════════════════════════════════════════════
✓ Font subset generated successfully!

📊 Size Comparison:
  Original TTF:  1543.23 KB
  Subset WOFF2:  52.18 KB (96.6% smaller)
  Subset TTF:    78.45 KB

📁 Output files:
  /path/to/public/fonts/nerd-symbols-subset.woff2
  /path/to/public/fonts/nerd-symbols-subset.ttf
═══════════════════════════════════════════════════════
```

## Validation and CI

### Pre-commit Hook
A git pre-commit hook automatically validates icon references when segment JSON files are modified:
```bash
# .husky/pre-commit runs:
npm run validate-icons
```

### CI Pipeline
GitHub Actions CI validates:
1. **Icon references** - All icons use valid IDs from `nerdFontIcons.ts`
2. **Font subset exists** - `public/fonts/nerd-symbols-subset.woff2` file is present
3. **Build succeeds** - App builds with local subset fonts

See [.github/workflows/ci.yml](../.github/workflows/ci.yml) for details.

## How It Works in the App

### Font Loading Strategy

**1. Font Declaration ([src/index.css](../src/index.css)):**
```css
@font-face {
  font-family: 'Symbols Nerd Font';
  src: url('/ohmyposh-configurator/fonts/nerd-symbols-subset.woff2') format('woff2'),
       url('/ohmyposh-configurator/fonts/nerd-symbols-subset.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

**2. Font Preloading ([index.html](../index.html)):**
```html
<link rel="preload" 
      href="/ohmyposh-configurator/fonts/nerd-symbols-subset.woff2" 
      as="font" 
      type="font/woff2" 
      crossorigin>
```

**3. Usage in Components:**
```tsx
<NerdIcon id="lang-python" />  // Uses the subset font
```

### Cache Strategy

**Vite Build Configuration ([vite.config.ts](../vite.config.ts)):**
- Content-based hashing for long-term caching
- Fonts placed in `/fonts/` directory with hash: `nerd-symbols-subset-[hash].woff2`
- CSS code splitting enabled for better cache granularity
- Vendor chunks separated for optimal caching

**Result:**
- First visit: Downloads ~50KB subset font once
- Subsequent visits: Font loaded from browser cache
- Updates: Only re-downloaded when font content changes (different hash)

## Troubleshooting

### Missing Glyphs

**Symptom:** Icons appear as empty boxes (□) or question marks (?).

**Causes:**
1. Icon ID not in `nerdFontIcons.ts`
2. Hardcoded unicode not in subset
3. Font subset needs regeneration

**Solution:**
1. Check if icon exists in [docs/nerd-font-icons-reference.md](nerd-font-icons-reference.md)
2. If icon exists but shows as box:
   ```bash
   npm run generate-font-subset
   npm run build
   ```
3. If icon doesn't exist, add it to `nerdFontIcons.ts` first

### fonttools Not Found

**Symptom:** `pyftsubset: command not found`

**Solution:**
```bash
# Install fonttools
pip3 install fonttools brotli

# Verify installation
pyftsubset --help
```

### Subset Generation Fails

**Symptom:** Script errors during subset generation.

**Common causes:**
1. **Original font not found:** Script will auto-download
2. **Invalid unicode ranges:** Check console for specific unicode values
3. **Permission errors:** Ensure write access to `public/fonts/`

**Debug:**
```bash
# Verbose output
npm run generate-font-subset 2>&1 | tee font-subset.log
```

### CI Fails: "Font subset not found"

**Symptom:** GitHub Actions CI fails with missing font error.

**Cause:** Font subset files not committed to repository.

**Solution:**
```bash
# Generate the subset
npm run generate-font-subset

# Add and commit the generated fonts
git add public/fonts/nerd-symbols-subset.*
git commit -m "Update font subset"
git push
```

## Adding New Icons

**Step-by-step process when adding new icons to the app:**

1. **Add icon to `nerdFontIcons.ts`:**
   ```typescript
   'lang-newlang': {
     id: 'lang-newlang',
     name: 'New Language',
     code: 'E999',
     char: '\ue999',
     category: 'Development',
     description: 'New programming language'
   }
   ```

2. **Validate the icon ID:**
   ```bash
   npm run validate-icons
   ```

3. **Regenerate font subset:**
   ```bash
   npm run generate-font-subset
   ```

4. **Test in the app:**
   ```bash
   npm run dev
   # Verify icon appears correctly
   ```

5. **Commit changes:**
   ```bash
   git add src/constants/nerdFontIcons.ts
   git add public/fonts/nerd-symbols-subset.*
   git commit -m "Add new language icon"
   ```

## Performance Metrics

### Before Optimization (CDN Font)
- Font size: ~1.5MB TTF
- Download time (3G): ~8-10 seconds
- Bandwidth per user: 1.5MB
- Cache efficiency: Low (external CDN)

### After Optimization (Subset Font)
- Font size: ~50KB WOFF2, ~78KB TTF
- Download time (3G): ~0.5-1 second
- Bandwidth per user: 50KB (97% reduction)
- Cache efficiency: High (long-term browser cache)

### Real-world Impact
- **Mobile users:** 95% faster font loading
- **Initial page load:** 1.5MB savings
- **Repeat visits:** Font served from cache (0 bytes transferred)
- **SEO:** Improved Lighthouse performance score

## Resources

- **Nerd Fonts:** https://www.nerdfonts.com/
- **fonttools Documentation:** https://fonttools.readthedocs.io/
- **pyftsubset Guide:** https://fonttools.readthedocs.io/en/latest/subset/
- **WOFF2 Compression:** https://www.w3.org/TR/WOFF2/
- **Icon Reference:** [docs/nerd-font-icons-reference.md](nerd-font-icons-reference.md)

## Maintenance

**Regular maintenance tasks:**

1. **Monthly:** Check for Nerd Font updates
   ```bash
   # Download latest font
   rm public/fonts/SymbolsNerdFontMono-Regular.ttf
   npm run generate-font-subset
   ```

2. **When adding features:** Regenerate subset if new icons added

3. **Before releases:** Verify subset is up-to-date
   ```bash
   npm run validate-icons
   npm run generate-font-subset
   npm run build
   ```

---

**Last Updated:** January 2026  
**Subset Version:** 1.0.0  
**Nerd Font Version:** Latest (auto-updated)
