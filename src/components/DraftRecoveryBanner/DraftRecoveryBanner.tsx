import { useState, useEffect } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useSavedConfigsStore } from '../../store/savedConfigsStore';

export function DraftRecoveryBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [draftTime, setDraftTime] = useState<string | null>(null);
  
  const { draftConfig, restoreDraft, clearDraft, loadDraft } = useSavedConfigsStore();

  // Check for draft on mount
  useEffect(() => {
    const checkDraft = async () => {
      const draft = await loadDraft();
      if (draft && draft.savedAt) {
        setDraftTime(draft.savedAt);
        setIsVisible(true);
      }
    };
    checkDraft();
  }, [loadDraft]);

  const handleRestore = () => {
    restoreDraft();
    setIsVisible(false);
  };

  const handleDiscard = async () => {
    await clearDraft();
    setIsVisible(false);
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Don't render if not visible or draft was cleared externally
  if (!isVisible || !draftConfig) return null;

  return (
    <div className="bg-amber-900/30 border-b border-amber-700 px-4 py-2">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          <NerdIcon icon="status-warning" size={18} className="text-amber-400" />
          <div>
            <span className="text-sm text-amber-200">
              Unsaved changes recovered
            </span>
            {draftTime && (
              <span className="text-xs text-amber-400 ml-2">
                from {formatTime(draftTime)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDiscard}
            className="px-3 py-1 text-sm text-amber-300 hover:text-amber-100 hover:bg-amber-900/50 rounded transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleRestore}
            className="px-3 py-1 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}
