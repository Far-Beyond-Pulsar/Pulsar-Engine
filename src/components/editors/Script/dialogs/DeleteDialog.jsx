import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shared/AlertDialog";

/**
 * DeleteDialog Component
 * 
 * A modal dialog that confirms file or folder deletion.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {Function} props.onClose - Handler for closing the dialog
 * @param {Function} props.onDelete - Handler function for deletion
 * @param {string} props.path - Path of the item to be deleted
 * @param {boolean} [props.isDeleting=false] - Loading state during deletion
 * 
 * @example
 * <DeleteDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onDelete={handleDelete}
 *   path="/path/to/file.txt"
 * />
 */
const DeleteDialog = ({
  isOpen,
  onClose,
  onDelete,
  path,
  isDeleting = false
}) => {
  // Local loading state
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the deletion process
   * Sets loading state, calls deletion handler, and closes dialog
   * 
   * @async
   * @function
   */
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(path);
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
      // TODO: Add error notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-900 border border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-200">
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to delete{' '}
            <span className="text-gray-300 font-medium">{path}</span>?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Cancel button - disabled during deletion */}
          <AlertDialogCancel
            className="bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          {/* Delete button - shows loading state */}
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;

/**
 * Component Maintenance Notes:
 * 
 * 1. State Management:
 *    - Uses local state for loading
 *    - Accepts controlled open state from parent
 * 
 * 2. Error Handling:
 *    - Currently only logs errors to console
 *    - Consider adding error notifications/toasts
 * 
 * 3. Accessibility:
 *    - Uses AlertDialog for semantic HTML
 *    - Keyboard navigation supported
 * 
 * 4. Styling:
 *    - Uses Tailwind CSS
 *    - Maintains dark theme
 *    - Transition effects on buttons
 * 
 * 5. Future Improvements:
 *    - Add error handling UI
 *    - Add progress indicator for large deletions
 *    - Add confirmation text input for important deletions
 *    - Add undo functionality
 * 
 * 6. Dependencies:
 *    - @/components/shared/AlertDialog
 *    - React
 */
