import { useEffect, useState } from 'react';
import { NerdIcon } from '../NerdIcon';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration ?? 3000;
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300); // Start exit animation before removal

    const removeTimer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, toast.duration, onDismiss]);

  const iconMap = {
    success: 'ui-check',
    error: 'status-warning',
    info: 'ui-info',
  };

  const colorMap = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-red-600 border-red-500',
    info: 'bg-blue-600 border-blue-500',
  };

  const iconColorMap = {
    success: 'text-green-200',
    error: 'text-red-200',
    info: 'text-blue-200',
  };

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 ${colorMap[toast.type]} border rounded-lg shadow-lg text-white text-sm transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      }`}
    >
      <NerdIcon icon={iconMap[toast.type]} size={16} className={iconColorMap[toast.type]} />
      <span>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-2 p-0.5 hover:bg-white/20 rounded transition-colors"
      >
        <NerdIcon icon="ui-close" size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
