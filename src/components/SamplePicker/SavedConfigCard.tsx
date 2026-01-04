import { useState, useRef, useEffect } from 'react';
import { NerdIcon } from '../NerdIcon';
import type { SavedConfig } from '../../types/ohmyposh';

interface SavedConfigCardProps {
  config: SavedConfig;
  isCurrentlyLoaded: boolean;
  onLoad: () => void;
  onRename: (newName: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }
  
  return `${Math.floor(diffInMonths / 12)}y ago`;
}

export function SavedConfigCard({
  config,
  isCurrentlyLoaded,
  onLoad,
  onRename,
  onDuplicate,
  onDelete,
}: SavedConfigCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(config.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Focus input when renaming
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    setShowMenu(false);
    setIsRenaming(true);
    setNewName(config.name);
  };

  const handleRenameSubmit = () => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== config.name) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(config.name);
    }
  };

  const handleDuplicate = () => {
    setShowMenu(false);
    onDuplicate();
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete();
  };

  return (
    <div
      className={`group relative flex flex-col p-4 bg-[#0f0f23] border rounded-lg transition-all ${
        isCurrentlyLoaded
          ? 'border-purple-500 ring-1 ring-purple-500/50'
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* Currently loaded indicator */}
      {isCurrentlyLoaded && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-full">
          Active
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleRenameKeyDown}
              className="w-full px-2 py-1 bg-gray-800 border border-purple-500 rounded text-white text-sm font-semibold focus:outline-none"
            />
          ) : (
            <h3 className="text-sm font-semibold text-white truncate" title={config.name}>
              {config.name}
            </h3>
          )}
        </div>

        {/* Menu button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
          >
            <NerdIcon icon="ui-more-vertical" size={16} />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-xl py-1 z-10">
              <button
                onClick={handleRename}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <NerdIcon icon="action-edit" size={14} />
                Rename
              </button>
              <button
                onClick={handleDuplicate}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <NerdIcon icon="action-copy" size={14} />
                Duplicate
              </button>
              <div className="my-1 border-t border-gray-700" />
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
              >
                <NerdIcon icon="action-delete" size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {config.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{config.description}</p>
      )}

      {/* Tags */}
      {config.tags && config.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {config.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {config.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{config.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-gray-500">
          Updated {formatRelativeTime(config.updatedAt)}
        </span>
        
        <button
          onClick={onLoad}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            isCurrentlyLoaded
              ? 'bg-gray-700 text-gray-400 cursor-default'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
          disabled={isCurrentlyLoaded}
        >
          {isCurrentlyLoaded ? 'Loaded' : 'Load'}
        </button>
      </div>
    </div>
  );
}
