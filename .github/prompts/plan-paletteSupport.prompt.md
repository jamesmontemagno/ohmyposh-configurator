## Plan: Implement Oh My Posh Palette Support

Add full support for Oh My Posh's `palette` and `palettes` features, enabling users to define reusable color variables (e.g., `p:shell-color`) referenced throughout segments. Also support schema-defined named colors with placeholder patterns for context-dependent ones, and provide palette key autocomplete in template fields. Palette management lives in a dedicated popup dialog.

### Steps

1. **Create palette resolver utility** in [src/utils/paletteResolver.ts](src/utils/paletteResolver.ts) — implement `resolvePaletteColor(color, palette)` matching `^p:.*$` pattern; add `getActivePalette(config, selectedPaletteName?)` merging base `palette` with selected `palettes.list` entry; add `isPaletteReference(color)`, `isNamedColor(color)`, `isContextDependentColor(color)` helpers; define `NAMED_COLORS` constant with CSS mappings where possible; define `CONTEXT_DEPENDENT_COLORS` array (`parentBackground`, `parentForeground`, `background`, `foreground`, `accent`) returning special marker for placeholder rendering.

2. **Update preview color resolution** in [SegmentPreview.tsx](src/components/PreviewPanel/SegmentPreview.tsx) — call `getActivePalette()` with selected palette name from store; use resolver for all color properties; for context-dependent colors, render with diagonal stripe pattern or dotted border + inherit icon; add tooltip explaining "This color inherits from adjacent segment at runtime"; show warning indicator when `p:` reference is unresolved.

3. **Extend inline color parsing** in [templateUtils.tsx](src/components/PreviewPanel/templateUtils.tsx) — update `parseInlineColors` to match `<p:key-name>` tags alongside `<#RRGGBB>`, resolving via passed palette parameter.

4. **Add palette store actions** in [configStore.ts](src/store/configStore.ts) — add `setPalette(palette)`, `setPaletteColor(key, value)`, `removePaletteColor(key)`, `setPalettes(palettes)`, `setPalettesTemplate(template)`, `setPalettesListEntry(name, palette)`, `removePalettesListEntry(name)`, and `setPreviewPaletteName(name)` for preview selection.

5. **Create PaletteEditorDialog component** in [src/components/PaletteEditorDialog/](src/components/PaletteEditorDialog/) — modal dialog with:
   - Main `palette` section: key/swatch/hex list with add/edit/delete, color picker
   - Collapsible `palettes` section: freeform `template` input with documentation tooltip, tabbed/accordion `list` entries each with their own key/value editor
   - Preview palette selector dropdown (for multi-palette preview)

6. **Enhance ColorInput component** in [ColorInput.tsx](src/components/PropertiesPanel/ColorInput.tsx) — add three-mode selector: Direct Hex / Named Color / Palette Reference; in Named Color mode show dropdown with swatches (static colors) or placeholder icons (context-dependent); in Palette mode show dropdown of available keys with color swatches; display resolved color preview; validate palette key exists.

7. **Add palette key autocomplete to template editor** in [SegmentProperties.tsx](src/components/PropertiesPanel/SegmentProperties.tsx) or create `TemplateInput` component — detect `<p:` typing pattern in template fields; show dropdown of available palette keys; insert selected key completing `<p:key-name>` syntax.

8. **Add palette dialog trigger** — add "🎨 Palette" button in [Header.tsx](src/components/Header/Header.tsx) that opens `PaletteEditorDialog`; show badge with palette entry count when palette is non-empty.
