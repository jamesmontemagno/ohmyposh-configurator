import { describe, expect, it } from 'vitest';
import { ansiToHtml } from './ansi';

describe('ansiToHtml', () => {
  it('renders true-color SGR sequences without exposing terminal control codes', () => {
    expect(ansiToHtml('\u001B[38;2;1;2;3mhello\u001B[0m')).toBe(
      '<span style="color:rgb(1, 2, 3)">hello</span>'
    );
  });

  it('removes OSC hyperlinks and escapes output text', () => {
    expect(ansiToHtml('\u001B]8;;file:///secret\u001B\\<preview>\u001B]8;;\u001B\\')).toBe(
      '&lt;preview&gt;'
    );
  });

  it('removes unsupported control sequences before rendering output', () => {
    expect(ansiToHtml('\u001B[2Jpreview')).toBe('preview');
  });
});
