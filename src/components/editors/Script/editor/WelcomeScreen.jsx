import React from 'react';
import { FileCode, FolderInput, Plus } from 'lucide-react';

/**
 * WelcomeScreen Component
 * 
 * Initial screen shown when no files are open.
 * Provides options to open a folder or create a new file.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onOpenFolder - Handler for opening folder
 * @param {Function} props.onNewFile - Handler for creating new file
 * 
 * @example
 * <WelcomeScreen
 *   onOpenFolder={handleOpenFolder}
 *   onNewFile={handleNewFile}
 * />
 */
const WelcomeScreen = ({ onOpenFolder, onNewFile }) => {
  /**
   * Handles folder opening with error handling
   * 
   * @async
   * @function
   */
  const handleOpenFolder = async () => {
    try {
      await onOpenFolder();
    } catch (error) {
      console.log('Folder selection cancelled or failed');
      // TODO: Add error notification
    }
  };

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        {/* Logo and title */}
        <FileCode size={48} className="mx-auto mb-4 text-gray-700" />
        <h2 className="text-xl font-medium mb-2">Welcome to Quasar</h2>
        <p className="text-sm">Open a file to start editing</p>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2 justify-center">
          {/* Open folder button */}
          <button
            onClick={handleOpenFolder}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            <FolderInput size={16} />
            Open Folder
          </button>

          {/* New file button */}
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

/**
 * Component Maintenance Notes:
 * 
 * 1. UI Elements:
 *    - Welcome message
 *    - Icon display
 *    - Action buttons
 *    - Hover states
 * 
 * 2. Error Handling:
 *    - Basic error catch
 *    - Could add error notifications
 *    - Could add retry logic
 * 
 * 3. Styling:
 *    - Tailwind CSS
 *    - Responsive design
 *    - Color theming
 *    - Transitions
 * 
 * 4. Future Improvements:
 *    - Add recent projects list
 *    - Add project templates
 *    - Add keyboard shortcuts
 *    - Add loading states
 *    - Add error messages
 *    - Add tutorial/help links
 * 
 * 5. Dependencies:
 *    - lucide-react icons
 * 
 * 6. Accessibility:
 *    - Add ARIA labels
 *    - Add keyboard navigation
 *    - Add screen reader text
 */
