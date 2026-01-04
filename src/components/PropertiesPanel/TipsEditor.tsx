import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';

interface TipsEditorProps {
  tips: string[];
  onChange: (tips: string[]) => void;
}

export function TipsEditor({ tips, onChange }: TipsEditorProps) {
  const [newTip, setNewTip] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddTip = () => {
    const trimmed = newTip.trim();
    if (trimmed && !tips.includes(trimmed)) {
      onChange([...tips, trimmed]);
      setNewTip('');
    }
  };

  const handleRemoveTip = (index: number) => {
    onChange(tips.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(tips[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    
    const trimmed = editValue.trim();
    if (trimmed && !tips.some((t, i) => i !== editingIndex && t === trimmed)) {
      const newTips = [...tips];
      newTips[editingIndex] = trimmed;
      onChange(newTips);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTip();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="space-y-2">
      {/* Tips List */}
      {tips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tips.map((tip, index) => (
            <div key={index}>
              {editingIndex === index ? (
                <div className="flex items-center gap-1 bg-[#0f0f23] rounded px-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={handleSaveEdit}
                    autoFocus
                    className="w-24 bg-transparent border-none text-sm text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="text-green-400 hover:text-green-300 p-0.5"
                    title="Save"
                  >
                    <NerdIcon icon="ui-check" size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-[#1a472a] text-green-300 px-2 py-0.5 rounded text-sm group">
                  <span
                    onClick={() => handleStartEdit(index)}
                    className="cursor-pointer hover:underline"
                    title="Click to edit"
                  >
                    {tip}
                  </span>
                  <button
                    onClick={() => handleRemoveTip(index)}
                    className="opacity-0 group-hover:opacity-100 text-green-400 hover:text-red-400 transition-opacity"
                    title="Remove"
                  >
                    <NerdIcon icon="ui-close" size={10} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">
          No trigger commands defined. Add at least one.
        </p>
      )}

      {/* Add New Tip Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTip}
          onChange={(e) => setNewTip(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add command (e.g., git)"
          className="flex-1 bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#06d6a0]"
        />
        <button
          onClick={handleAddTip}
          disabled={!newTip.trim() || tips.includes(newTip.trim())}
          className="px-3 py-1 bg-[#1a472a] text-green-300 rounded text-sm hover:bg-[#1e5631] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      {newTip.trim() && tips.includes(newTip.trim()) && (
        <p className="text-xs text-[#e94560]">This command is already added</p>
      )}
    </div>
  );
}
