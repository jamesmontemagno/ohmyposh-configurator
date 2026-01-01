# Segment JSON Migration

## What Changed

The segment metadata has been refactored from a single large TypeScript file (`src/data/segments.ts` with 960 lines) into separate JSON files organized by category in `public/segments/`.

## Benefits

1. **Better Maintainability**: Each category is in its own file, making it easier to find and edit segments
2. **Reduced Bundle Size**: Segments are loaded on-demand rather than bundled in the main JavaScript
3. **Easier Contributions**: Non-developers can add segments by editing JSON files without TypeScript knowledge
4. **Performance**: Only loads segments as needed, reducing initial load time
5. **Cleaner Codebase**: Separates data from logic

## File Structure

```
public/segments/
├── README.md         # Documentation for adding segments
├── system.json       # 14 segments (battery, path, os, shell, etc.)
├── scm.json         # 8 segments (git, svn, mercurial, etc.)
├── languages.json   # 26 segments (node, python, go, rust, etc.)
├── cloud.json       # 12 segments (aws, azure, gcp, k8s, etc.)
├── cli.json         # 30 segments (npm, docker, kubectl, etc.)
├── web.json         # 7 segments (spotify, ip, weather, etc.)
├── music.json       # 3 segments (spotify, ytm, lastfm)
└── health.json      # 3 segments (nightscout, strava, withings)
```

## Technical Implementation

### New Files

- **`src/utils/segmentLoader.ts`**: Dynamic loader with caching
  - `loadSegmentCategory(category)` - Load segments for a specific category
  - `loadAllSegments()` - Load all segments from all categories
  - `getSegmentMetadata(type)` - Get metadata for a specific segment type
  - `getSegmentsByCategory(category)` - Get all segments in a category
  - `preloadSegments()` - Preload all segments for better UX

- **`public/segments/*.json`**: Segment metadata by category
  - Simple JSON structure: type, name, description, icon, defaultTemplate
  - Colors are applied automatically from `colorSchemes.ts`
  - Alphabetically sorted within each category

### Modified Files

- **`src/data/segments.ts`**: Stripped down to just category definitions
  - Removed 900+ lines of segment definitions
  - Kept `segmentCategories` array for UI
  - Added comment directing to segmentLoader

- **`src/components/SegmentPicker/SegmentPicker.tsx`**: Updated to use dynamic loading
  - Added `useEffect` hook to load segments on mount
  - Loads all categories in parallel
  - Shows loading state while fetching
  - Caches segments in component state

- Updated imports in:
  - `src/components/PropertiesPanel/PropertiesPanel.tsx`
  - `src/components/Canvas/Canvas.tsx`
  - `src/components/Canvas/SegmentCard.tsx`
  - `src/components/PreviewPanel/PreviewPanel.tsx`

## Usage

### Loading Segments

```typescript
import { loadSegmentCategory, loadAllSegments } from './utils/segmentLoader';

// Load a specific category
const systemSegments = await loadSegmentCategory('system');

// Load all segments
const allSegments = await loadAllSegments();

// Get metadata for a specific segment (from cache)
const gitMetadata = getSegmentMetadata('git');
```

### Adding New Segments

1. Open the appropriate JSON file in `public/segments/`
2. Add your segment object:
   ```json
   {
     "type": "segment-type",
     "name": "Display Name",
     "description": "Brief description",
     "icon": "lang-python",
     "defaultTemplate": " {{ .Property }} "
   }
   ```
3. Keep segments alphabetized by name
4. Colors are applied automatically based on category

## Migration Stats

- **Before**: 1 file, 960 lines, ~35KB
- **After**: 8 JSON files, ~16KB total
- **Segments**: 103 segments across 8 categories
- **Build size reduction**: ~19KB in source (loaded dynamically at runtime)

## Testing

All TypeScript errors resolved and build successful:
```
✓ 1687 modules transformed.
dist/assets/index-5fgllrL8.js   1,321.00 kB │ gzip: 272.76 kB
✓ built in 1.96s
```

## Next Steps

- Consider adding segment icons to JSON files
- Add segment search/filter by tags
- Implement segment versioning
- Add validation for segment JSON structure
