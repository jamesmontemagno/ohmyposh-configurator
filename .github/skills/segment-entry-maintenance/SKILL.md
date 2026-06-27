---
name: segment-entry-maintenance
description: 'Update and validate Oh My Posh segment entries end-to-end. Use for syncing upstream segment metadata, selecting valid icons, adding preview mock data, updating template preview rendering, enforcing unicode escapes in JSON, and running validation checks (icons, lint, build). Trigger phrases: sync segments, update segment entries, add missing segments, fix preview output, fix icon mapping, update template utils, refresh segment metadata.'
argument-hint: 'What segment types or categories should be updated?'
user-invocable: true
---

# Segment Entry Maintenance

## When To Use
- You synced or added segment types in `public/segments/*.json` and previews look wrong.
- Icon IDs are invalid, generic, or not aligned with desired glyphs.
- New segment templates reference properties that preview does not resolve yet.
- Unicode handling is inconsistent in generated JSON and diffs.

## Inputs
- Segment categories/files to touch (for example: CLI, web, health, system, languages)
- Preferred icon behavior (brand icon, plain symbol, warning vs neutral)
- Whether changes are metadata-only or also require preview logic updates

## Procedure
1. Identify scope and changed segment types.
- Locate updated entries in `public/segments/*.json`.
- Extract segment `type`, `icon`, `defaultTemplate`, and `previewText`.
- Keep this skill project-scoped and apply changes in this repository only.

2. Verify icon IDs before editing.
- Confirm icon IDs exist in `src/constants/nerdFontIcons.ts`.
- If desired glyph is not present, choose the closest existing ID or add a new icon entry intentionally.

3. Update segment metadata in JSON.
- Keep objects valid and ordered consistently with project style.
- Enforce escaped unicode sequences in JSON (strict: do not commit raw unicode glyphs in segment JSON fields that should be escaped).
- Keep `defaultTemplate`, `previewText`, `properties`, and `options` coherent.

4. Add or update preview mock data.
- Add per-type mocks in `src/components/PreviewPanel/mockData.ts` for any new or changed types.
- Ensure mock keys match template fields (for example `.Model.DisplayName`, `.Commands`, `.TaskCount`).

5. Update preview template resolver when needed.
- Edit `src/components/PreviewPanel/templateUtils.tsx` if templates use unsupported patterns.
- Add support for required control structures or functions (for example map `range` loops).
- Add fallback entries in `typeMap` for improved non-template fallback display.

6. Validate end-to-end.
- Run icon validation: `node scripts/validate-icons.js`.
- Run targeted lint for touched files: `npm run lint -- <file1> <file2> ...`.
- Run config validation: `npm run validate`.
- Run full build validation: `npm run build`.

7. Final review checks.
- Confirm no unresolved icon IDs.
- Confirm preview text renders meaningful content for each changed segment.
- Confirm changed templates no longer leave raw template tokens in preview.
- Confirm final behavior in the app through user validation before considering the task done.

## Decision Points
- If icon choice conflicts with visual intent:
  Use template glyphs (for example `\u25b2`) for exact symbol shape and keep icon as neutral/brand marker.
- If preview still shows blanks after mock updates:
  Add missing mock fields first; only then add new resolver logic in `templateUtils.tsx`.
- If template syntax is complex:
  Implement only minimal parser support required by current segment templates.

## Completion Criteria
- All touched segments have valid icon IDs.
- New segment types have mock data entries.
- Preview renderer resolves changed templates for target segments.
- Validation commands succeed without new errors (`validate`, lint, and build).
- User has validated the resulting behavior in-app.

## Typical Command Checklist
```bash
node scripts/validate-icons.js
npm run lint -- src/components/PreviewPanel/mockData.ts src/components/PreviewPanel/templateUtils.tsx
npm run validate
npm run build
```

## Notes
- Use the same icon ID across related segments when consistency is desired (for example matching `cmake` icon behavior).
- Keep fixes incremental: metadata first, mock data second, template resolver third.
