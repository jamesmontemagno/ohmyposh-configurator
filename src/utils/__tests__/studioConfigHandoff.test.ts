import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAdvancedFeaturesStore } from '../../store/advancedFeaturesStore';
import { useConfigStore } from '../../store/configStore';
import { useSavedConfigsStore } from '../../store/savedConfigsStore';
import { importStudioConfig } from '../studioConfigImport';
import {
  createStudioConfigHandoff,
  getStudioConfigHandoffNonce,
  STUDIO_CONFIG_NONCE_FRAGMENT_KEY,
  STUDIO_CONFIG_PROTOCOL_VERSION,
  STUDIO_ORIGIN,
} from '../studioConfigProtocol';

const nonce = 'Q2hhdEdQVC1jb25maWd1cmF0b3ItaGFuZG9mZi0xMjM0NTY';
const legacyNonce = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const initialFeatures = { ...useAdvancedFeaturesStore.getState().features };
const clearLastLoadedId = useSavedConfigsStore.getState().clearLastLoadedId;

function handoffEvent(
  origin: string,
  data: unknown,
  source: MessageEventSource | null = window
): Pick<MessageEvent<unknown>, 'data' | 'origin' | 'source'> {
  return { origin, data, source };
}

function validMessage(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    type: 'omp-studio-config',
    version: STUDIO_CONFIG_PROTOCOL_VERSION,
    nonce,
    format: 'json',
    text: JSON.stringify({
      blocks: [{
        type: 'prompt',
        segments: [{ type: 'text', alias: 'studio' }],
      }],
    }),
    ...overrides,
  };
}

describe('Studio Configurator handoff', () => {
  beforeEach(() => {
    useConfigStore.getState().resetConfig();
    useConfigStore.setState({
      selectedBlockId: null,
      selectedSegmentId: null,
      selectedTooltipId: null,
      previewPaletteName: undefined,
    });
    useSavedConfigsStore.setState({
      lastLoadedId: 'saved-config',
      clearLastLoadedId: () => useSavedConfigsStore.setState({ lastLoadedId: null }),
    });
    useAdvancedFeaturesStore.setState({
      features: { ...initialFeatures },
      autoDetectOnImport: true,
    });
  });

  afterEach(() => {
    useSavedConfigsStore.setState({ clearLastLoadedId });
  });

  it('reads one valid nonce from the canonical hash parameter', () => {
    expect(
      getStudioConfigHandoffNonce(`#${STUDIO_CONFIG_NONCE_FRAGMENT_KEY}=${nonce}`)
    ).toBe(nonce);
  });

  it('reads one valid nonce from the legacy hash parameter', () => {
    expect(getStudioConfigHandoffNonce(`#nonce=${legacyNonce}`)).toBe(legacyNonce);
  });

  it('rejects missing, duplicate, malformed, and ambiguous hash nonce values', () => {
    expect(getStudioConfigHandoffNonce('')).toBeNull();
    expect(getStudioConfigHandoffNonce(`#${STUDIO_CONFIG_NONCE_FRAGMENT_KEY}=short`)).toBeNull();
    expect(
      getStudioConfigHandoffNonce(
        `#${STUDIO_CONFIG_NONCE_FRAGMENT_KEY}=${nonce}&${STUDIO_CONFIG_NONCE_FRAGMENT_KEY}=${nonce}`
      )
    ).toBeNull();
    expect(getStudioConfigHandoffNonce(`#nonce=${legacyNonce}&nonce=${legacyNonce}`)).toBeNull();
    expect(
      getStudioConfigHandoffNonce(
        `#${STUDIO_CONFIG_NONCE_FRAGMENT_KEY}=${nonce}&nonce=${legacyNonce}`
      )
    ).toBeNull();
  });

  it('sends the expected ready message and imports a valid Studio configuration once', () => {
    const handoff = createStudioConfigHandoff(nonce, window);

    expect(handoff.readyMessage).toEqual({
      type: 'omp-configurator-ready',
      version: STUDIO_CONFIG_PROTOCOL_VERSION,
      nonce,
    });

    const message = handoff.receive(handoffEvent(STUDIO_ORIGIN, validMessage()));
    expect(message).not.toBeNull();

    const enabledFeatures = importStudioConfig(message!);

    expect(useConfigStore.getState().config.blocks[0].segments[0].type).toBe('text');
    expect(useConfigStore.getState().selectedBlockId).toBeNull();
    expect(useSavedConfigsStore.getState().lastLoadedId).toBeNull();
    expect(enabledFeatures).toContain('Template Alias');
    expect(handoff.consumed).toBe(true);
    expect(handoff.receive(handoffEvent(STUDIO_ORIGIN, validMessage()))).toBeNull();
  });

  it('does not accept a message from another origin', () => {
    const handoff = createStudioConfigHandoff(nonce, window);

    expect(handoff.receive(handoffEvent('https://example.com', validMessage()))).toBeNull();
    expect(handoff.consumed).toBe(false);
    expect(useConfigStore.getState().config.blocks[0].segments[0].type).toBe('path');
  });

  it('does not accept a message with a different nonce', () => {
    const handoff = createStudioConfigHandoff(nonce, window);

    expect(
      handoff.receive(handoffEvent(STUDIO_ORIGIN, validMessage({ nonce: 'wrong-nonce' })))
    ).toBeNull();
    expect(handoff.consumed).toBe(false);
  });

  it('does not accept malformed payloads', () => {
    const handoff = createStudioConfigHandoff(nonce, window);

    expect(
      handoff.receive(handoffEvent(STUDIO_ORIGIN, validMessage({ format: 'xml' })))
    ).toBeNull();
    expect(
      handoff.receive(handoffEvent(STUDIO_ORIGIN, validMessage({ text: '' })))
    ).toBeNull();
    expect(
      handoff.receive(handoffEvent(STUDIO_ORIGIN, {
        type: 'omp-studio-config',
        version: 2,
        nonce,
        format: 'json',
        text: '{}',
      }))
    ).toBeNull();
    expect(handoff.consumed).toBe(false);
  });

  it('does not accept a message from another window', () => {
    const handoff = createStudioConfigHandoff(nonce, window);

    expect(
      handoff.receive(handoffEvent(STUDIO_ORIGIN, validMessage(), null))
    ).toBeNull();
    expect(handoff.consumed).toBe(false);
  });

  it('consumes a parser-invalid payload without allowing a later overwrite', () => {
    const handoff = createStudioConfigHandoff(nonce, window);
    const message = handoff.receive(
      handoffEvent(STUDIO_ORIGIN, validMessage({ text: '{ invalid json' }))
    );

    expect(() => importStudioConfig(message!)).toThrow('Failed to parse JSON file');
    expect(handoff.consumed).toBe(true);
    expect(handoff.receive(handoffEvent(STUDIO_ORIGIN, validMessage()))).toBeNull();
  });
});
