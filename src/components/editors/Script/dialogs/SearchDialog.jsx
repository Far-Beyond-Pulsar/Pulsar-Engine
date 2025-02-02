import React, { useState, useEffect } from 'react';
import { Search, FileCode } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/shared/Dialog";
import { isImageFile, is3DFile } from '@/utils/fileUtils';

const SearchDialog = ({
  isOpen,
  onClose,
  files,
  onFileSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    const flattenFiles = (items, results = []) => {
      items.forEach(item => {
        results.push(item);
        if (item.children) {
          flattenFiles(item.children, results);
        }
      });
      return results;
    };

    const allFiles = flattenFiles(files);
    const filtered = allFiles.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [searchQuery, files]);

  const handleKeyDown = (e) => {
    // Close on escape
    if (e.key === 'Escape') {
      onClose();
    }
    
    // Select first result on enter if available
    if (e.key === 'Enter' && filteredFiles.length > 0) {
      e.preventDefault();
      onFileSelect(filteredFiles[0]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800 max-w-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-gray-950 rounded border border-gray-800 px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search files..."
              className="bg-transparent text-white flex-1 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-96 overflow-auto">
            {filteredFiles.map(file => (
              <button
                key={file.path}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-800 rounded text-left"
                onClick={() => {
                  onFileSelect(file);
                  onClose();
                }}
              >
                <FileCode size={16} className="text-blue-400 shrink-0" />
                <span className="text-gray-300 truncate">{file.name}</span>
                <span className="text-gray-500 text-sm ml-auto truncate">{file.path}</span>
              </button>
            ))}
            {searchQuery && filteredFiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No files found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;