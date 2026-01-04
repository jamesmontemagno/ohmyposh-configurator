import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';

interface FolderFilterEditorProps {
  includeFolders: string[];
  excludeFolders: string[];
  onIncludeChange: (folders: string[]) => void;
  onExcludeChange: (folders: string[]) => void;
}

export function FolderFilterEditor({
  includeFolders,
  excludeFolders,
  onIncludeChange,
  onExcludeChange,
}: FolderFilterEditorProps) {
  const [isExpanded, setIsExpanded] = useState(
    includeFolders.length > 0 || excludeFolders.length > 0
  );
  const [newInclude, setNewInclude] = useState('');
  const [newExclude, setNewExclude] = useState('');

  const addFolder = (type: 'include' | 'exclude') => {
    if (type === 'include' && newInclude.trim()) {
      onIncludeChange([...includeFolders, newInclude.trim()]);
      setNewInclude('');
    } else if (type === 'exclude' && newExclude.trim()) {
      onExcludeChange([...excludeFolders, newExclude.trim()]);
      setNewExclude('');
    }
  };

  const removeFolder = (type: 'include' | 'exclude', index: number) => {
    if (type === 'include') {
      onIncludeChange(includeFolders.filter((_, i) => i !== index));
    } else {
      onExcludeChange(excludeFolders.filter((_, i) => i !== index));
    }
  };

  const updateFolder = (type: 'include' | 'exclude', index: number, value: string) => {
    if (type === 'include') {
      const updated = [...includeFolders];
      updated[index] = value;
      onIncludeChange(updated);
    } else {
      const updated = [...excludeFolders];
      updated[index] = value;
      onExcludeChange(updated);
    }
  };

  return (
    <div className="space-y-3 p-3 bg-[#1a1a2e] rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <NerdIcon icon="folder-closed" className="text-[#e94560]" />
          <span className="text-sm font-medium text-white">Folder Filters</span>
          {(includeFolders.length > 0 || excludeFolders.length > 0) && (
            <span className="text-xs text-gray-500">
              ({includeFolders.length} include, {excludeFolders.length} exclude)
            </span>
          )}
        </div>
        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-[#0f3460]">
          {/* Syntax Help */}
          <div className="text-xs text-gray-500 bg-[#0f0f23] p-2 rounded">
            <p className="font-medium text-gray-400 mb-1">Glob Pattern Examples:</p>
            <ul className="space-y-0.5 ml-2">
              <li><code className="text-[#e94560]">~/projects/**</code> - All subdirs in projects</li>
              <li><code className="text-[#e94560]">**/node_modules</code> - Any node_modules folder</li>
              <li><code className="text-[#e94560]">/home/user/work</code> - Exact path</li>
            </ul>
          </div>

          {/* Include Folders */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400">
              Include Folders (only show in these)
            </label>
            <div className="space-y-1">
              {includeFolders.map((folder, index) => (
                <div key={index} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={folder}
                    onChange={(e) => updateFolder('include', index, e.target.value)}
                    className="flex-1 bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white font-mono"
                  />
                  <button
                    onClick={() => removeFolder('include', index)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Remove"
                  >
                    <NerdIcon icon="ui-close" size={14} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newInclude}
                  onChange={(e) => setNewInclude(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFolder('include')}
                  placeholder="Add folder pattern..."
                  className="flex-1 bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white font-mono"
                />
                <button
                  onClick={() => addFolder('include')}
                  disabled={!newInclude.trim()}
                  className="text-[#06d6a0] hover:text-green-300 p-1 disabled:opacity-50"
                  title="Add"
                >
                  <NerdIcon icon="ui-plus" size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Exclude Folders */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400">
              Exclude Folders (never show in these)
            </label>
            <div className="space-y-1">
              {excludeFolders.map((folder, index) => (
                <div key={index} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={folder}
                    onChange={(e) => updateFolder('exclude', index, e.target.value)}
                    className="flex-1 bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white font-mono"
                  />
                  <button
                    onClick={() => removeFolder('exclude', index)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Remove"
                  >
                    <NerdIcon icon="ui-close" size={14} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newExclude}
                  onChange={(e) => setNewExclude(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFolder('exclude')}
                  placeholder="Add folder pattern..."
                  className="flex-1 bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white font-mono"
                />
                <button
                  onClick={() => addFolder('exclude')}
                  disabled={!newExclude.trim()}
                  className="text-[#06d6a0] hover:text-green-300 p-1 disabled:opacity-50"
                  title="Add"
                >
                  <NerdIcon icon="ui-plus" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
