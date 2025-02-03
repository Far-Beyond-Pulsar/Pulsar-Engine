import React from 'react';
import { Plus, Folder, RefreshCw } from 'lucide-react';

/**
 * ExplorerToolbar Component
 * 
 * Toolbar for file explorer actions like creating new files/folders
 * and refreshing the explorer view.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onNewFile - Handler for new file creation
 * @param {Function} props.onNewFolder - Handler for new folder creation
 * @param {Function} props.onRefresh - Handler for refreshing explorer
 * @param {boolean} props.isLoading - Loading state indicator
 * 
 * @example
 * <ExplorerToolbar
 *   onNewFile={handleNewFile}
 *   onNewFolder={handleNewFolder}
 *   onRefresh={handleRefresh}
 *   isLoading={isLoading}
 * />
 */
const ExplorerToolbar = ({ onNewFile, onNewFolder, onRefresh, isLoading }) => (
  <div className="flex items-center gap-1">
    {/* New File Button */}
    <button
      onClick={onNewFile}
      className="p-1 hover:bg-gray-900 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="New File (Ctrl+N)"
      disabled={isLoading}
    >
      <Plus size={16} className="text-gray-400 hover:text-gray-300" />
    </button>

    {/* New Folder Button */}
    <button
      onClick={onNewFolder}
      className="p-1 hover:bg-gray-900 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="New Folder"
      disabled={isLoading}
    >
      <Folder size={16} className="text-gray-400 hover:text-gray-300" />
    </button>

    {/* Refresh Button */}
    <button
      onClick={onRefresh}
      className="p-1 hover:bg-gray-900 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Refresh Explorer"
      disabled={isLoading}
    >
      <RefreshCw 
        size={16} 
        className={`text-gray-400 hover:text-gray-300 transition-all ${
          isLoading ? "animate-spin" : ""
        }`}
      />
    </button>
  </div>
);

export default ExplorerToolbar;

/**
 * Component Maintenance Notes:
 * 
 * 1. Features:
 *    - New file creation
 *    - New folder creation
 *    - Explorer refresh
 *    - Loading states
 * 
 * 2. Styling:
 *    - Consistent button styling
 *    - Loading state animations
 *    - Hover effects
 *    - Disabled states
 * 
 * 3. Accessibility:
 *    - Button titles/tooltips
 *    - Keyboard shortcuts
 *    - Disabled state handling
 * 
 * 4. Future Improvements:
 *    - Add more actions (collapse all, etc.)
 *    - Add keyboard shortcuts
 *    - Add tooltips component
 *    - Add confirmation dialogs
 * 
 * 5. Dependencies:
 *    - lucide-react icons
 */
