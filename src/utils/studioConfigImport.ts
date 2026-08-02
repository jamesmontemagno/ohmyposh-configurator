import { useAdvancedFeaturesStore } from '../store/advancedFeaturesStore';
import { useConfigStore } from '../store/configStore';
import { useSavedConfigsStore } from '../store/savedConfigsStore';
import { importConfig } from './configImporter';
import type { StudioConfigImportMessage } from './studioConfigProtocol';

/**
 * Imports a validated Studio payload using the same parser and post-import behavior as manual imports.
 */
export function importStudioConfig(message: StudioConfigImportMessage): string[] {
  const config = importConfig(message.text, `studio-config.${message.format}`);

  const configStore = useConfigStore.getState();
  configStore.setConfig(config);
  configStore.selectBlock(null);
  configStore.setPreviewPaletteName(undefined);
  useSavedConfigsStore.getState().clearLastLoadedId();

  return useAdvancedFeaturesStore.getState().detectAndEnableFeatures(config);
}
