import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/Dialog";

/**
 * NewFolderDialog Component
 * 
 * A modal dialog for creating new folders in the project structure.
 * Handles folder name input and creation with form submission.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {Function} props.onClose - Handler for closing the dialog
 * @param {Function} props.onCreate - Handler function for folder creation
 * @param {string} props.selectedPath - Current selected directory path
 * @param {string} props.currentProjectPath - Root project path
 * 
 * @example
 * <NewFolderDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onCreate={handleCreate}
 *   selectedPath="/path/to/parent"
 *   currentProjectPath="/project/root"
 * />
 */
const NewFolderDialog = ({
  isOpen,
  onClose,
  onCreate,
  selectedPath,
  currentProjectPath,
}) => {
  // State for folder name input
  const [folderName, setFolderName] = useState('');

  /**
   * Handles form submission for folder creation
   * Validates input, calls creation handler, and resets form
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreate(folderName, selectedPath);
      setFolderName(''); // Reset input
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-200">Create New Folder</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the name for your new folder
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              {/* Folder name input field */}
              <label htmlFor="foldername" className="text-sm text-gray-400">
                Folder name
              </label>
              <input
                id="foldername"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="new-folder"
                className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {/* Path display */}
              <span className="text-xs text-gray-500">
                Path: {selectedPath || currentProjectPath}
              </span>
            </div>
          </div>
          {/* Dialog actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition-colors"
              onClick={() => {
                setFolderName('');
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white transition-colors"
              disabled={!folderName.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFolderDialog;

/**
 * Component Maintenance Notes:
 * 
 * 1. State Management:
 *    - Uses local state for folder name input
 *    - Parent controls dialog visibility
 * 
 * 2. Form Handling:
 *    - Uses native form submission
 *    - Prevents empty folder names
 *    - Resets form on close
 * 
 * 3. Validation:
 *    - Currently only checks for non-empty trimmed name
 *    - Consider adding:
 *      - Invalid character checking
 *      - Reserved name checking
 *      - Path length validation
 * 
 * 4. Accessibility:
 *    - Labeled input
 *    - Autofocus on input
 *    - Form submission handling
 * 
 * 5. Future Improvements:
 *    - Add folder template selection
 *    - Add validation messages
 *    - Add keyboard shortcuts
 *    - Add folder permission options
 * 
 * 6. Dependencies:
 *    - @/components/shared/Dialog
 *    - React
 */
