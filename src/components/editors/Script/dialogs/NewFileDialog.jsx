import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/Dialog";

const NewFileDialog = ({
  isOpen,
  onClose,
  onCreate,
  selectedPath,
  currentProjectPath
}) => {
  const [filename, setFilename] = useState('');

  const handleCreate = () => {
    if (filename.trim()) {
      onCreate(filename.trim(), selectedPath);
      setFilename('');
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
            <span className="text-xs text-gray-500">
              Path: {selectedPath || currentProjectPath}
            </span>
          </div>
        </div>
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