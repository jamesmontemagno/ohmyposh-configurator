import { describe, expect, it } from 'vitest';
import {
  auditSubmissions, compareOfficialGallery, createSchemaValidator, reportFingerprint,
  summarizeSubmissions, validateSubmission,
} from './audit-theme-gallery.mjs';
import { repository, upstreamRepository } from './capture-theme-gallery.mjs';

describe('official gallery inventory', () => {
  it('uses actual theme extensions, ignoring schema and segment files', () => {
    const report = compareOfficialGallery(
      { themes: [{ file: 'one.omp.json' }, { file: 'removed.omp.yml' }] },
      ['schema.json', 'segments.json', 'one.omp.json', 'added.omp.yaml', 'three.omp.yml'],
      ['one.svg'],
    );
    expect(report).toMatchObject({
      localCount: 2, upstreamCount: 3,
      added: ['added.omp.yaml', 'three.omp.yml'], removed: ['removed.omp.yml'],
      missingPreviews: ['removed.omp.yml'],
    });
    expect(report.previewContentParity).toContain('unverified');
  });

  describe('static submission validation and fingerprints', () => {
    const ref = 'a'.repeat(40);
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object', required: ['blocks'],
      properties: { blocks: { type: 'array', minItems: 1, items: {
        type: 'object', properties: { foreground: { type: 'string', minLength: 1 } },
      } } },
    };
    const validation = {
      validateSchema: createSchemaValidator(schema), iconIds: new Set(['misc-star']), communityEntries: [],
    };
    const body = (config = { $schema: 'https://example.invalid/not-fetched', blocks: [{ foreground: '#ffffff' }] }) =>
      `## Theme Details\n\n- **Theme Name:** New Theme\n- **Author:** Author\n- **Description:** Theme\n- **Icon:** misc-star\n- **Tags:** dark\n\n## Configuration\n\n\`\`\`json\n${JSON.stringify(config)}\n\`\`\`\n\n## License Confirmation\n\n- [x] I confirm this configuration is my original work or is properly attributed, and I contribute it under the MIT License.`;
    const issue = (extra = {}) => ({
      number: 1, state: 'open', title: 'Submission', body: body(), labels: [{ name: 'theme:submission' }],
      updated_at: '2026-10-31T00:00:00Z', ...extra,
    });
    const snapshot = (issues = [issue()], pulls = []) => ({
      schemaVersion: 1, repository, upstream: { repository: upstreamRepository, ref },
      startedAt: '2026-10-31T00:00:00Z', capturedAt: '2026-10-31T00:01:00Z',
      issues: { items: issues, pages: 1, complete: true }, pulls: { items: pulls, pages: 1, complete: true },
    });
    const pull = (extra = {}) => ({
      number: 200, state: 'open', title: 'Add a theme', body: 'Closes #1', updated_at: '2026-10-31T00:00:00Z',
      base: { repo: { full_name: repository } }, head: { ref: 'theme-branch' }, ...extra,
    });

    it('never infers approval from valid metadata/schema or valid-looking templates', () => {
      const [pending, invalidApproved] = auditSubmissions(snapshot([
        issue(), issue({ number: 2, body: body({ $schema: 'unused', blocks: [{ foreground: '' }] }),
          labels: [{ name: 'theme:submission' }, { name: 'theme:approved' }] }),
      ]), ref, validation);
      expect(pending).toMatchObject({ approval: 'pending', queue: 'awaiting-approval', schema: { status: 'valid' } });
      expect(invalidApproved).toMatchObject({ approval: 'approved', queue: 'needs-correction-review', schema: { status: 'invalid' } });
      expect(invalidApproved.schema.errors[0].instancePath).toBe('/blocks/0/foreground');
      const template = body({ $schema: 'unused', blocks: [{ template: '{{ exec "do-not-run" }}' }] });
      expect(validateSubmission(template, validation).schema.status).toBe('valid');
    });

    it('reports invalid canonical metadata, missing license, unknown icons and duplicate IDs independently', () => {
      const result = validateSubmission(body().replace('**Theme Name:** New Theme', '**Theme Name: New Theme**')
        .replace('misc-star', 'unknown').replace('[x]', '[ ]'), validation);
      expect(result.metadata.status).toBe('invalid');
      expect(result.metadata.errors.join(' ')).toMatch(/Theme Name.*Icon.*MIT/);
      expect(result.schema.status).toBe('valid');
      expect(validateSubmission(body(), { ...validation, communityEntries: [{ id: 'new-theme' }] })
        .metadata.errors.join(' ')).toContain('already exists');
    });

    it.each([
      ['invalid JSON', () => body().replace('"blocks"', 'not-json')],
      ['metadata wrapper', () => body({ $schema: 'unused', blocks: [{}], name: 'not allowed' })],
      ['missing blocks', () => body({ $schema: 'unused' })],
      ['array config', () => body([])],
      ['duplicate fences', () => body().replace('## License Confirmation', '```json\n{}\n```\n## License Confirmation')],
      ['duplicate section', () => `${body()}\n## Theme Details\n`],
      ['deleted body', () => ''],
    ])('reports %s without pretending validation succeeded', (_name, build) => {
      expect(validateSubmission(build(), validation).metadata.status).toBe('invalid');
    });

    it('does not fetch external schema references or silently accept an invalid schema', () => {
      expect(() => createSchemaValidator({ $ref: 'https://example.invalid/schema' })).toThrow();
      expect(() => createSchemaValidator({ type: 'made-up' })).toThrow();
    });

    it.each([
      { body: 'Closes #1' }, { body: `Source https://github.com/${repository}/issues/1` },
      { body: `Related ${repository}#1` }, { body: null, head: { ref: 'automation/theme-submission-1' } },
    ])('finds existing open PR references or the contribution branch: %j', (extra) => {
      const [row] = auditSubmissions(snapshot([issue()], [pull(extra)]), ref, validation);
      expect(row.existingPullRequests[0].number).toBe(200);
      expect(row.queue).toBe('existing-pr-review');
    });

    it('does not confuse another repository or issue number with a duplicate', () => {
      const [row] = auditSubmissions(snapshot([issue()], [
        pull({ body: 'other/repo#1 https://github.com/other/repo/issues/1 #10' }),
      ]), ref, validation);
      expect(row.existingPullRequests).toEqual([]);
    });

    it('invalidates fingerprints on body, update time, label and PR changes, not recapture time', () => {
      const first = snapshot();
      const report = (capture) => ({ sourceRef: 'b'.repeat(40), upstreamRef: ref,
        submissions: auditSubmissions(capture, ref, validation), capture });
      const baseline = reportFingerprint(report(first));
      expect(reportFingerprint(report({ ...first, capturedAt: '2026-11-01T00:00:00Z' }))).toBe(baseline);
      for (const change of [
        { body: `${body()}\nChanged content` }, { updated_at: '2026-11-01T00:00:00Z' },
        { labels: [{ name: 'theme:submission' }, { name: 'theme:approved' }] },
      ]) expect(reportFingerprint(report(snapshot([issue(change)])))).not.toBe(baseline);
      expect(reportFingerprint(report(snapshot([issue()], [pull()])))).not.toBe(baseline);
      expect(auditSubmissions(snapshot([issue({ body: `${body()}\nChanged` })]), ref, validation)[0].bodyHash)
        .not.toBe(auditSubmissions(first, ref, validation)[0].bodyHash);
    });

    it('rejects incomplete or mismatched provenance instead of reporting an empty queue', () => {
      const incomplete = snapshot();
      incomplete.issues.complete = false;
      expect(() => auditSubmissions(incomplete, ref, validation)).toThrow('Incomplete issues');
      expect(() => auditSubmissions(snapshot(), 'b'.repeat(40), validation)).toThrow('provenance');
      expect(() => auditSubmissions(snapshot([issue(), issue()]), ref, validation)).toThrow('duplicate');
      expect(() => auditSubmissions(snapshot([issue({ labels: null })]), ref, validation)).toThrow('labels');
      expect(() => auditSubmissions(snapshot([issue()], [pull({ base: { repo: { full_name: 'other/repo' } } })]),
        ref, validation)).toThrow('Unexpected PR repository');
    });
  });
  it('does not confuse present previews with verified content parity', () => {
    const report = compareOfficialGallery({ themes: [{ file: 'one.omp.json' }] }, ['one.omp.json'], ['one.svg']);
    expect(report.added).toEqual([]);
    expect(report.removed).toEqual([]);
    expect(report.missingPreviews).toEqual([]);
    expect(report.previewContentParity).toContain('unverified');
  });

  it('fails explicitly on duplicate filenames', () => {
    expect(() => compareOfficialGallery({ themes: [{ file: 'a.omp.json' }, { file: 'a.omp.json' }] }, [], []))
      .toThrow('duplicate filenames');
  });
});

describe('community submission inventory', () => {
  const issue = (number, labels, extra = {}) => ({
    number, state: 'open', labels: labels.map((name) => ({ name })),
    title: 'Untrusted title', html_url: `https://github.com/owner/repo/issues/${number}`,
    updated_at: '2026-10-31T00:00:00Z', ...extra,
  });

  it('keeps approval separate from validation and excludes closed issues and PRs', () => {
    const rows = summarizeSubmissions([
      issue(2, ['theme:submission', 'theme:approved']),
      issue(1, ['theme:submission']),
      issue(3, ['theme:submission'], { state: 'closed' }),
      issue(4, ['theme:submission'], { pull_request: {} }),
      issue(5, ['enhancement']),
    ]);
    expect(rows.map(({ number, approval }) => ({ number, approval }))).toEqual([
      { number: 1, approval: 'pending' }, { number: 2, approval: 'approved' },
    ]);
    expect(rows.every(({ validation }) => validation.startsWith('not evaluated'))).toBe(true);
  });
});
