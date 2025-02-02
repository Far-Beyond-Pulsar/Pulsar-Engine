import React from 'react';
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

const DeleteDialog = ({
  isOpen,
  onClose,
  onDelete,
  itemPath,
  isDeleting = false
}) => {
  const handleDelete = async () => {
    await onDelete();
    onClose();
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
            <span className="text-gray-300 font-medium">{itemPath}</span>?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;