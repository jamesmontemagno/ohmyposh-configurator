export const STUDIO_ORIGIN = 'https://ohmyposh.dev';
export const STUDIO_CONFIG_PROTOCOL_VERSION = 1;
export const STUDIO_CONFIG_NONCE_FRAGMENT_KEY = 'omp-configurator-nonce';

export type StudioConfigFormat = 'json' | 'yaml' | 'toml';

export interface StudioConfigReadyMessage {
  type: 'omp-configurator-ready';
  version: typeof STUDIO_CONFIG_PROTOCOL_VERSION;
  nonce: string;
}

export interface StudioConfigImportMessage {
  type: 'omp-studio-config';
  version: typeof STUDIO_CONFIG_PROTOCOL_VERSION;
  nonce: string;
  format: StudioConfigFormat;
  text: string;
}

type StudioConfigHandoffEvent = Pick<MessageEvent<unknown>, 'data' | 'origin' | 'source'>;

const noncePattern = /^[A-Za-z0-9_-]{43,128}$/;
const formats = new Set<string>(['json', 'yaml', 'toml']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStudioConfigFormat(value: unknown): value is StudioConfigFormat {
  return typeof value === 'string' && formats.has(value);
}

/**
 * Returns the single URL fragment nonce used by a Studio handoff.
 */
export function getStudioConfigHandoffNonce(hash: string): string | null {
  if (!hash.startsWith('#')) {
    return null;
  }

  const parameters = new URLSearchParams(hash.slice(1));
  const nonces = parameters.getAll(STUDIO_CONFIG_NONCE_FRAGMENT_KEY);
  if (nonces.length !== 1 || !noncePattern.test(nonces[0])) {
    return null;
  }

  return nonces[0];
}

export function createStudioConfigReadyMessage(nonce: string): StudioConfigReadyMessage {
  return {
    type: 'omp-configurator-ready',
    version: STUDIO_CONFIG_PROTOCOL_VERSION,
    nonce,
  };
}

function parseStudioConfigImportMessage(
  data: unknown,
  nonce: string
): StudioConfigImportMessage | null {
  if (!isRecord(data)) {
    return null;
  }

  if (
    data.type !== 'omp-studio-config' ||
    data.version !== STUDIO_CONFIG_PROTOCOL_VERSION ||
    data.nonce !== nonce ||
    !isStudioConfigFormat(data.format) ||
    typeof data.text !== 'string' ||
    data.text.length === 0
  ) {
    return null;
  }

  return {
    type: data.type,
    version: data.version,
    nonce: data.nonce,
    format: data.format,
    text: data.text,
  };
}

/**
 * Accepts exactly one valid import message after the Configurator signals readiness.
 */
export function createStudioConfigHandoff(nonce: string, opener: MessageEventSource) {
  let consumed = false;

  return {
    readyMessage: createStudioConfigReadyMessage(nonce),
    get consumed(): boolean {
      return consumed;
    },
    receive(event: StudioConfigHandoffEvent): StudioConfigImportMessage | null {
      if (consumed || event.origin !== STUDIO_ORIGIN || event.source !== opener) {
        return null;
      }

      const message = parseStudioConfigImportMessage(event.data, nonce);
      if (!message) {
        return null;
      }

      consumed = true;
      return message;
    },
  };
}
