import { useCallback, useState } from 'react';
import type { ToastData } from '../components/Toast';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastData['type'] = 'info', duration = 3000) => {
    const id = `toast-${++toastIdCounter}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
