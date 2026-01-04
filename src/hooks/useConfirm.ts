import { useState, useCallback, useRef } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

const initialState: ConfirmState = {
  isOpen: false,
  title: '',
  message: '',
};

/**
 * Hook for displaying a styled confirmation dialog.
 * 
 * Usage:
 * ```tsx
 * const { confirm, ConfirmDialogProps } = useConfirm();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     variant: 'danger',
 *   });
 *   if (confirmed) {
 *     // proceed with deletion
 *   }
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     <ConfirmDialog {...ConfirmDialogProps} />
 *   </>
 * );
 * ```
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(initialState);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        ...options,
        isOpen: true,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState(initialState);
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState(initialState);
  }, []);

  return {
    confirm,
    ConfirmDialogProps: {
      isOpen: state.isOpen,
      title: state.title,
      message: state.message,
      confirmText: state.confirmText,
      cancelText: state.cancelText,
      variant: state.variant,
      onClose: handleClose,
      onConfirm: handleConfirm,
    },
  };
}
