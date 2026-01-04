import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';

interface ColorTemplateEditorProps {
  label: string;
  templates: string[];
  onChange: (templates: string[]) => void;
  defaultColor: string;
  colorType: 'foreground' | 'background';
}

export function ColorTemplateEditor({
  label,
  templates,
  onChange,
  defaultColor,
  colorType,
}: ColorTemplateEditorProps) {
  const [isExpanded, setIsExpanded] = useState(templates.length > 0);
  const [newTemplate, setNewTemplate] = useState('');

  const addTemplate = () => {
    if (newTemplate.trim()) {
      onChange([...templates, newTemplate.trim()]);
      setNewTemplate('');
    }
  };

  const removeTemplate = (index: number) => {
    onChange(templates.filter((_, i) => i !== index));
  };

  const updateTemplate = (index: number, value: string) => {
    const updated = [...templates];
    updated[index] = value;
    onChange(updated);
  };

  // Basic validation - check for balanced {{ }}
  const validateTemplate = (template: string): boolean => {
    const openCount = (template.match(/\{\{/g) || []).length;
    const closeCount = (template.match(/\}\}/g) || []).length;
    return openCount === closeCount && openCount > 0;
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300"
      >
        <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
        {label}
        {templates.length > 0 && (
          <span className="bg-[#0f3460] text-gray-300 px-1.5 py-0.5 rounded text-xs">
            {templates.length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-4 border-l-2 border-[#0f3460]">
          {/* Syntax Help */}
          <div className="text-xs text-gray-500">
            <p>Templates evaluated in order. First match wins.</p>
            <p className="font-mono text-[#e94560]">
              {'{{ if .Condition }}#color{{ end }}'}
            </p>
          </div>

          {/* Existing Templates */}
          {templates.map((template, index) => {
            const isValid = validateTemplate(template);
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-start gap-1">
                  <textarea
                    value={template}
                    onChange={(e) => updateTemplate(index, e.target.value)}
                    rows={2}
                    className={`flex-1 bg-[#0f0f23] border rounded px-2 py-1 text-sm text-white font-mono resize-none ${
                      isValid ? 'border-[#0f3460]' : 'border-red-500'
                    }`}
                  />
                  <button
                    onClick={() => removeTemplate(index)}
                    className="text-red-400 hover:text-red-300 p-1 mt-1"
                    title="Remove template"
                  >
                    <NerdIcon icon="ui-close" size={14} />
                  </button>
                </div>
                {!isValid && (
                  <p className="text-xs text-red-400">
                    Template syntax appears invalid
                  </p>
                )}
              </div>
            );
          })}

          {/* Add New Template */}
          <div className="flex items-start gap-1">
            <textarea
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  addTemplate();
                }
              }}
              rows={2}
              placeholder="{{ if .Condition }}#hexcolor{{ end }}"
              className="flex-1 bg-[#0f0f23] border border-[#0f3460] rounded px-2 py-1 text-sm text-white font-mono resize-none"
            />
            <button
              onClick={addTemplate}
              disabled={!newTemplate.trim()}
              className="text-[#06d6a0] hover:text-green-300 p-1 mt-1 disabled:opacity-50"
              title="Add template (Ctrl+Enter)"
            >
              <NerdIcon icon="ui-plus" size={14} />
            </button>
          </div>

          {/* Default fallback info */}
          <p className="text-xs text-gray-500">
            Default {colorType}: <span className="text-[#e94560]">{defaultColor || 'inherit'}</span>
          </p>
        </div>
      )}
    </div>
  );
}
