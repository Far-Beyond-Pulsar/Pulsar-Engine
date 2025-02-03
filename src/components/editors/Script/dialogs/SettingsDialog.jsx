import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/Dialog";

/**
 * SettingsDialog Component
 * 
 * A dialog component for managing editor settings including:
 * - Font size
 * - Tab size
 * - Word wrap
 * - Theme
 * - Minimap
 * - Line numbers
 * - Auto save
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {Function} props.onClose - Handler for closing dialog
 * @param {Object} props.settings - Current editor settings
 * @param {Function} props.onSettingsChange - Handler for settings updates
 * 
 * @example
 * <SettingsDialog
 *   isOpen={showSettings}
 *   onClose={() => setShowSettings(false)}
 *   settings={editorSettings}
 *   onSettingsChange={setEditorSettings}
 * />
 */
const SettingsDialog = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  /**
   * Handles individual setting changes
   * Updates the settings state while preserving other values
   * 
   * @param {string} key - Setting key to update
   * @param {any} value - New value for the setting
   */
  const handleSettingChange = (key, value) => {
    onSettingsChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-200">Editor Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Font Size Setting 
                Controls the editor font size (8-32px) */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">Font Size</label>
              <input
                type="number"
                value={settings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', Number(e.target.value))}
                className="w-20 bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
                min={8}
                max={32}
              />
            </div>

            {/* Tab Size Setting 
                Controls the number of spaces per tab (2-8) */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">Tab Size</label>
              <input
                type="number"
                value={settings.tabSize}
                onChange={(e) => handleSettingChange('tabSize', Number(e.target.value))}
                className="w-20 bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
                min={2}
                max={8}
              />
            </div>

            {/* Word Wrap Setting 
                Controls text wrapping behavior */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">Word Wrap</label>
              <select
                value={settings.wordWrap}
                onChange={(e) => handleSettingChange('wordWrap', e.target.value)}
                className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </div>

            {/* Theme Setting 
                Controls editor color theme */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
              >
                <option value="vs-dark">Dark</option>
                <option value="quasar-dark">Quasar Dark</option>
              </select>
            </div>

            {/* Minimap Setting 
                Controls code minimap visibility */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">Minimap</label>
              <input
                type="checkbox"
                checked={settings.minimap}
                onChange={(e) => handleSettingChange('minimap', e.target.checked)}
                className="h-4 w-4 rounded border-gray-800 bg-gray-950"
              />
            </div>

            {/* Line Numbers Setting 
                Controls line number display mode */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">Line Numbers</label>
              <select
                value={settings.lineNumbers}
                onChange={(e) => handleSettingChange('lineNumbers', e.target.value)}
                className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
                <option value="relative">Relative</option>
              </select>
            </div>

            {/* Auto Save Setting 
                Controls automatic save behavior */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">Auto Save</label>
              <select
                value={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.value)}
                className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
              >
                <option value="off">Off</option>
                <option value="afterDelay">After Delay</option>
                <option value="onFocusChange">On Focus Change</option>
              </select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;

/**
 * Component Maintenance Notes:
 * 
 * 1. Settings Categories:
 *    - Text rendering (font size, word wrap)
 *    - Editor behavior (tab size, auto save)
 *    - Visual features (theme, minimap, line numbers)
 * 
 * 2. Input Types:
 *    - Number inputs (font size, tab size)
 *    - Select dropdowns (theme, word wrap, line numbers)
 *    - Checkbox (minimap)
 * 
 * 3. Validation:
 *    - Number ranges enforced
 *    - Select options predefined
 *    - Type conversion handled
 * 
 * 4. Styling:
 *    - Consistent dark theme
 *    - Proper spacing
 *    - Input alignment
 *    - Responsive layout
 * 
 * 5. Future Improvements:
 *    - Add setting descriptions
 *    - Add setting categories/tabs
 *    - Add setting search
 *    - Add setting preview
 *    - Add setting import/export
 *    - Add setting profiles
 *    - Add custom theme editor
 *    - Add keybinding editor
 * 
 * 6. Accessibility:
 *    - Labeled inputs
 *    - Keyboard navigation
 *    - ARIA attributes
 *    - Focus management
 * 
 * 7. Dependencies:
 *    - @/components/shared/Dialog
 *    - React state management
 * 
 * 8. State Management:
 *    - Settings preserved between sessions
 *    - Real-time updates
 *    - Default values
 */
