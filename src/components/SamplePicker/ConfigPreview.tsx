import { getConfigPreviewUrl } from '../../utils/configLoader';
import { GeneratedPreview } from './GeneratedPreview';

interface ConfigPreviewProps {
  category: 'samples' | 'community';
  filename: string;
  name: string;
}

export function ConfigPreview({ category, filename, name }: ConfigPreviewProps) {
  return (
    <GeneratedPreview src={getConfigPreviewUrl(category, filename)} label={name} />
  );
}
