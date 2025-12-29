import { useEffect, useState } from 'react';
import { Monitor, X } from 'lucide-react';

export function ScreenSizeWarning() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the warning
    const dismissed = localStorage.getItem('screenSizeWarningDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const checkScreenSize = () => {
      // Show warning for screens smaller than 1024px (Tailwind's lg breakpoint)
      setIsSmallScreen(window.innerWidth < 1024);
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('screenSizeWarningDismissed', 'true');
  };

  if (!isSmallScreen || isDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
            <Monitor className="text-blue-600" size={24} />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Better on Desktop! 🖥️
            </h2>
            <p className="text-gray-600 mb-4">
              This Oh My Posh configurator is optimized for larger screens. For the best experience, 
              we recommend using a desktop or tablet in landscape mode.
            </p>
            <p className="text-sm text-gray-500">
              You can still use the site, but some features may be harder to access on smaller screens.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
}
