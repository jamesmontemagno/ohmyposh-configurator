import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContextMenu } from '../ContextMenu';

describe('ContextMenu', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onSelect = vi.fn();

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    onClose.mockReset();
    onSelect.mockReset();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function renderMenu() {
    act(() => {
      root.render(
        <ContextMenu
          position={{ x: 16, y: 16 }}
          onClose={onClose}
          items={[{ label: 'Duplicate segment', icon: 'action-copy', onSelect }]}
        />,
      );
    });
  }

  it('runs the selected action and closes the menu', () => {
    renderMenu();

    const action = document.querySelector<HTMLButtonElement>('[role="menuitem"]');
    expect(action?.textContent).toContain('Duplicate segment');

    act(() => action?.click());

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when Escape is pressed', () => {
    renderMenu();

    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
