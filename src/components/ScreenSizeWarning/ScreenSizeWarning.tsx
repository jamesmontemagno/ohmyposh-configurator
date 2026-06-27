import { useEffect, useState } from 'react';
import { NerdIcon } from '../NerdIcon';

export function ScreenSizeWarning() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('smallScreenNoticeDismissed') === 'true';
  });

  useEffect(() => {
    const checkScreenSize = () => {
      // Show notice for phone-sized screens only.
      setIsSmallScreen(window.innerWidth < 640);
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('smallScreenNoticeDismissed', 'true');
  };

  if (!isSmallScreen || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:w-96 z-40">
      <div className="bg-[#1a1a2e] border border-[#0f3460] rounded-lg shadow-xl p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Dismiss"
        >
          <NerdIcon icon="ui-close" size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="bg-[#0f3460] rounded-full p-2.5 flex-shrink-0">
            <NerdIcon icon="ui-monitor" size={20} className="text-blue-300" />
          </div>

          <div className="flex-1">
            <h2 className="text-base font-bold text-white mb-1.5">
              Small screen mode
            </h2>
            <p className="text-sm text-gray-300 mb-3">
              The compact layout is enabled for phones. For the full workspace, use a larger screen or rotate to landscape.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
