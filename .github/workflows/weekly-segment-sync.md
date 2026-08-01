---
description: "Weekly Oh My Posh segment metadata synchronization"
on:
  schedule: weekly on monday
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: read
  copilot-requests: write

engine:
  id: copilot

network: defaults

tools:
  bash:
    - "npm ci"
    - "npm run segments:sync:upstream -- --scope=all --cadence=weekly --strictness=report"
    - "npm run segments:sync:upstream -- --scope=all --cadence=weekly --strictness=report-and-fix"
    - "npm run validate"
    - "npm run lint"
    - "npm run test:run"
    - "npm run build"
    - "node scripts/validate-icons.js"
    - "git status --short"
    - "git diff --check"
    - "git diff -- public/segments docs/segment-upstream-sync-report.md src/components/PreviewPanel"

safe-outputs:
  create-pull-request:
    title-prefix: "[segment-sync] "
    draft: true
    max: 1
    fallback-as-issue: false
    if-no-changes: ignore
    allowed-branches:
      - "automation/segment-sync-*"
    max-patch-files: 30
    max-patch-size: 1024

timeout-minutes: 30
max-turns: 50
max-daily-ai-credits: 2000
---

# Weekly Oh My Posh Segment Synchronization

Maintain `public/segments/` against the official Oh My Posh segment documentation.

## Procedure

1. Run `npm ci`.
2. Run the report-only upstream audit:
   ```bash
   npm run segments:sync:upstream -- --scope=all --cadence=weekly --strictness=report
   ```
3. Run the safe automatic synchronization:
   ```bash
   npm run segments:sync:upstream -- --scope=all --cadence=weekly --strictness=report-and-fix
   ```
4. Review `docs/segment-upstream-sync-report.md` and the working-tree diff.
5. For each newly added or changed segment, ensure:
   - its runtime ID matches the documented sample configuration;
   - its icon ID exists in `src/constants/nerdFontIcons.ts`;
   - preview mock data exists in `src/components/PreviewPanel/mockData.ts`;
   - the template gallery's `public/configs/samples/all-segments.json` includes the type;
   - generated JSON preserves escaped Unicode.
6. Do not bulk overwrite intentional configurator presentation defaults solely because their colors, spacing, or descriptions differ from upstream samples. Apply only verified runtime-ID, template, property, option, cache, and missing-segment updates.
7. Run `node scripts/validate-icons.js`, `npm run validate`, `npm run lint`, `npm run test:run`, and `npm run build`.

## Pull Request Policy

- If no source, metadata, preview, gallery, or report files changed after the audit, stop without creating a pull request.
- If validated changes exist, create exactly one draft PR from a branch named `automation/segment-sync-<yyyy-mm-dd>`.
- Use title: `Sync Oh My Posh segment metadata`.
- In the PR body, summarize added, removed, and changed runtime IDs; identify anything left for manual review; and list the validation commands run.
- Do not modify files outside the segment catalog, preview support, all-segments gallery, sync report, or changelog.
