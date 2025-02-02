import React from 'react';
import { Settings, Save } from 'lucide-react';

const StatusBar = ({ 
  language = 'plaintext',
  cursorPosition = { line: 1, column: 1 },  // Default value
  tabSize = 2,
  wordWrap = 'on',
  onWordWrapToggle,
  onSettingsClick,
  onSaveClick 
}) => {
  // Ensure cursorPosition is valid, default to 1,1 if undefined
  const line = cursorPosition?.line || 1;
  const column = cursorPosition?.column || 1;

  return (
    <div className="flex items-center px-2 h-6 bg-black border-t border-gray-800 text-sm select-none">
      <div className="flex items-center gap-4">
        <span className="text-blue-400">{language}</span>
        <span>{`Ln ${line}, Col ${column}`}</span>
        <span>Spaces: {tabSize}</span>
        <span>UTF-8</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button
          className="px-2 hover:bg-gray-900 rounded transition-colors text-gray-400 hover:text-blue-400"
          onClick={onWordWrapToggle}
          title="Toggle Word Wrap"
        >
          {wordWrap === 'on' ? 'Wrap' : 'No Wrap'}
        </button>
        <button
          className="px-2 hover:bg-gray-900 rounded transition-colors text-gray-400 hover:text-blue-400"
          onClick={onSettingsClick}
          title="Settings"
        >
          <Settings size={14} />
        </button>
        <button
          className="px-2 hover:bg-gray-900 rounded transition-colors text-blue-400"
          onClick={onSaveClick}
          title="Save (Ctrl+S)"
        >
          <Save size={14} />
        </button>
      </div>
    </div>
  );
};

export default StatusBar;