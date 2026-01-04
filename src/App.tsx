import { useEffect, useRef } from 'react';
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Segment Picker */}
        <div className="w-56 flex-shrink-0 overflow-hidden">
          <SegmentPicker />
        </div>

        {/* Center - Canvas and Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 overflow-auto">
            <Canvas />
          </div>

          {/* Preview Panel */}
          <PreviewPanel />
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-84 flex-shrink-0 overflow-hidden">
          <PropertiesPanel />
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
