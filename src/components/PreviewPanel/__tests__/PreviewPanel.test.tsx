import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useConfigStore } from '../../../store/configStore';
import { PreviewPanel } from '../PreviewPanel';

describe('PreviewPanel', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    useConfigStore.setState({ previewRenderer: 'studio' });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it('requires explicit initialization before fetching Studio assets', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    act(() => root.render(<PreviewPanel />));

    expect(container.textContent).toContain('Initialize Studio');
    expect(container.textContent).toContain('about 20 MB');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('switches to the retained legacy preview', () => {
    act(() => root.render(<PreviewPanel />));

    const legacyButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Legacy'
    );
    expect(legacyButton).toBeDefined();

    act(() => legacyButton?.click());

    expect(useConfigStore.getState().previewRenderer).toBe('legacy');
    expect(container.textContent).toContain('❯');
  });
});
