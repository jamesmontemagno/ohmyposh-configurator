import { NerdIcon } from '../NerdIcon';
import { useConfigStore } from '../../store/configStore';
import { useStudioRenderer } from '../../hooks/useStudioRenderer';

interface StudioPreviewProps {
  backgroundColor: string;
  active: boolean;
}

export function StudioPreview({ backgroundColor, active }: StudioPreviewProps) {
  const config = useConfigStore((state) => state.config);
  const setPreviewRenderer = useConfigStore((state) => state.setPreviewRenderer);
  const { status, progress, svg, error, initialize } = useStudioRenderer(
    config,
    backgroundColor,
    active
  );

  if (status === 'idle') {
    return (
      <div
        className="flex-1 min-h-0 overflow-y-auto px-5 py-6 flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div className="max-w-lg w-full flex items-start gap-4">
          <div className="mt-0.5 p-2 rounded-md bg-[#0f3460] text-blue-100 flex-shrink-0">
            <NerdIcon icon="misc-rocket" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Initialize the real preview</h3>
            <p className="mt-1 text-xs leading-5 text-gray-300">
              Studio runs Oh My Posh locally in your browser using WebAssembly. Initializing
              downloads about 20 MB. Your config never leaves this device.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={initialize}
                className="px-3 py-2 rounded-md bg-[#e94560] text-white text-xs font-semibold hover:bg-[#ff5874] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94560] transition-colors"
              >
                Initialize Studio
              </button>
              <button
                type="button"
                onClick={() => setPreviewRenderer('legacy')}
                className="px-3 py-2 text-xs font-medium text-gray-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94560] rounded"
              >
                Use legacy preview
              </button>
            </div>
            <p className="mt-3 text-[11px] text-gray-500">
              You will be asked to initialize Studio again after reloading the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    const percent = Math.round(progress * 100);
    return (
      <div
        className="flex-1 min-h-0 px-5 py-6 flex items-center justify-center"
        style={{ backgroundColor }}
        role="status"
        aria-live="polite"
      >
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>Initializing Studio locally…</span>
            <span>{percent}%</span>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0f3460]"
            role="progressbar"
            aria-label="Studio download progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div
              className="h-full bg-[#e94560] transition-[width] duration-150"
              style={{ width: `${percent}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setPreviewRenderer('legacy')}
            className="mt-4 text-xs font-medium text-gray-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94560] rounded"
          >
            Use legacy preview
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error' && !svg) {
    return (
      <div
        className="flex-1 min-h-0 px-5 py-6 flex items-center justify-center"
        style={{ backgroundColor }}
        role="alert"
      >
        <div className="w-full max-w-lg">
          <p className="text-sm font-semibold text-red-300">Studio could not initialize</p>
          <p className="mt-1 text-xs leading-5 text-red-200/80">{error}</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={initialize}
              className="px-3 py-2 rounded-md bg-[#e94560] text-white text-xs font-semibold hover:bg-[#ff5874] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94560]"
            >
              Retry initialization
            </button>
            <button
              type="button"
              onClick={() => setPreviewRenderer('legacy')}
              className="px-3 py-2 text-xs font-medium text-gray-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94560] rounded"
            >
              Use legacy preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex-1 min-h-0 overflow-auto px-4 py-5"
      style={{ backgroundColor }}
    >
      {error && (
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-400/40 bg-red-950/70 px-3 py-2"
          role="alert"
        >
          <p className="min-w-0 text-xs text-red-200">
            <span className="font-semibold">Studio kept the last valid preview.</span>{' '}
            {error}
          </p>
          <button
            type="button"
            onClick={() => setPreviewRenderer('legacy')}
            className="flex-shrink-0 text-xs font-semibold text-red-100 underline underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
          >
            Use legacy preview
          </button>
        </div>
      )}

      {svg ? (
        <div
          className="studio-preview-svg"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <p className="text-xs text-gray-400" role="status">
          Rendering your prompt…
        </p>
      )}
    </div>
  );
}
