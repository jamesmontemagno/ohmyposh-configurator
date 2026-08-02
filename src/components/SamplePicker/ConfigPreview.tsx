import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';
import { getConfigPreviewUrl } from '../../utils/configLoader';

interface ConfigPreviewProps {
  category: 'samples' | 'community';
  filename: string;
  name: string;
}

export function ConfigPreview({ category, filename, name }: ConfigPreviewProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
        <NerdIcon icon="dev-terminal" size={32} className="text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={getConfigPreviewUrl(category, filename)}
      alt={`${name} prompt preview`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-contain object-left"
    />
  );
}
