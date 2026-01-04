import { useEffect, useRef } from 'react';
import { NerdIcon } from '../NerdIcon';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const variantStyles = {
  danger: {
    icon: 'status-warning',
    iconColor: 'text-red-400',
    buttonBg: 'bg-red-600 hover:bg-red-700',
    headerBg: 'bg-red-900/30',
  },
  warning: {
    icon: 'status-warning',
    iconColor: 'text-amber-400',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
    headerBg: 'bg-amber-900/30',
  },
  info: {
    icon: 'status-info',
    iconColor: 'text-blue-400',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    headerBg: 'bg-blue-900/30',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const styles = variantStyles[variant];

  // Focus the confirm button when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the dialog is rendered
      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        onConfirm();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-[#1a1a2e] rounded-xl border border-[#0f3460] shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 ${styles.headerBg}`}>
          <div className={`p-2 rounded-lg bg-black/20 ${styles.iconColor}`}>
            <NerdIcon icon={styles.icon} size={24} />
          </div>
          <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#0f3460] bg-[#0f0f23]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-[#0f3460] hover:bg-[#1a4a7a] rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${styles.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
