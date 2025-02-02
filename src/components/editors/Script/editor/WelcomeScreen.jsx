// WelcomeScreen.jsx
import React from 'react';
import { FileCode, FolderInput, Plus } from 'lucide-react';

const WelcomeScreen = ({ onOpenFolder, onNewFile }) => {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <FileCode size={48} className="mx-auto mb-4 text-gray-700" />
        <h2 className="text-xl font-medium mb-2">Welcome to Quasar</h2>
        <p className="text-sm">Open a file to start editing</p>
        <div className="mt-4 flex gap-2 justify-center">
          <button
            onClick={onOpenFolder}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            <FolderInput size={16} />
            Open Folder
          </button>
          <button
            onClick={onNewFile}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New File
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;