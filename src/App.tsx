import { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { SegmentPicker } from './components/SegmentPicker';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { ExportBar } from './components/ExportBar';
import { ScreenSizeWarning } from './components/ScreenSizeWarning';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { DraftRecoveryBanner } from './components/DraftRecoveryBanner';
import { ToastContainer, useToastStore } from './components/Toast';
import { preloadSegments } from './utils/segmentLoader';
import { useSavedConfigsStore, setupDraftAutoSave } from './store/savedConfigsStore';

function App() {
  const showToast = useToastStore((state) => state.showToast);
  const initializedRef = useRef(false);
  const [activeCompactPanel, setActiveCompactPanel] = useState<'segments' | 'canvas' | 'preview' | 'properties'>('canvas');

  // Initialize saved configs store and auto-save on app mount
  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    preloadSegments();
    
    let unsubscribe: (() => void) | null = null;
    
    const initializeApp = async () => {
      // Load saved configs from storage
      await useSavedConfigsStore.getState().loadFromStorage();
      
      // Check if there's a last loaded config to restore
      const restoredConfigName = await useSavedConfigsStore.getState().autoRestoreLastConfig();
      if (restoredConfigName) {
        showToast(`Restored "${restoredConfigName}"`, 'info');
      }
      
      // Setup draft auto-save AFTER config is restored
      unsubscribe = setupDraftAutoSave();
    };
    
    initializeApp();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [showToast]);

  return (
    <div className="flex flex-col h-screen bg-[#0f0f23]">
      <ScreenSizeWarning />
      <OnboardingTutorial />
      <DraftRecoveryBanner />
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Desktop layout */}
        <div className="hidden xl:flex h-full overflow-hidden">
          {/* Left Sidebar - Segment Picker */}
          <div className="w-72 2xl:w-64 flex-shrink-0 overflow-hidden">
            <SegmentPicker />
          </div>

          {/* Center - Canvas and Preview */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Canvas */}
            <div className="flex-1 overflow-auto">
              <Canvas />
            </div>

            {/* Preview Panel */}
            <PreviewPanel />
          </div>

          {/* Right Sidebar - Properties Panel */}
          <div className="w-80 2xl:w-84 flex-shrink-0 overflow-hidden">
            <PropertiesPanel />
          </div>
        </div>

        {/* Tablet/mobile layout */}
        <div className="xl:hidden h-full flex flex-col overflow-hidden">
          <div className="px-2 sm:px-3 py-2 border-b border-[#0f3460] bg-[#16213e]">
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'segments', label: 'Segments' },
                { id: 'canvas', label: 'Canvas' },
                { id: 'preview', label: 'Preview' },
                { id: 'properties', label: 'Properties' },
              ].map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActiveCompactPanel(panel.id as 'segments' | 'canvas' | 'preview' | 'properties')}
                  className={`px-2 py-1.5 text-xs sm:text-sm rounded-md border transition-colors ${
                    activeCompactPanel === panel.id
                      ? 'bg-[#e94560] border-[#e94560] text-white'
                      : 'bg-[#0f0f23] border-[#0f3460] text-gray-300 hover:text-white'
                  }`}
                >
                  {panel.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {activeCompactPanel === 'segments' && (
              <div className="h-full overflow-hidden">
                <SegmentPicker />
              </div>
            )}
            {activeCompactPanel === 'canvas' && (
              <div className="h-full overflow-hidden">
                <Canvas />
              </div>
            )}
            {activeCompactPanel === 'preview' && (
              <div className="h-full overflow-hidden">
                <PreviewPanel />
              </div>
            )}
            {activeCompactPanel === 'properties' && (
              <div className="h-full overflow-hidden">
                <PropertiesPanel />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Bar */}
      <ExportBar />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default App;
