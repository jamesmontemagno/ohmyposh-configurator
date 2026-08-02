import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudioConfigHandoff } from '../useStudioConfigHandoff';
import {
  STUDIO_CONFIG_NONCE_FRAGMENT_KEY,
  STUDIO_CONFIG_PROTOCOL_VERSION,
  STUDIO_ORIGIN,
} from '../../utils/studioConfigProtocol';

const handoffMocks = vi.hoisted(() => ({
  importStudioConfig: vi.fn(),
}));

vi.mock('../../utils/studioConfigImport', () => ({
  importStudioConfig: handoffMocks.importStudioConfig,
}));

const nonce = 'Q2hhdEdQVC1jb25maWd1cmF0b3ItaGFuZG9mZi0xMjM0NTY';

function Harness({
  restorationComplete,
  showToast,
}: {
  restorationComplete: boolean;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  useStudioConfigHandoff(restorationComplete, showToast);
  return null;
}

describe('useStudioConfigHandoff', () => {
  let container: HTMLDivElement;
  let root: Root;
  let openerDescriptor: PropertyDescriptor | undefined;
  let originalHash: string;

  beforeEach(() => {
    handoffMocks.importStudioConfig.mockReset();
    handoffMocks.importStudioConfig.mockReturnValue([]);
    openerDescriptor = Object.getOwnPropertyDescriptor(window, 'opener');
    originalHash = window.location.hash;
    window.location.hash = `${STUDIO_CONFIG_NONCE_FRAGMENT_KEY}=${nonce}`;
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: window,
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    if (openerDescriptor) {
      Object.defineProperty(window, 'opener', openerDescriptor);
    } else {
      delete window.opener;
    }
    window.location.hash = originalHash;
    vi.restoreAllMocks();
  });

  it('waits for restoration, posts readiness, imports once, and removes its listener', () => {
    const showToast = vi.fn();
    const postMessage = vi.spyOn(window, 'postMessage').mockImplementation(() => undefined);
    const createImportEvent = () => new MessageEvent('message', {
      origin: STUDIO_ORIGIN,
      source: window,
      data: {
        type: 'omp-studio-config',
        version: STUDIO_CONFIG_PROTOCOL_VERSION,
        nonce,
        format: 'json',
        text: '{"blocks":[]}',
      },
    });

    act(() => root.render(<Harness restorationComplete={false} showToast={showToast} />));
    expect(postMessage).not.toHaveBeenCalled();

    act(() => root.render(<Harness restorationComplete showToast={showToast} />));
    expect(postMessage).toHaveBeenCalledWith(
      {
        type: 'omp-configurator-ready',
        version: STUDIO_CONFIG_PROTOCOL_VERSION,
        nonce,
      },
      STUDIO_ORIGIN
    );

    act(() => {
      window.dispatchEvent(createImportEvent());
      window.dispatchEvent(createImportEvent());
    });
    expect(handoffMocks.importStudioConfig).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith(
      'Configuration imported from Oh My Posh Studio.',
      'success'
    );

    act(() => root.unmount());
    window.dispatchEvent(createImportEvent());
    expect(handoffMocks.importStudioConfig).toHaveBeenCalledTimes(1);
  });
});
