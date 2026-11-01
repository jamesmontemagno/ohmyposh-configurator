# Scripts

This directory contains utility scripts for the Oh My Posh Configurator project.

## audit-theme-gallery.mjs

Read-only JSON inventory of official theme filename drift, missing gallery previews,
and open community submissions. It does not execute templates, update catalogs,
approve issues or create pull requests. The CLI can be run locally; the proposed
workflow extension below reuses the existing weekly completion instead of adding a cron.

```bash
node scripts/audit-theme-gallery.mjs \
  --upstream-dir=../oh-my-posh \
  --upstream-ref=<40-character-commit-sha> \
  --submissions-file=../submissions.json
```

The upstream checkout HEAD must match the supplied immutable ref. Theme names are
read from that commit's `themes/` tree, not from segment metadata or the schema.
The schema is read with `git show` from the same commit, never from a submitted URL.
The optional submissions file is a captured, paginated GitHub REST issues array;
this legacy mode reports labels only and its caller owns capture time/completeness.
Use `--snapshot-file` instead for static validation and PR checks. Approval labels
are reported, not inferred from a valid-looking config. Preview existence does not prove source
parity: older official manifest entries have no recorded preview content hashes.
Use the existing approved-contribution and preview workflows as writers, not this audit.

### Weekly read-only audit extension (local review patch; not activated)

Owner-approved local implementation lives in `.github/workflows/generate-theme-previews.yml`,
with capture in `scripts/capture-theme-gallery.mjs`. After separately authorized publication,
its `workflow_run: completed` listener would follow the existing Monday 02:07 UTC
`Weekly Oh My Posh Segment Synchronization`, including setup failures. It requires the exact
repository, workflow ID `325089338`, lock path, `main` default/head branch, scheduled
predecessor and first run attempt. It does not dispatch or rerun that workflow.
The job and capture script both enforce the event boundary.

The audit checks out the trusted default-branch `github.sha`, **not** predecessor/head-PR
code, with persisted credentials disabled. It resolves upstream `main` once, checks out that
immutable SHA as data only, and never runs upstream code or renders submissions.
Its token has only `contents: read`, `issues: read`, and `pull-requests: read`.
The workflow has no inherited write grants. The pre-existing writer has its original
write grants, steps and push/manual paths, but is explicitly unreachable from **every**
`workflow_run` event. No new writer or scheduler is introduced.

Capture uses authenticated `gh api --method GET` on the upstream commit and paginated
open labeled issues/open PRs (100 per page, maximum 100 pages, ascending creation order).
API/JSON errors, duplicate numbers during pagination, incomplete snapshots, invalid refs,
missing inputs and schema compilation failures fail explicitly. The limit is a failed
capture, not a truncated successful report. Pagination is not transactional; re-read
labels, body/update hashes and PRs before any later promotion.

The snapshot file is intermediate, not uploaded. The JSON report artifact contains refs,
raw schema/input SHA-256 hashes, canonical manifest hashes, source worktree state,
capture times/page counts, official drift/missing previews and each submission's labels,
body/update/config hashes, metadata/schema findings and existing open-PR references.
Ajv validates Draft 2020-12 synchronously without network schema loading; `format`
annotations are not asserted (upstream's custom color pattern still is). Configs must
also satisfy the contribution workflow's object/blocks/no-metadata-wrapper rules.
Metadata uses canonical `- **Field:** value` lines and the checked MIT acknowledgement.
Formatting deviations are human-review findings, not proof the existing agent would reject them.
Passing validation never grants `theme:approved`, creates files or renders a template.

```bash
# In the guarded workflow, with its normal GitHub event environment and read-only GH_TOKEN:
node scripts/capture-theme-gallery.mjs > "$RUNNER_TEMP/gallery-snapshot.json"
node scripts/audit-theme-gallery.mjs \
  --upstream-dir=.gallery-upstream \
  --upstream-ref=<captured-40-character-sha> \
  --snapshot-file="$RUNNER_TEMP/gallery-snapshot.json" > "$RUNNER_TEMP/gallery-audit.json"

npm run test:run -- scripts/audit-theme-gallery.test.mjs scripts/capture-theme-gallery.test.mjs
```

Watermark: repository/upstream commits, schema/tooling/manifest hashes and canonical
submission/PR data form `fingerprint`, excluding capture time and predecessor ID.
Body, update timestamp, labels and referenced PR changes invalidate it. Keep the last
reviewed fingerprint and revisit on changes, missing previews, invalid submissions,
approval changes or capture failures; unchanged queues need no new issue/comment.
No automatic prior-artifact retrieval or persistent dedup store is introduced.
Predecessor rerun attempts are skipped; exact duplicate completion deliveries or audit
reruns may regenerate the same fingerprint, but never invoke a writer. Artifacts are
scoped to predecessor ID, audit attempt and fingerprint, retained 30 days. This consciously
uses content-addressed review deduplication rather than extra Actions read permissions
or downloading previous potentially untrusted artifacts.

Local event/permission truth-table tests exercise the actual YAML guard strings and both
successful/failed predecessors; they are not hosted activation evidence. The workflow
extension is unpushed and unactivated in this delivery. Publication/activation/dispatch
remain separately gated. Existing AW/compiler/Auto-model access blockers are independent
of this non-agentic audit and are not changed or retried by it.

### Accessible official theme preview provenance

`jandedobbeleer-accessible.omp.json` was added from upstream commit
`b4d54a5cb40b1c37868fb5a9ace380cb2b6a9e99`.
Its config SHA-256 is `39ef14eff771712fda5901f91fa4eb5b4694fb50d0b629ba37c9fad450f2a109`.
The preview uses the existing generator's image flags, repository studio data
(SHA-256 `1a67e716ce805fdf2f94e09c3a39c115f66deb71dd0f9a1d31ec1761037b433d`),
and Oh My Posh v30.0.0 Linux amd64
(SHA-256 `0d2c218a1e02c0fa0d3b44edbc8bcbe65fb87df96598a9e9aca4f412a0cf2645`),
with `--data-only`. This is a recorded-data SVG, not a live-shell execution test.
The gallery retains its existing live-main theme fetching convention.

The segment audit maps upstream `agents/` documentation to the existing `cli`
display category. Moving documentation must not classify supported runtime IDs
as removals; UI and MCP documentation links use the upstream `agents/` paths.

## create-theme-contribution.mjs

The community ingestion writer uses standard Actions in
`.github/workflows/create-theme-contribution-pr.yml`. It replaces the broken
community agentic `.md`/`.lock.yml` pair, which is removed to prevent two ingestion
writers or accidental regeneration of the obsolete path. The weekly segment
agentic source, lock, model configuration and cloud setup are unchanged.

After installation on `main`, a maintainer applying `theme:approved` to an open
`theme:submission` triggers ingestion. There is no automatic approval. For labels
already applied, or corrections after a failed run, a maintainer can run the workflow
manually on `main` with `issue_number`. No scheduler, automatic retry or dispatch of
other workflows is added. This change does not itself replay existing approvals.

The job verifies the triggering actor's current write/maintain/admin permission
(including the actor requesting a rerun), live labels/state/content, trusted main
SHA and all paginated open PR references. Stale main or submission state fails
explicitly. It reuses the static audit validator against schema commit
`b4d54a5cb40b1c37868fb5a9ace380cb2b6a9e99`, fetched as data only. Neither a
submitted schema URL nor a template is executed. Canonical metadata lines and a
checked MIT acknowledgement are required; format corrections need human review.

`prepare` writes exactly a new community JSON and the sorted manifest into the
ephemeral checkout; tags are trimmed/de-duplicated and existing manifest fields
are preserved. `npm run validate` must succeed before `publish`. Publication
rechecks actor/labels/content/main/PRs and the prepared file contents, uses a
bounded two-file Git tree, creates a stable `automation/theme-submission-<number>`
branch and one draft PR linking (not closing) the issue. Existing open PRs are
no-ops; an existing branch without an open PR fails for manual recovery rather
than force-pushing or blindly repeating uncertain publication. A final recheck
precedes branch creation; a race after that check still requires human PR review.

The writer is serialized with `community-theme-manifest-writer`, never auto-merges,
and does not render previews. Separate PRs may need conflict resolution if other
community manifest changes merge first. GitHub concurrency can replace older
pending runs in a burst of approvals; recover those issues using the explicit
manual retry, not a competing writer. Future human merges use the existing preview
workflow's push path; this script never dispatches it.

Permissions are `contents: write`, `issues: read`, `pull-requests: write`; no issue
comments, label writes or model credits are needed. Validation/access/API errors
fail visibly in Actions logs rather than posting a success-shaped result. Repository
policy must permit Actions to create PRs. PRs created with `GITHUB_TOKEN` do not
automatically trigger downstream `pull_request` workflows: maintainers must ensure
required checks are run using their authorized review process before merging.
Do not substitute a broader token or change repository settings silently.

Tests mock all mutations; no publication, approval or hosted dispatch is required
for local validation:

```bash
npm run test:run -- scripts/create-theme-contribution.test.mjs \
  scripts/audit-theme-gallery.test.mjs scripts/capture-theme-gallery.test.mjs
actionlint -shellcheck= .github/workflows/create-theme-contribution-pr.yml
```

`create-theme-contribution.mjs prepare|publish` is the workflow entrypoint, not a
local dry-run command. It expects the normal GitHub event environment,
`THEME_ACTOR`, `THEME_PLAN`, and an authorized `GH_TOKEN`; **publish makes external
writes**. Use exported pure functions and mocked tests for local analysis.

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

## fetch-official-themes.mjs

Fetches theme filenames from the Oh My Posh GitHub repository and generates a manifest file with inferred tags for each theme.

### What it does:

- 🔍 Fetches the list of theme files from the official Oh My Posh repository
- 🏷️ Infers tags based on theme names (e.g., "catppuccin", "powerline", "minimal")
- 📋 Generates `public/configs/official/manifest.json` with theme metadata
- ✨ Identifies "minimal" themes that don't require Nerd Fonts

### Usage:

```bash
npm run generate:official-themes
```

### When to run:

- When you want to update the official themes list with new themes from the Oh My Posh repository
- Periodically to keep the manifest in sync with upstream changes

### Output:

The script creates/updates `public/configs/official/manifest.json` with:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-04T00:00:00Z",
  "themes": [
    {
      "name": "agnoster",
      "file": "agnoster.omp.json",
      "isMinimal": false,
      "tags": ["powerline", "git", "classic"],
      "githubUrl": "https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/themes/agnoster.omp.json"
    }
  ]
}
```

### Tag inference:

The script automatically infers tags based on theme name patterns:

| Pattern | Tags Added |
|---------|-----------|
| `minimal` | `minimal`, `nerd-font-free` |
| `catppuccin` | `catppuccin` |
| `dracula` | `dracula` |
| `gruvbox` | `gruvbox` |
| `tokyo` | `tokyo-night` |
| `dark`, `night` | `dark` |
| `light` | `light` |
| `azure` | `cloud`, `azure` |
| `rainbow`, `unicorn` | `colorful`, `rainbow` |

## segment-upstream-sync.mjs

Validates every official Oh My Posh segment documentation page against the local metadata catalog. The generated report identifies runtime IDs, documented default templates and options, cache recommendations, and segments that are missing locally or no longer documented upstream.

### Usage

```bash
# Compare against the current upstream main branch
npm run segments:sync:upstream

# Make a reproducible online comparison against a specific commit or tag
npm run segments:sync:upstream -- --upstream-ref=<commit-or-tag>

# Compare against a local Oh My Posh checkout, including a future submodule
npm run segments:sync:upstream -- --upstream-dir=vendor/oh-my-posh
```

The script writes `docs/segment-upstream-sync-report.md`. A local checkout is optional: keeping the default remote mode avoids adding the full Oh My Posh repository to every clone, while `--upstream-dir` supports a pinned checkout or submodule when a reproducible source snapshot is required.
