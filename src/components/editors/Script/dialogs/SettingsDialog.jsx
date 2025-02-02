import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/Dialog";

const SettingsDialog = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
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
            {/* Font Size */}
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

            {/* Tab Size */}
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

            {/* Word Wrap */}
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

            {/* Theme */}
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

            {/* Minimap */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">Minimap</label>
              <input
                type="checkbox"
                checked={settings.minimap}
                onChange={(e) => handleSettingChange('minimap', e.target.checked)}
                className="h-4 w-4 rounded border-gray-800 bg-gray-950"
              />
            </div>

            {/* Line Numbers */}
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

            {/* Auto Save */}
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