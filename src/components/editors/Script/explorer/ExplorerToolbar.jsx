import React from 'react';
import { Plus, Folder, RefreshCw } from 'lucide-react';

const ExplorerToolbar = ({ onNewFile, onNewFolder, onRefresh, isLoading }) => (
  <div className="flex items-center gap-1">
    <button
      onClick={onNewFile}
      className="p-1 hover:bg-gray-900 rounded"
      title="New File (Ctrl+N)"
    >
      <Plus size={16} />
    </button>
    <button
      onClick={onNewFolder}
      className="p-1 hover:bg-gray-900 rounded"
      title="New Folder"
    >
      <Folder size={16} />
    </button>
    <button
      onClick={onRefresh}
      className="p-1 hover:bg-gray-900 rounded"
      title="Refresh Explorer"
    >
      <RefreshCw 
        size={16} 
        className={isLoading ? "animate-spin" : ""} 
      />
    </button>
  </div>
);

export default ExplorerToolbar;
