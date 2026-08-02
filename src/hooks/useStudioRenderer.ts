import { useCallback, useEffect, useRef, useState } from 'react';
import type { OhMyPoshConfig } from '../types/ohmyposh';
import { exportToJson } from '../utils/configExporter';
import {
  getLoadedStudioRuntime,
  loadStudioRuntime,
  subscribeToStudioRuntime,
  type StudioRuntime,
  type StudioRender,
  type StudioRenderOptions,
} from '../utils/studioLoader';
import { sanitizeStudioSvg } from '../utils/studioSvg';

export type StudioStatus = 'idle' | 'loading' | 'ready' | 'error';

const RENDER_DELAY_MS = 200;
const RENDER_OPTIONS = {
  columns: 120,
  fontFamily: 'Victor Mono',
  cellWidth: 0.5455,
  lineHeight: 1.6909,
  fillAscent: 1.0982,
  fillDescent: 0.3255,
} as const;

interface UseStudioRendererResult {
  status: StudioStatus;
  progress: number;
  svg: string | null;
  error: string | null;
  initialize: () => void;
}

export function useStudioRenderer(
  config: OhMyPoshConfig,
  backgroundColor: string,
  active = true,
  columns = 120,
  autoInitialize = false
): UseStudioRendererResult {
  const initialRuntime = getLoadedStudioRuntime();
  const [status, setStatus] = useState<StudioStatus>(initialRuntime ? 'ready' : 'idle');
  const [progress, setProgress] = useState(0);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const renderRef = useRef<StudioRender | null>(initialRuntime?.render ?? null);
  const dataRef = useRef(initialRuntime?.dataJson ?? '');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(
    () =>
      subscribeToStudioRuntime((runtime: StudioRuntime) => {
        if (!mountedRef.current) return;
        renderRef.current = runtime.render;
        dataRef.current = runtime.dataJson;
        setProgress(1);
        setError(null);
        setStatus('ready');
      }),
    []
  );

  const initialize = useCallback(() => {
    setStatus('loading');
    setProgress(0);
    setError(null);

    loadStudioRuntime((fraction) => {
      if (mountedRef.current) setProgress(fraction);
    })
      .then(({ render, dataJson }) => {
        if (!mountedRef.current) return;
        renderRef.current = render;
        dataRef.current = dataJson;
        setProgress(1);
        setStatus('ready');
      })
      .catch((reason: unknown) => {
        if (!mountedRef.current) return;
        setError(reason instanceof Error ? reason.message : String(reason));
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    if (!autoInitialize || status !== 'idle') return;

    const timeout = window.setTimeout(initialize, 0);
    return () => window.clearTimeout(timeout);
  }, [autoInitialize, initialize, status]);

  useEffect(() => {
    if (!active || status !== 'ready' || !renderRef.current) return;

    const timeout = window.setTimeout(() => {
      const options: StudioRenderOptions = {
        ...RENDER_OPTIONS,
        columns,
        backgroundColor,
      };

      try {
        const result = renderRef.current?.(
          exportToJson(config),
          'json',
          dataRef.current,
          options
        );

        if (!result) {
          setError('Studio returned no preview.');
        } else if ('error' in result) {
          setError(result.error ?? 'Studio could not render this config.');
        } else {
          setSvg(sanitizeStudioSvg(result.svg));
          setError(null);
        }
      } catch (reason: unknown) {
        setError(reason instanceof Error ? reason.message : String(reason));
      }
    }, RENDER_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [active, backgroundColor, columns, config, status]);

  return { status, progress, svg, error, initialize };
}
