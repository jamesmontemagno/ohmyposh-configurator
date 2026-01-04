import { useState, useEffect } from 'react';
import { NerdIcon } from '../NerdIcon';
import { useSavedConfigsStore } from '../../store/savedConfigsStore';

interface SaveConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string | null;
}

const MAX_CONFIGS = 50;

export function SaveConfigDialog({ isOpen, onClose, editingId }: SaveConfigDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { configs, saveConfig, updateConfig, lastLoadedId } = useSavedConfigsStore();
  
  const isEditing = editingId !== null && editingId !== undefined;
  const editingConfig = isEditing ? configs.find(c => c.id === editingId) : null;
  const isAtLimit = configs.length >= MAX_CONFIGS && !isEditing;

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editingConfig) {
      setName(editingConfig.name);
      setDescription(editingConfig.description || '');
      setTags(editingConfig.tags || []);
    } else if (isOpen) {
      // Reset form for new config
      setName('');
      setDescription('');
      setTags([]);
    }
    setError(null);
    setTagInput('');
  }, [isOpen, editingConfig]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    // Check for duplicate name (excluding current config if editing)
    const isDuplicate = configs.some(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingId
    );
    if (isDuplicate) {
      setError('A config with this name already exists');
      return;
    }

    if (isAtLimit) {
      setError(`Maximum of ${MAX_CONFIGS} configs reached. Delete some configs to save new ones.`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isEditing && editingId) {
        await updateConfig(editingId, {
          name: trimmedName,
          description: description.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        });
      } else {
        const result = await saveConfig(
          trimmedName,
          description.trim() || undefined,
          tags.length > 0 ? tags : undefined
        );
        if (!result) {
          setError('Failed to save config');
          setIsSaving(false);
          return;
        }
      }
      onClose();
    } catch {
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsNew = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    // Check for duplicate name
    const isDuplicate = configs.some(
      c => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setError('A config with this name already exists. Choose a different name.');
      return;
    }

    if (configs.length >= MAX_CONFIGS) {
      setError(`Maximum of ${MAX_CONFIGS} configs reached. Delete some configs to save new ones.`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await saveConfig(
        trimmedName,
        description.trim() || undefined,
        tags.length > 0 ? tags : undefined
      );
      if (!result) {
        setError('Failed to save config');
        setIsSaving(false);
        return;
      }
      onClose();
    } catch {
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1b2e] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <NerdIcon icon="action-save" size={20} className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Update Config' : 'Save Config'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <NerdIcon icon="ui-close" size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Limit warning */}
          {isAtLimit && (
            <div className="p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
              <p className="text-sm text-amber-300">
                You&apos;ve reached the maximum of {MAX_CONFIGS} saved configs. 
                Delete some configs to save new ones.
              </p>
            </div>
          )}

          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Theme"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Description field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this config..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Tags field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Tags <span className="text-gray-500">(optional, max 5)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag..."
                disabled={tags.length >= 5}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-900/50 text-purple-300 text-sm rounded"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white"
                    >
                      <NerdIcon icon="ui-close" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Config count */}
          <div className="text-sm text-gray-500">
            {configs.length}/{MAX_CONFIGS} configs saved
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          {/* Show "Save as New" button when editing a different config */}
          {isEditing && lastLoadedId !== editingId && (
            <button
              onClick={handleSaveAsNew}
              disabled={isSaving || isAtLimit}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Save as New
            </button>
          )}
          
          <button
            onClick={handleSave}
            disabled={isSaving || (isAtLimit && !isEditing)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <NerdIcon icon="action-save" size={16} />
                {isEditing ? 'Update' : 'Save'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
