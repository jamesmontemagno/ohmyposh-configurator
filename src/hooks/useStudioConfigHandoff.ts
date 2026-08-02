import { useEffect, useRef } from 'react';
import { importStudioConfig } from '../utils/studioConfigImport';
import {
  createStudioConfigHandoff,
  getStudioConfigHandoffNonce,
  STUDIO_ORIGIN,
} from '../utils/studioConfigProtocol';

type ShowToast = (message: string, type: 'success' | 'error' | 'info') => void;

function importErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid configuration';
}

export function useStudioConfigHandoff(restorationComplete: boolean, showToast: ShowToast) {
  const consumedNonceRef = useRef<string | null>(null);

  useEffect(() => {
    const opener = window.opener;
    if (!restorationComplete || !opener) {
      return;
    }

    const nonce = getStudioConfigHandoffNonce(window.location.hash);
    if (!nonce || consumedNonceRef.current === nonce) {
      return;
    }

    const handoff = createStudioConfigHandoff(nonce, opener);
    const handleMessage = (event: MessageEvent<unknown>) => {
      const message = handoff.receive(event);
      if (!message) {
        return;
      }

      consumedNonceRef.current = nonce;

      try {
        const enabledFeatures = importStudioConfig(message);
        const featuresMessage = enabledFeatures.length > 0
          ? ` Auto-enabled: ${enabledFeatures.join(', ')}.`
          : '';
        showToast(`Configuration imported from Oh My Posh Studio.${featuresMessage}`, 'success');
      } catch (error) {
        showToast(
          `Unable to import the Studio configuration: ${importErrorMessage(error)}`,
          'error'
        );
      }
    };

    window.addEventListener('message', handleMessage);
    opener.postMessage(handoff.readyMessage, STUDIO_ORIGIN);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [restorationComplete, showToast]);
}
