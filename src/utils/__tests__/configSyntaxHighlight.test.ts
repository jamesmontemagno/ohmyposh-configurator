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

  it('does not treat hashes in YAML quoted strings as comments', () => {
    const tokens = tokenizeConfig('message: "hello # world" # comment', 'yaml');

    expect(tokens).toContainEqual({ value: '"hello # world"', type: 'string' });
    expect(tokens).toContainEqual({ value: '# comment', type: 'comment' });
  });

  it('only recognizes YAML comments when the hash follows whitespace', () => {
    const tokens = tokenizeConfig('branch: feature#123', 'yaml');

    expect(tokens).not.toContainEqual({ value: '#123', type: 'comment' });
  });

  it('distinguishes TOML table names, keys, and string values', () => {
    const tokens = tokenizeConfig('[blocks]\ntype = "prompt"', 'toml');

    expect(tokens).toContainEqual({ value: '[blocks]', type: 'key' });
    expect(tokens).toContainEqual({ value: 'type', type: 'key' });
    expect(tokens).toContainEqual({ value: '"prompt"', type: 'string' });
  });

  it('does not treat hashes in TOML quoted strings as comments', () => {
    const tokens = tokenizeConfig('title = "hello # world" # comment', 'toml');

    expect(tokens).toContainEqual({ value: '"hello # world"', type: 'string' });
    expect(tokens).toContainEqual({ value: '# comment', type: 'comment' });
  });
});
