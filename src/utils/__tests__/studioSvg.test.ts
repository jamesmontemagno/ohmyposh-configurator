import { describe, expect, it } from 'vitest';
import { sanitizeStudioSvg } from '../studioSvg';

describe('sanitizeStudioSvg', () => {
  it('keeps ordinary SVG prompt content', () => {
    const result = sanitizeStudioSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#123456"/><text>prompt</text></svg>'
    );

    expect(result).toContain('<rect fill="#123456"');
    expect(result).toContain('<text>prompt</text>');
  });

  it('removes active content and unsafe links', () => {
    const result = sanitizeStudioSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">' +
        '<script>alert(1)</script>' +
        '<foreignObject><div>unsafe</div></foreignObject>' +
        '<a href="https://example.com" onclick="alert(1)"><text>link</text></a>' +
        '</svg>'
    );

    expect(result).not.toContain('script');
    expect(result).not.toContain('foreignObject');
    expect(result).not.toContain('onload');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('https://example.com');
    expect(result).toContain('<text>link</text>');
  });

  it('rejects non-SVG documents', () => {
    expect(() => sanitizeStudioSvg('<html></html>')).toThrow(
      'Studio returned an invalid SVG document'
    );
  });
});
