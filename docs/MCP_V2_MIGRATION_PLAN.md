# MCP TypeScript SDK v2 Migration Plan

## Purpose

Migrate the Oh My Posh Configurator MCP server from the monolithic
`@modelcontextprotocol/sdk` v1 package to the v2 package line implementing the
2026-07-28 MCP specification.

This is a future migration plan. It is intentionally gated on MCP Apps publishing
v2-compatible support so the released package does not mix v1 and v2 SDK
generations.

## Agreed Decisions

| Area | Decision |
| --- | --- |
| Timing | Wait for an MCP Apps release that explicitly supports the v2 package line. |
| Server API | Adopt v2 high-level `McpServer` registration APIs. |
| Transport | Keep the server stdio-only. Do not add Streamable HTTP. |
| Legacy clients | Keep 2025-era client support for at least one release cycle. |
| Manual acceptance | Test VS Code and Copilot CLI. |
| Release | Publish a `next` prerelease before promoting a stable release. |

## Prerequisite: MCP Apps v2

Do not begin implementation until all of these are true:

1. `@modelcontextprotocol/ext-apps` has a documented v2-compatible release.
2. Its peer dependencies accept the v2 MCP client/core package line.
3. Its migration notes cover the API surface used by both shipped apps:
   - `App.connect()`
   - `App.ontoolresult`
   - `App.callServerTool`
   - `App.updateModelContext`
4. It does not require a v1 `Protocol` object in the same browser runtime as the
   v2 stack.

Record the exact MCP Apps, client, server, core, and Zod versions in the
migration pull request.

## Dependency Migration

1. Run the official codemod from the repository root in dry-run mode:

   ```bash
   npx @modelcontextprotocol/codemod@latest v1-to-v2 . --dry-run
   ```

2. Review the codemod's dependency and action-required summary before applying
   any changes.
3. Replace the root dependencies:
   - Remove `@modelcontextprotocol/sdk`.
   - Add `@modelcontextprotocol/server`.
   - Add the compatible MCP Apps v2 package.
   - Add the Zod version required by v2 schemas.
4. Apply the codemod at the repository root, then search for remaining v1
   imports in source, tests, scripts, and documentation.
5. Retain the existing Node 24 environment and `types: ["node"]` in
   `mcp/tsconfig.json`; v2 requires Node 20+ and references Node globals.
6. Regenerate `package-lock.json` only through npm. Confirm the published
   dependency tree has no accidental v1 MCP SDK copy.

## Server Refactor

### Stdio Entry Point

Refactor `mcp/index.ts` into a factory plus a minimal entry point:

```ts
serveStdio(createMcpServer, { legacy: 'serve' });
```

- `createMcpServer()` creates a new `McpServer` per stdio connection.
- Keep all readiness and diagnostics on `stderr`.
- Add SIGINT and SIGTERM cleanup through the returned stdio handle.
- Do not retain protocol-session state outside an individual connection.

### Tools

Replace low-level `ListToolsRequestSchema` and `CallToolRequestSchema` dispatch
with `registerTool` calls for every current tool:

1. `create_configuration`
2. `add_segment`
3. `modify_configuration`
4. `validate_configuration`
5. `export_configuration`
6. `list_segments`
7. `get_segment_info`
8. `list_sample_configs`
9. `load_sample_config`
10. `search_ohmyposh_docs`
11. `get_ohmyposh_segment_docs`
12. `get_ohmyposh_cli_status`
13. `render_live_preview`

For each tool:

- Convert raw JSON Schema definitions to Zod v4 object schemas.
- Preserve required fields, optional fields, enums, descriptions, and numeric
  constraints.
- Use `.describe()` for every user-facing argument.
- Define and return a matching `outputSchema` and `structuredContent`.
- Preserve current text content because both MCP Apps parse text results.
- Return `isError: true` for recoverable user errors.
- Add titles and behavior annotations only when they accurately describe the
  operation.

The local CLI preview must not be marked read-only if evaluating a supplied
configuration can invoke local tooling.

### Resources

Replace resource list/read request dispatch with `registerResource` calls for:

- Config Preview MCP App HTML.
- Segment Explorer MCP App HTML.
- All segment metadata.
- Segment categories.
- Sample configuration metadata.
- Community configuration metadata.

Keep the current `ui://` resource URIs and `ui/resourceUri` metadata extension
unless the MCP Apps v2 migration guide requires a documented replacement.

### Prompts

Replace prompt list/get dispatch with `registerPrompt` calls for:

- `quick_start`
- `troubleshoot`
- `apply_theme`

Define their arguments with Zod `argsSchema` objects and preserve their current
messages.

### Application Logic

Keep the existing application-specific modules intact:

- Segment loader and metadata synchronization.
- Configuration builder, exporter, and validator.
- Segment inference and documentation URL mapping.
- Local Oh My Posh CLI detection and rendering.
- ANSI sanitization.

Extract shared tool response schemas and registration helpers from `mcp/index.ts`
if the v2 conversion would otherwise leave it monolithic.

## Protocol Compatibility

### Modern Clients

`serveStdio(createMcpServer)` is the required v2 entry point for
2026-07-28 stdio negotiation. It enables `server/discover` and per-request
metadata without manually implementing wire protocol behavior.

### Legacy Clients

Keep the default `legacy: 'serve'` setting for one release cycle:

- 2025-era clients continue with `initialize`.
- 2026-era clients use `server/discover` and per-request metadata.

At the end of the compatibility window, decide in a separate major behavior
change whether to retain legacy support or change to `legacy: 'reject'`.

### Deliberate Non-Goals

Do not add the following as part of this migration:

- Streamable HTTP or HTTP+SSE.
- OAuth or bearer authentication.
- Roots, Sampling, or server-initiated elicitation.
- Tasks.
- `resources/subscribe`.
- `subscriptions/listen`.

The server's resources are static during its process lifetime, so subscription
infrastructure is unnecessary. Verify v2's required cache metadata behavior for
registered lists and resources; add explicit cache hints only after confirming an
appropriate freshness policy for bundled metadata.

## MCP Apps Migration

After the v2-compatible MCP Apps package is available:

1. Migrate `mcp/apps/preview/src/app.ts`.
2. Migrate `mcp/apps/segments/src/app.ts`.
3. Verify:
   - Resource delivery and initial tool-result handling.
   - Nested `callServerTool` calls.
   - `updateModelContext`.
   - Export actions.
   - Segment detail loading.
   - Local CLI availability checks and live previews.
4. Preserve existing browser safety properties:
   - Nerd Font assets remain embedded in the single-file app output.
   - ANSI output remains escaped and strips OSC hyperlinks.
   - Live previews remain explicit opt-in.
5. Rebuild both MCP Apps and inspect their generated single-file HTML in a
   supported host.

## Test Plan

### Automated

1. Keep all current unit tests for configuration logic, segment inference,
   documentation URLs, ANSI sanitization, and upstream metadata synchronization.
2. Add v2 in-process integration coverage using `createMcpHandler` and a v2
   client with `versionNegotiation: { mode: 'auto' }`:
   - Assert modern negotiation.
   - Assert tool, resource, and prompt discovery.
   - Assert invalid tool arguments are rejected before callbacks run.
   - Assert structured and text results are both returned.
3. Add legacy integration coverage through a v2 in-memory pair or a client
   pinned to a 2025 protocol revision:
   - Assert legacy negotiation.
   - Assert all existing tool, resource, prompt, and error flows continue to
     work.
4. Add process-level stdio coverage:
   - Build `dist/mcp/index.js`.
   - Start it through v2 `StdioClientTransport`.
   - Test automatic modern negotiation and pinned legacy negotiation.
   - Confirm stdout contains only protocol messages.
5. Retain MCP App tests and add regressions for handling structured and text
   tool results together.
6. Run lint, unit tests, config validation, icon validation, web build, MCP
   build, and protocol smoke tests.

### Manual Acceptance

Test the `next` prerelease in:

- **VS Code:** install the server, list segments, create/edit/export a
  configuration, open both MCP Apps, and generate an opt-in local CLI preview.
- **Copilot CLI:** configure the server, verify tool discovery, configurations,
  resources, prompts, structured output, and local previews.

## Documentation and Release

1. Update `docs/MCP_SERVER.md`, `docs/MCP_EXAMPLES.md`, README installation
   snippets, and `CHANGELOG.md`.
2. Document the v2 protocol support, Node 20+ minimum, and one-release legacy
   compatibility commitment.
3. Update `.github/workflows/publish-mcp-npm.yml`:
   - Publish prerelease versions such as `2.0.0-next.0` with `--tag next`.
   - Publish stable versions with `--tag latest`.
   - Never allow a prerelease to replace `latest`.
4. Publish the first candidate as `mcp-v2.0.0-next.0`.
5. Document prerelease installation:

   ```bash
   npx ohmyposh-configurator@next
   ```

6. Promote to `mcp-v2.0.0` only after VS Code and Copilot CLI acceptance.

## Rollback

- Keep the last v1 stable package version available and document exact version
  pinning.
- If a prerelease fails acceptance, move or remove only the `next` dist-tag;
  do not change `latest`.
- If a stable v2 regression is found, advise affected users to pin the last v1
  stable version while a tested v2 patch is prepared.

## Completion Criteria

- MCP Apps v2 satisfies the prerequisite gate.
- The published dependency graph contains no v1 MCP SDK package.
- `serveStdio(createMcpServer, { legacy: 'serve' })` supports both protocol eras.
- Every existing tool, resource, prompt, MCP App flow, and live CLI preview
  works with text and structured results.
- Modern, legacy, and real-stdio automated coverage passes.
- VS Code and Copilot CLI acceptance passes against the prerelease.
- The npm workflow safely keeps `next` prereleases separate from `latest`.
