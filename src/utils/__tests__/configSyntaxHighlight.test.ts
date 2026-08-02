import { describe, expect, it } from 'vitest';
import { tokenizeConfig } from '../configSyntaxHighlight';

describe('tokenizeConfig', () => {
  it('distinguishes JSON keys, values, and punctuation', () => {
    const tokens = tokenizeConfig('{"version": 4, "enabled": true}', 'json');

    expect(tokens).toContainEqual({ value: '"version"', type: 'key' });
    expect(tokens).toContainEqual({ value: '4', type: 'number' });
    expect(tokens).toContainEqual({ value: 'true', type: 'boolean' });
    expect(tokens).toContainEqual({ value: '{', type: 'punctuation' });
  });

  it('distinguishes YAML keys, strings, and comments', () => {
    const tokens = tokenizeConfig('version: 4 # current schema', 'yaml');

    expect(tokens).toContainEqual({ value: 'version', type: 'key' });
    expect(tokens).toContainEqual({ value: '4', type: 'number' });
    expect(tokens).toContainEqual({ value: '# current schema', type: 'comment' });
  });

  it('distinguishes TOML table names, keys, and string values', () => {
    const tokens = tokenizeConfig('[blocks]\ntype = "prompt"', 'toml');

    expect(tokens).toContainEqual({ value: '[blocks]', type: 'key' });
    expect(tokens).toContainEqual({ value: 'type', type: 'key' });
    expect(tokens).toContainEqual({ value: '"prompt"', type: 'string' });
  });
});
