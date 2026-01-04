## Plan: Official Oh My Posh Themes Browser

Add a third "Official Themes" tab to SamplePicker with paginated, image-previewed themes from the Oh My Posh repository. Uses a static manifest with tags, fetches configs on-demand, and displays cropped preview images.

### Steps

1. **Create `public/configs/official/manifest.json`** - Static manifest with `version`, `lastUpdated`, and `themes` array. Each theme includes `name`, `file`, `isMinimal`, `tags` (e.g., `["powerline", "git", "cloud", "rainbow", "dark"]`), and `githubUrl`. Tags enable filtering beyond name search.

2. **Create [src/utils/officialThemeLoader.ts](src/utils/officialThemeLoader.ts)** - Define `OfficialTheme` interface with tags array, implement `loadOfficialThemeManifest()` with caching, and `fetchOfficialTheme(filename)` to download from `https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/{file}`. Parse YAML files using `js-yaml`, add runtime IDs to blocks/segments before returning.

3. **Extend [SamplePicker.tsx](src/components/SamplePicker/SamplePicker.tsx)** - Add `'official'` tab, new state for `officialThemes`, `filteredThemes`, `page`, `searchQuery`. Load manifest when tab becomes active. Filter themes by matching search query against `name` and `tags`. Reset page to 1 on filter change.

4. **Create `OfficialThemeCard` component** - Card with `aspect-video` container using `object-cover` to crop/contain preview image (`https://ohmyposh.dev/img/themes/{name}.png`). Show theme name, tag pills, "No Nerd Font" badge for minimal themes, and GitHub link icon. Use `loading="lazy"` on images and `onError` fallback to placeholder icon.

5. **Add pagination controls** - Display 12 themes per page in responsive grid (2 cols mobile, 3 cols desktop). Prev/Next buttons with "Page X of Y" text. Disable buttons at boundaries.

6. **Create `scripts/fetch-official-themes.js`** - Script to fetch theme filenames from GitHub API, generate manifest with inferred tags (parse "minimal" from name, common patterns like "rainbow", "powerline"), and output to `public/configs/official/manifest.json`. Add npm script `generate:official-themes`.

### File Changes Summary

| File | Change |
|------|--------|
| `public/configs/official/manifest.json` | New - static theme manifest with tags |
| `src/utils/officialThemeLoader.ts` | New - manifest + theme fetching with cache |
| `src/components/SamplePicker/SamplePicker.tsx` | Modify - add official tab, pagination, search |
| `src/components/SamplePicker/OfficialThemeCard.tsx` | New - image card component |
| `scripts/fetch-official-themes.js` | New - manifest generator script |
| `scripts/README.md` | Modify - document new script |
| `package.json` | Modify - add npm script |
| `CHANGELOG.md` | Modify - document feature |
