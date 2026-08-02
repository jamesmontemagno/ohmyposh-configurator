import type { ExportFormat } from '../types/ohmyposh';

export type ConfigTokenType =
  | 'plain'
  | 'key'
  | 'string'
  | 'number'
  | 'boolean'
  | 'comment'
  | 'punctuation';

export interface ConfigToken {
  value: string;
  type: ConfigTokenType;
}

function addToken(tokens: ConfigToken[], value: string, type: ConfigTokenType): void {
  if (value) tokens.push({ value, type });
}

function tokenizeScalar(value: string): ConfigToken[] {
  const tokens: ConfigToken[] = [];
  const pattern = /("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([[\]{},])/g;
  let position = 0;

  for (const match of value.matchAll(pattern)) {
    addToken(tokens, value.slice(position, match.index), 'plain');
    addToken(
      tokens,
      match[0],
      match[1] || match[2]
        ? 'string'
        : match[3]
          ? 'number'
          : match[4]
            ? 'boolean'
            : 'punctuation'
    );
    position = (match.index ?? 0) + match[0].length;
  }

  addToken(tokens, value.slice(position), 'plain');
  return tokens;
}

function tokenizeJson(content: string): ConfigToken[] {
  const tokens: ConfigToken[] = [];
  const pattern = /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],:])/g;
  let position = 0;

  for (const match of content.matchAll(pattern)) {
    addToken(tokens, content.slice(position, match.index), 'plain');
    addToken(
      tokens,
      match[0],
      match[1]
        ? 'key'
        : match[2]
          ? 'string'
          : match[3]
            ? 'number'
            : match[4]
              ? 'boolean'
              : 'punctuation'
    );
    position = (match.index ?? 0) + match[0].length;
  }

  addToken(tokens, content.slice(position), 'plain');
  return tokens;
}

function tokenizeLines(content: string, tokenizeLine: (line: string) => ConfigToken[]): ConfigToken[] {
  return content.split('\n').flatMap((line, index, lines) => [
    ...tokenizeLine(line),
    ...(index < lines.length - 1 ? [{ value: '\n', type: 'plain' as const }] : []),
  ]);
}

function tokenizeYamlLine(line: string): ConfigToken[] {
  if (line.trimStart().startsWith('#')) return [{ value: line, type: 'comment' }];

  const match = line.match(/^(\s*(?:-\s+)?)([^:#][^:]*?)(\s*:)(.*)$/);
  if (!match) return tokenizeScalar(line);

  const [, prefix, key, separator, value] = match;
  const commentIndex = value.indexOf('#');
  const scalar = commentIndex === -1 ? value : value.slice(0, commentIndex);
  const comment = commentIndex === -1 ? '' : value.slice(commentIndex);

  return [
    { value: prefix, type: 'plain' },
    { value: key, type: 'key' },
    { value: separator, type: 'punctuation' },
    ...tokenizeScalar(scalar),
    ...(comment ? [{ value: comment, type: 'comment' as const }] : []),
  ];
}

function tokenizeTomlLine(line: string): ConfigToken[] {
  if (line.trimStart().startsWith('#')) return [{ value: line, type: 'comment' }];

  const table = line.match(/^(\s*)(\[\[?.+\]?\])(\s*)(#.*)?$/);
  if (table) {
    return [
      { value: table[1], type: 'plain' },
      { value: table[2], type: 'key' },
      { value: table[3], type: 'plain' },
      ...(table[4] ? [{ value: table[4], type: 'comment' as const }] : []),
    ];
  }

  const match = line.match(/^(\s*)([^#=]+?)(\s*=)(.*)$/);
  if (!match) return tokenizeScalar(line);

  const [, prefix, key, separator, value] = match;
  const commentIndex = value.indexOf('#');
  const scalar = commentIndex === -1 ? value : value.slice(0, commentIndex);
  const comment = commentIndex === -1 ? '' : value.slice(commentIndex);

  return [
    { value: prefix, type: 'plain' },
    { value: key, type: 'key' },
    { value: separator, type: 'punctuation' },
    ...tokenizeScalar(scalar),
    ...(comment ? [{ value: comment, type: 'comment' as const }] : []),
  ];
}

export function tokenizeConfig(content: string, format: ExportFormat): ConfigToken[] {
  switch (format) {
    case 'json':
      return tokenizeJson(content);
    case 'yaml':
      return tokenizeLines(content, tokenizeYamlLine);
    case 'toml':
      return tokenizeLines(content, tokenizeTomlLine);
  }
}
