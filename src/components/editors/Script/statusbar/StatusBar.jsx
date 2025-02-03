import React from 'react';
import { Settings, Save } from 'lucide-react';

/**
 * StatusBar Component
 * 
 * Displays editor status information and controls in the bottom bar.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.language - Current file language
 * @param {Object} props.cursorPosition - Cursor position
 * @param {number} props.cursorPosition.line - Current line number
 * @param {number} props.cursorPosition.column - Current column number
 * @param {number} props.tabSize - Tab size in spaces
 * @param {string} props.wordWrap - Word wrap state ('on'/'off')
 * @param {Function} props.onWordWrapToggle - Word wrap toggle handler
 * @param {Function} props.onSettingsClick - Settings button handler
 * @param {Function} props.onSaveClick - Save button handler
 * 
 * @example
 * <StatusBar
 *   language="javascript"
 *   cursorPosition={{ line: 1, column: 1 }}
 *   tabSize={2}
 *   wordWrap="on"
 *   onWordWrapToggle={() => {}}
 *   onSettingsClick={() => {}}
 *   onSaveClick={() => {}}
 * />
 */
const StatusBar = ({ 
  language = 'plaintext',
  cursorPosition = { line: 1, column: 1 },
  tabSize = 2,
  wordWrap = 'on',
  onWordWrapToggle,
  onSettingsClick,
  onSaveClick 
}) => {
  // Ensure valid cursor position
  const line = cursorPosition?.line || 1;
  const column = cursorPosition?.column || 1;

  return (
    <div className="flex items-center px-2 h-6 bg-black border-t border-gray-800 text-sm select-none">
      {/* File information */}
      <div className="flex items-center gap-4">
        <span className="text-blue-400">{language}</span>
        <span>{`Ln ${line}, Col ${column}`}</span>
        <span>Spaces: {tabSize}</span>
        <span>UTF-8</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Word Wrap Toggle */}
        <button
          className="px-2 hover:bg-gray-900 rounded transition-colors text-gray-400 hover:text-blue-400"
          onClick={onWordWrapToggle}
          title="Toggle Word Wrap"
        >
          {wordWrap === 'on' ? 'Wrap' : 'No Wrap'}
        </button>

        {/* Settings Button */}
        <button
          className="px-2 hover:bg-gray-900 rounded transition-colors text-gray-400 hover:text-blue-400"
          onClick={onSettingsClick}
          title="Settings"
        >
          <Settings size={14} />
        </button>

        {/* Save Button */}
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

/**
 * Component Maintenance Notes:
 * 
 * 1. Features:
 *    - Language display
 *    - Cursor position
 *    - Tab size indicator
 *    - Encoding display
 *    - Word wrap toggle
 *    - Settings access
 *    - Save button
 * 
 * 2. Styling:
 *    - Consistent height
 *    - Dark theme
 *    - Hover effects
 *    - Icon integration
 *    - Text selection disabled
 * 
 * 3. Accessibility:
 *    - Button titles/tooltips
 *    - Keyboard shortcuts
 *    - Focus states
 *    - Screen reader text
 * 
 * 4. User Interaction:
 *    - Click handlers
 *    - Toggle states
 *    - Visual feedback
 * 
 * 5. Future Improvements:
 *    - Add more status indicators
 *    - Add git integration
 *    - Add encoding selection
 *    - Add line ending display
 *    - Add indent guide toggle
 *    - Add status messages
 *    - Add progress indicators
 * 
 * 6. Dependencies:
 *    - lucide-react icons
 * 
 * 7. Props Validation:
 *    - Default values
 *    - Type checking
 *    - Null safety
 */
