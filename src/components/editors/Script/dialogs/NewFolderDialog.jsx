import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/Dialog";

const NewFolderDialog = ({
  isOpen,
  onClose,
  onCreate,
  selectedPath,
  currentProjectPath,
  folderName,
  onFolderNameChange,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate();
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
              <label htmlFor="foldername" className="text-sm text-gray-400">
                Folder name
              </label>
              <input
                id="foldername"
                type="text"
                value={folderName}
                onChange={(e) => onFolderNameChange(e.target.value)}
                placeholder="new-folder"
                className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <span className="text-xs text-gray-500">
                Path: {selectedPath || currentProjectPath}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white transition-colors"
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