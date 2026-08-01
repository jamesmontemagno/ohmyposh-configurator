export interface StudioRenderOptions {
  columns: number;
  fontFamily: string;
  cellWidth: number;
  lineHeight: number;
  fillAscent: number;
  fillDescent: number;
  backgroundColor: string;
}

export type StudioRenderResult =
  | { svg: string; error?: never }
  | { error: string; svg?: never };

export type StudioRender = (
  configText: string,
  format: 'json',
  dataJson: string,
  options: StudioRenderOptions
) => StudioRenderResult;

interface GoRuntime {
  importObject: WebAssembly.Imports;
  run: (instance: WebAssembly.Instance) => Promise<void>;
}

interface StudioGlobals {
  Go?: new () => GoRuntime;
  render?: StudioRender;
}

export interface StudioRuntime {
  render: StudioRender;
  dataJson: string;
}

const STUDIO_BASE_URL = '/studio';
const STUDIO_TOTAL_BYTES = 20_354_916;

let runtimePromise: Promise<StudioRuntime> | null = null;
let loadedRuntime: StudioRuntime | null = null;
const runtimeListeners = new Set<(runtime: StudioRuntime) => void>();

function getGlobals(): StudioGlobals {
  return globalThis as typeof globalThis & StudioGlobals;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded === 'true' || getGlobals().Go) {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      'error',
      () => {
        script.remove();
        reject(new Error(`Failed to load ${src}`));
      },
      { once: true }
    );
    document.head.appendChild(script);
  });
}

async function fetchBytesWithProgress(
  url: string,
  onProgress: (fraction: number) => void
): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download Studio (${response.status})`);
  }

  if (!response.body) {
    return response.arrayBuffer();
  }

  const total = Number(response.headers.get('content-length')) || STUDIO_TOTAL_BYTES;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(Math.min(received / total, 1));
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes.buffer;
}

export function loadStudioRuntime(
  onProgress: (fraction: number) => void = () => undefined
): Promise<StudioRuntime> {
  if (runtimePromise) return runtimePromise;

  runtimePromise = (async () => {
    const dataRequest = fetch(`${STUDIO_BASE_URL}/segment_data.json`).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load Studio sample data (${response.status})`);
      }
      return response.text();
    });

    await loadScript(`${STUDIO_BASE_URL}/wasm_exec.js`);
    const Go = getGlobals().Go;
    if (!Go) {
      throw new Error('Studio runtime host did not initialize');
    }

    const go = new Go();
    const bytes = await fetchBytesWithProgress(`${STUDIO_BASE_URL}/omp.wasm`, onProgress);
    const dataJson = await dataRequest;
    const { instance } = await WebAssembly.instantiate(bytes, go.importObject);
    void go.run(instance).catch((error: unknown) => {
      console.error('Oh My Posh Studio runtime exited unexpectedly', error);
    });

    const render = getGlobals().render;
    if (typeof render !== 'function') {
      throw new Error('Studio renderer did not initialize');
    }

    loadedRuntime = { render, dataJson };
    for (const listener of runtimeListeners) listener(loadedRuntime);
    return loadedRuntime;
  })().catch((error: unknown) => {
    runtimePromise = null;
    throw error;
  });

  return runtimePromise;
}

export function resetStudioRuntimeForTests(): void {
  runtimePromise = null;
  loadedRuntime = null;
}

export function getLoadedStudioRuntime(): StudioRuntime | null {
  return loadedRuntime;
}

export function subscribeToStudioRuntime(
  listener: (runtime: StudioRuntime) => void
): () => void {
  runtimeListeners.add(listener);
  return () => runtimeListeners.delete(listener);
}
