import { describe, expect, it } from 'vitest';
import { getPreviewText } from '../templateUtils';

describe('getPreviewText', () => {
  it('resolves the Jujutsu ChangeID and working-copy status', () => {
    const preview = getPreviewText({
      id: 'jujutsu-preview',
      type: 'jujutsu',
      style: 'plain',
      template: ' \uf1fa{{.ChangeID}}{{if .Working.Changed}} \uf044 {{ .Working.String }}{{ end }} ',
    }, undefined, true);

    expect(preview).toBe(' \uf1famzvwutnw \uf044 +1 ~2 ');
  });
});
