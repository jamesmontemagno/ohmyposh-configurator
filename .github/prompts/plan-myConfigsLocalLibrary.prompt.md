## Plan: My Configs - Local Config Library

Add a "My Configs" feature that lets users save, name, and manage multiple configurations locally using IndexedDB. Includes auto-save drafts, export/import bundles, and a 50 config limit.

### Steps

1. **Install `idb-keyval`** - Add lightweight IndexedDB wrapper (~600B) via `npm install idb-keyval`. Provides simple `get`/`set`/`del` API for config storage.

2. **Define types in [src/types/ohmyposh.ts](src/types/ohmyposh.ts)** - Add `SavedConfig` interface with `id`, `name`, `description?`, `config: OhMyPoshConfig`, `createdAt`, `updatedAt`, `tags?[]`. Add `SavedConfigsBundle` for export/import with `version`, `exportedAt`, `configs[]`.

3. **Create [src/store/savedConfigsStore.ts](src/store/savedConfigsStore.ts)** - Zustand store with `configs: SavedConfig[]`, `draftConfig: OhMyPoshConfig | null`, `lastLoadedId: string | null`. Actions: `loadFromStorage()`, `saveConfig()`, `updateConfig()`, `deleteConfig()`, `loadConfig()`, `duplicateConfig()`, `renameConfig()`, `saveDraft()`, `clearDraft()`, `exportAllConfigs()`, `importConfigsBundle()`. Enforce 50 config limit in `saveConfig()`.

4. **Implement auto-save draft** - Subscribe to `configStore` changes with debounce (5 seconds). Save current config as draft in IndexedDB under separate key. On app load, check for draft and prompt user to restore or discard. Clear draft when user explicitly saves or loads a config.

5. **Add "Save" button to [Header.tsx](src/components/Header/Header.tsx)** - Button near Reset opens `SaveConfigDialog`. Show save icon with unsaved indicator dot when changes detected vs. `lastLoadedId` config.

6. **Create `SaveConfigDialog` component** - Modal with name input (required), description textarea, optional tags. Validates duplicate names and 50 config limit. Shows "Save" vs "Save as New" when editing existing. Error message if limit reached.

7. **Extend [SamplePicker.tsx](src/components/SamplePicker/SamplePicker.tsx)** - Add `'my-configs'` as first tab. Header shows config count ("12/50") and "Export All" / "Import" buttons. Display saved configs as cards sorted by `updatedAt`. Empty state prompts saving first config.

8. **Create `SavedConfigCard` component** - Card with name, description preview, "Updated X ago" timestamp, tags. Primary Load button, overflow menu with Rename, Duplicate, Delete (with confirmation). Highlight if `id === lastLoadedId`.

9. **Add draft recovery UI** - On app load, if draft exists and differs from last saved, show toast/banner: "Unsaved changes recovered" with Restore and Discard buttons. Store draft separately from explicit saves.

10. **Add bundle export/import** - "Export All" downloads `my-configs-backup.json` with all saved configs. "Import" accepts JSON file, validates structure, merges with existing (skip duplicates by name or prompt for overwrite), respects 50 limit.

### File Changes Summary

| File | Change |
|------|--------|
| `package.json` | Add `idb-keyval` dependency |
| `src/types/ohmyposh.ts` | Add `SavedConfig`, `SavedConfigsBundle` interfaces |
| `src/store/savedConfigsStore.ts` | New - Zustand store with IndexedDB + draft logic |
| `src/components/Header/Header.tsx` | Add Save button with unsaved indicator |
| `src/components/SaveConfigDialog/SaveConfigDialog.tsx` | New - save/rename dialog |
| `src/components/SaveConfigDialog/index.ts` | New - re-export |
| `src/components/SamplePicker/SamplePicker.tsx` | Add "My Configs" tab with export/import |
| `src/components/SamplePicker/SavedConfigCard.tsx` | New - saved config card |
| `src/components/DraftRecoveryBanner/DraftRecoveryBanner.tsx` | New - draft restore prompt |
| `src/App.tsx` | Add DraftRecoveryBanner, initialize savedConfigsStore |
| `CHANGELOG.md` | Document feature |

### Further Considerations

1. **Merge strategy on import?** When importing a bundle with duplicate names, should we: (A) skip duplicates, (B) auto-rename with suffix "(2)", or (C) prompt user per conflict?
