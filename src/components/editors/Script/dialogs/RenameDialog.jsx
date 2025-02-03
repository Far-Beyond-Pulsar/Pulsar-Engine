import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/Dialog";

/**
 * RenameDialog Component
 * 
 * A modal dialog for renaming files and folders.
 * Handles name input with validation and rename operation.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {Function} props.onClose - Handler for closing the dialog
 * @param {Function} props.onRename - Handler function for rename operation
 * @param {Object} props.item - Item being renamed (file or folder)
 * 
 * @example
 * <RenameDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onRename={handleRename}
 *   item={{ name: 'oldname.js', path: '/path/to/oldname.js', type: 'file' }}
 * />
 */
const RenameDialog = ({
  isOpen,
  onClose,
  onRename,
  item,
}) => {
  // State for new name input
  const [newName, setNewName] = useState('');

  /**
   * Effect to initialize input with current name when item changes
   */
  useEffect(() => {
    if (item) {
      setNewName(item.name);
    }
  }, [item]);

  /**
   * Handles form submission for rename operation
   * Validates input and calls rename handler
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName.trim() && newName !== item.name) {
      onRename(item.path, newName);
      setNewName('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-200">Rename {item?.type}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter new name for {item?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              {/* New name input */}
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
          {/* Dialog actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setNewName('');
                onClose();
              }}
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newName.trim() || newName === item?.name}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
            >
              Rename
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog;

/**
 * Component Maintenance Notes:
 * 
 * 1. State Management:
 *    - Uses local state for new name input
 *    - Uses useEffect to sync with item prop
 * 
 * 2. Validation:
 *    - Prevents empty names
 *    - Prevents same name submissions
 *    - Consider adding:
 *      - File extension validation
 *      - Character restrictions
 *      - Case sensitivity handling
 * 
 * 3. Form Handling:
 *    - Uses native form submission
 *    - Resets form on close
 *    - Disables submit when invalid
 * 
 * 4. Accessibility:
 *    - Autofocus on input
 *    - Form submission handling
 *    - Disabled state handling
 * 
 * 5. Future Improvements:
 *    - Add extension warning/preservation
 *    - Add name conflict checking
 *    - Add undo capability
 *    - Add validation messages
 * 
 * 6. Dependencies:
 *    - @/components/shared/Dialog
 *    - React
 */
