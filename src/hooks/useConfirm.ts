import { useState, useCallback } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

const initialState: ConfirmState = {
  isOpen: false,
  title: '',
  message: '',
  resolve: null,
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

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    state.resolve?.(false);
    setState(initialState);
  }, [state.resolve]);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState(initialState);
  }, [state.resolve]);

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
