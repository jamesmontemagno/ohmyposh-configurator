import { useEffect, useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { sanitizeStudioSvg } from '../../utils/studioSvg';

interface GeneratedPreviewProps {
  src: string;
  label: string;
}

export function GeneratedPreview({ src, label }: GeneratedPreviewProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(src, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load preview (${response.status})`);
        }

        return sanitizeStudioSvg(await response.text());
      })
      .then((preview) => setSvg(preview))
      .catch(() => {
        if (controller.signal.aborted) return;
        setFailed(true);
      });

    return () => controller.abort();
  }, [src]);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
        <NerdIcon icon="dev-terminal" size={32} className="text-gray-500" />
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
        <NerdIcon icon="dev-terminal" size={32} className="animate-pulse text-gray-600" />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 flex items-center overflow-hidden bg-gray-900 [&_svg]:h-auto [&_svg]:max-h-full [&_svg]:max-w-full"
      role="img"
      aria-label={`${label} prompt preview`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
