import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OhMyPoshConfig } from '../../types/ohmyposh';
import { useStudioRenderer } from '../useStudioRenderer';

const studioMocks = vi.hoisted(() => ({
  render: vi.fn(),
}));

vi.mock('../../utils/studioLoader', () => ({
  getLoadedStudioRuntime: () => null,
  subscribeToStudioRuntime: () => () => undefined,
  loadStudioRuntime: async () => ({
    render: studioMocks.render,
    dataJson: '{}',
  }),
}));

function Harness({ config, columns = 120 }: { config: OhMyPoshConfig; columns?: number }) {
  const result = useStudioRenderer(config, '#1e1e1e', true, columns);
  return (
    <div>
      <button type="button" onClick={result.initialize}>
        Initialize
      </button>
      <span data-testid="status">{result.status}</span>
      <span data-testid="svg">{result.svg}</span>
      <span data-testid="error">{result.error}</span>
    </div>
  );
}

describe('useStudioRenderer', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    studioMocks.render.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it('keeps the last valid SVG when a later render fails', async () => {
    const validConfig: OhMyPoshConfig = {
      version: 4,
      blocks: [],
    };
    const invalidConfig: OhMyPoshConfig = {
      version: 4,
      blocks: [],
      console_title_template: '{{ invalid',
    };

    studioMocks.render
      .mockReturnValueOnce({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><text>valid preview</text></svg>',
      })
      .mockReturnValueOnce({ error: 'invalid template' });

    act(() => root.render(<Harness config={validConfig} />));
    await act(async () => {
      container.querySelector('button')?.click();
      await Promise.resolve();
    });
    await act(async () => vi.advanceTimersByTimeAsync(200));

    expect(container.querySelector('[data-testid="svg"]')?.textContent).toContain(
      'valid preview'
    );

    act(() => root.render(<Harness config={invalidConfig} />));
    await act(async () => vi.advanceTimersByTimeAsync(200));

    expect(container.querySelector('[data-testid="svg"]')?.textContent).toContain(
      'valid preview'
    );
    expect(container.querySelector('[data-testid="error"]')?.textContent).toBe(
      'invalid template'
    );
  });

  it('renders with the supplied terminal width', async () => {
    const config: OhMyPoshConfig = {
      version: 4,
      blocks: [],
    };
    studioMocks.render.mockReturnValue({
      svg: '<svg xmlns="http://www.w3.org/2000/svg"><text>preview</text></svg>',
    });

    act(() => root.render(<Harness config={config} columns={64} />));
    await act(async () => {
      container.querySelector('button')?.click();
      await Promise.resolve();
    });
    await act(async () => vi.advanceTimersByTimeAsync(200));

    expect(studioMocks.render).toHaveBeenLastCalledWith(
      expect.any(String),
      'json',
      '{}',
      expect.objectContaining({ columns: 64 })
    );
  });
});
