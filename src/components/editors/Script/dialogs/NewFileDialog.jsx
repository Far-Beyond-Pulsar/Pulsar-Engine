import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/Dialog";

/**
 * NewFileDialog Component
 * 
 * A modal dialog for creating new files in the editor.
 * Handles file name input and creation.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {Function} props.onClose - Handler for closing the dialog
 * @param {Function} props.onCreate - Handler function for file creation
 * @param {string} props.selectedPath - Current selected directory path
 * @param {string} props.currentProjectPath - Root project path
 * 
 * @example
 * <NewFileDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onCreate={handleCreate}
 *   selectedPath="/path/to/directory"
 *   currentProjectPath="/project/root"
 * />
 */
const NewFileDialog = ({
  isOpen,
  onClose,
  onCreate,
  selectedPath,
  currentProjectPath
}) => {
  // State for filename input
  const [filename, setFilename] = useState('');

  /**
   * Handles file creation
   * Validates input and calls creation handler
   * 
   * @function
   */
  const handleCreate = () => {
    if (filename.trim()) {
      onCreate(filename.trim(), selectedPath);
      setFilename(''); // Reset input
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-200">Create New File</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the name for your new file
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="filename" className="text-sm text-gray-400">
              Filename with extension
            </label>
            {/* Filename input with enter key handler */}
            <input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="example.js"
              className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreate();
                }
              }}
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
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white transition-colors"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewFileDialog;

/**
 * Component Maintenance Notes:
 * 
 * 1. State Management:
 *    - Uses local state for filename input
 *    - Parent controls dialog visibility
 * 
 * 2. Validation:
 *    - Currently only checks for non-empty trimmed filename
 *    - Consider adding:
 *      - File extension validation
 *      - Reserved name checking
 *      - Path length limits
 * 
 * 3. Accessibility:
 *    - Labeled inputs
 *    - Keyboard navigation (Enter to submit)
 *    - Autofocus on input
 * 
 * 4. Styling:
 *    - Tailwind CSS
 *    - Dark theme
 *    - Focus states
 *    - Hover effects
 * 
 * 5. Future Improvements:
 *    - Add file template selection
 *    - Add file icon preview
 *    - Add recent/common extensions list
 *    - Add validation messages
 * 
 * 6. Dependencies:
 *    - @/components/shared/Dialog
 *    - React
 */
