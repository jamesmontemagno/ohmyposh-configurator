import { NerdIcon } from '../NerdIcon';
import type { OfficialTheme } from '../../utils/officialThemeLoader';
import { getThemePreviewUrl } from '../../utils/officialThemeLoader';
import { GeneratedPreview } from './GeneratedPreview';

interface OfficialThemeCardProps {
  theme: OfficialTheme;
  onSelect: (theme: OfficialTheme) => void;
  isLoading?: boolean;
}

export function OfficialThemeCard({ theme, onSelect, isLoading }: OfficialThemeCardProps) {
  const imageUrl = getThemePreviewUrl(theme.file);

  return (
    <button
      onClick={() => onSelect(theme)}
      disabled={isLoading}
      className="group relative flex flex-col bg-[#0f0f23] hover:bg-[#16172e] border border-gray-700 hover:border-purple-500 rounded-lg transition-all text-left overflow-hidden disabled:opacity-50 disabled:cursor-wait"
    >
      {/* Preview Image Container - 16:9 aspect ratio */}
      <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
        <GeneratedPreview src={imageUrl} label={theme.name} />
        
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
            <NerdIcon icon="vcs-github" size={16} className="text-gray-400 hover:text-white" />
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
