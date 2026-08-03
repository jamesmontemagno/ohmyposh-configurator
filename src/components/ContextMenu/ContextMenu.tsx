import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NerdIcon } from '../NerdIcon';

export interface ContextMenuItem {
  label: string;
  icon: string;
  onSelect: () => void;
  destructive?: boolean;
  separatorBefore?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

const VIEWPORT_MARGIN = 8;

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState(position);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const { width, height } = menu.getBoundingClientRect();
    setMenuPosition({
      x: Math.max(VIEWPORT_MARGIN, Math.min(position.x, window.innerWidth - width - VIEWPORT_MARGIN)),
      y: Math.max(VIEWPORT_MARGIN, Math.min(position.y, window.innerHeight - height - VIEWPORT_MARGIN)),
    });
  }, [position]);

  useEffect(() => {
    const menu = menuRef.current;
    menu?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (menu && !menu.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Segment actions"
      className="fixed z-[100] min-w-48 rounded-md border border-[#0f3460] bg-[#1a1a2e] p-1 shadow-xl"
      style={{ left: menuPosition.x, top: menuPosition.y }}
    >
      {items.map((item) => (
        <div key={item.label}>
          {item.separatorBefore && <div className="my-1 border-t border-[#0f3460]" role="separator" />}
          <button
            type="button"
            role="menuitem"
            className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e94560] ${
              item.destructive
                ? 'text-red-500 hover:bg-red-900/20 hover:text-red-400'
                : 'text-gray-300 hover:bg-[#0f3460] hover:text-white'
            }`}
            onClick={() => {
              item.onSelect();
              onClose();
            }}
          >
            <NerdIcon icon={item.icon} size={14} />
            {item.label}
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
