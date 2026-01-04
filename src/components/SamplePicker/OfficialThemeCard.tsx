import { NerdIcon } from '../NerdIcon';
import type { OfficialTheme } from '../../utils/officialThemeLoader';
import { getThemePreviewUrl } from '../../utils/officialThemeLoader';
import { useState } from 'react';

interface OfficialThemeCardProps {
  theme: OfficialTheme;
  onSelect: (theme: OfficialTheme) => void;
  isLoading?: boolean;
}

export function OfficialThemeCard({ theme, onSelect, isLoading }: OfficialThemeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <button
      onClick={() => onSelect(theme)}
      disabled={isLoading}
      className="group relative flex flex-col bg-[#0f0f23] hover:bg-[#16172e] border border-gray-700 hover:border-purple-500 rounded-lg transition-all text-left overflow-hidden disabled:opacity-50 disabled:cursor-wait"
    >
      {/* Preview Image Container */}
      <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
        {!imageError ? (
          <>
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                <NerdIcon icon="dev-terminal" size={32} className="text-gray-600" />
              </div>
            )}
            <img
              src={getThemePreviewUrl(theme)}
              alt={`${theme.name} theme preview`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover object-top transition-opacity ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <NerdIcon icon="dev-terminal" size={32} className="text-gray-500" />
          </div>
        )}
        
        {/* Minimal badge */}
        {theme.isMinimal && (
          <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            No Nerd Font
          </div>
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Theme name and GitHub link */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-white truncate flex-1">
            {theme.name}
          </h3>
          <a
            href={theme.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors ml-2 flex-shrink-0"
            title="View on GitHub"
          >
            <NerdIcon icon="dev-github" size={16} className="text-gray-400 hover:text-white" />
          </a>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {theme.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-700/70 text-gray-300 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {theme.tags.length > 4 && (
            <span className="text-xs text-gray-500">
              +{theme.tags.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/50 rounded-lg pointer-events-none"></div>
    </button>
  );
}
