import { describe, it, expect } from 'vitest';
import {
  parseUnicodeEscapes,
  unicodeToEscapes,
  hasUnicodeCharacters,
  stripOmpMarkup,
} from '../unicode';

describe('parseUnicodeEscapes', () => {
  it('should parse \\uXXXX format', () => {
    expect(parseUnicodeEscapes('\\u0041')).toBe('A');
    expect(parseUnicodeEscapes('\\u0042\\u0043')).toBe('BC');
    expect(parseUnicodeEscapes('\\ue0b0')).toBe('\ue0b0');
  });

  it('should parse \\u{XXXXX} format', () => {
    expect(parseUnicodeEscapes('\\u{0041}')).toBe('A');
    expect(parseUnicodeEscapes('\\u{1F600}')).toBe('😀');
    expect(parseUnicodeEscapes('\\u{e0b0}')).toBe('\ue0b0');
  });

  it('should handle mixed formats', () => {
    expect(parseUnicodeEscapes('\\u0041 \\u{0042}')).toBe('A B');
    expect(parseUnicodeEscapes('Hello \\u0041 World \\u{0042}')).toBe('Hello A World B');
  });

  it('should return input unchanged when no escapes present', () => {
    expect(parseUnicodeEscapes('Hello World')).toBe('Hello World');
    expect(parseUnicodeEscapes('ABC')).toBe('ABC');
  });

  it('should handle empty string', () => {
    expect(parseUnicodeEscapes('')).toBe('');
  });
});

describe('unicodeToEscapes', () => {
  it('should leave ASCII-only strings unchanged', () => {
    expect(unicodeToEscapes('Hello World')).toBe('Hello World');
    expect(unicodeToEscapes('ABC123')).toBe('ABC123');
  });

  it('should convert unicode characters to escape sequences', () => {
    expect(unicodeToEscapes('\ue0b0')).toBe('\\ue0b0');
    expect(unicodeToEscapes('→')).toBe('\\u2192');
  });

  it('should handle mixed content', () => {
    expect(unicodeToEscapes('Hello \ue0b0 World')).toBe('Hello \\ue0b0 World');
    expect(unicodeToEscapes('A→B')).toBe('A\\u2192B');
  });

  it('should handle emoji (BMP only - characters below U+FFFF)', () => {
    // Note: unicodeToEscapes only handles characters in BMP (U+0080 to U+FFFF)
    expect(unicodeToEscapes('©')).toBe('\\u00a9'); // Copyright symbol
  });

  it('should handle empty string', () => {
    expect(unicodeToEscapes('')).toBe('');
  });
});

describe('hasUnicodeCharacters', () => {
  it('should return false for ASCII-only strings', () => {
    expect(hasUnicodeCharacters('Hello World')).toBe(false);
    expect(hasUnicodeCharacters('ABC123!@#')).toBe(false);
  });

  it('should return true for strings with unicode characters', () => {
    expect(hasUnicodeCharacters('\ue0b0')).toBe(true);
    expect(hasUnicodeCharacters('Hello \ue0b0')).toBe(true);
    expect(hasUnicodeCharacters('→')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(hasUnicodeCharacters('')).toBe(false);
  });
});

describe('stripOmpMarkup', () => {
  it('should remove hex color tags', () => {
    expect(stripOmpMarkup('<#ff70a6>text</>')).toBe('text');
    expect(stripOmpMarkup('<#ffffff>Hello</>')).toBe('Hello');
  });

  it('should remove palette reference tags', () => {
    expect(stripOmpMarkup('<p:palette>text</>')).toBe('text');
    expect(stripOmpMarkup('<p:my-color>Hello</>')).toBe('Hello');
  });

  it('should remove standalone closing tags', () => {
    expect(stripOmpMarkup('text</>')).toBe('text');
  });

  it('should handle nested/multiple tags', () => {
    expect(stripOmpMarkup('<#ff70a6>Hello</> <#00ff00>World</>')).toBe('Hello World');
    expect(stripOmpMarkup('<p:fg>A</><p:bg>B</>')).toBe('AB');
  });

  it('should handle no tags', () => {
    expect(stripOmpMarkup('Hello World')).toBe('Hello World');
    expect(stripOmpMarkup('Simple text')).toBe('Simple text');
  });

  it('should return empty string for empty/null input', () => {
    expect(stripOmpMarkup('')).toBe('');
  });

  it('should parse unicode escapes in content', () => {
    expect(stripOmpMarkup('<#ff0000>\\u0041</>')).toBe('A');
  });
});
