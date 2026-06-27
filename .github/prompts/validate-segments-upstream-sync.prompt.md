---
name: Validate Segments Against Upstream
argument-hint: Optional scope (all|changed), optional cadence (weekly|monthly), optional strictness (report|report-and-fix)
description: Validate local public/segments metadata against live Oh My Posh sources and produce a reliable update report with actionable changes.
agent: agent
model: GPT-5.4 (copilot)
---
Validate this workspace's local segment catalog against current live Oh My Posh data and produce a repeatable maintenance result.

## Inputs
- Local segment source: public/segments/
- Optional user arguments:
  - scope: all (default) or changed
  - cadence: weekly (default) or monthly
  - strictness: report (default) or report-and-fix

If arguments are missing, use defaults.

## Objective
Ensure this repo's segment metadata stays aligned with upstream Oh My Posh and can be updated on a regular cadence with low risk.

## Required Workflow
1. Build local inventory:
- Parse all segment metadata files under public/segments/.
- Produce normalized inventory by segment type with: category, name, defaultTemplate, properties, options, and defaultCache.

2. Discover upstream truth sources:
- Use the official Oh My Posh repository and official docs as live sources.
- Prefer source-of-truth files over blog posts or third-party mirrors.
- Record exact upstream file paths or URLs used for each comparison.

3. Compare and classify drift:
- Identify NEW segments upstream but missing locally.
- Identify REMOVED/renamed segments locally that no longer exist upstream.
- Identify CHANGED fields for shared segments:
  - template defaults
  - properties
  - options (type/default/allowed values/description)
  - cache recommendations
- Classify each difference as: high confidence, medium confidence, or needs manual review.

4. Reliability checks:
- Flag cases where upstream data is ambiguous or inconsistent between repo and docs.
- For ambiguous cases, include evidence and a suggested verification step.
- Never silently overwrite local metadata when confidence is below high.

5. Output artifacts:
- Create or update docs/segment-upstream-sync-report.md with:
  - Summary metrics
  - Drift table (one row per segment)
  - Proposed change set grouped by Added/Changed/Removed
  - Confidence and evidence links for each change
  - Manual review queue
- If strictness=report-and-fix, apply safe high-confidence updates to public/segments/ and list files changed.

6. Validation gates (always run after report or fixes):
- Run segment/config validation scripts already present in this repo.
- Report pass/fail and include concise error excerpts.

7. Cadence plan:
- Add a short recurring maintenance checklist at the bottom of docs/segment-upstream-sync-report.md:
  - Trigger cadence
  - Commands to run
  - Expected outputs
  - Rollback guidance

## Output Format (in chat)
Return exactly these sections in order:
1. Upstream Sources Used
2. Inventory Summary
3. Drift Findings
4. Proposed Changes
5. Applied Changes (only when strictness=report-and-fix)
6. Validation Results
7. Cadence Checklist
8. Risks and Manual Review

## Quality Constraints
- Be deterministic: same inputs should produce materially similar findings.
- Prefer explicit evidence links over assumptions.
- Keep edits minimal and focused on segment correctness.
- Preserve existing repository conventions and changelog expectations.
