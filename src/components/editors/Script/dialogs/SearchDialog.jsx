import React, { useState, useEffect } from 'react';
import { Search, FileCode } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/shared/Dialog";
import { isImageFile, is3DFile } from '@/utils/fileUtils';

/**
 * SearchDialog Component
 * 
 * A modal dialog for searching files in the project.
 * Provides real-time filtering and keyboard navigation.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {Function} props.onClose - Handler for closing the dialog
 * @param {Array} props.files - Array of file and folder objects to search through
 * @param {Function} props.onFileSelect - Handler for file selection
 * 
 * @example
 * <SearchDialog
 *   isOpen={showSearch}
 *   onClose={() => setShowSearch(false)}
 *   files={projectFiles}
 *   onFileSelect={handleFileOpen}
 * />
 */
const SearchDialog = ({
  isOpen,
  onClose,
  files,
  onFileSelect
}) => {
  // States for search query and filtered results
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);

  /**
   * Effect to filter files based on search query
   * Flattens file tree and applies search filter
   */
  useEffect(() => {
    /**
     * Recursively flattens the file tree structure
     * @param {Array} items - Array of file/folder items
     * @param {Array} results - Accumulator for flattened results
     * @returns {Array} Flattened array of all files
     */
    const flattenFiles = (items, results = []) => {
      items.forEach(item => {
        results.push(item);
        if (item.children) {
          flattenFiles(item.children, results);
        }
      });
      return results;
    };

    // Filter files based on search query
    const allFiles = flattenFiles(files);
    const filtered = allFiles.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [searchQuery, files]);

  /**
   * Handles keyboard events for dialog navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
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
          {/* Search input */}
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
          {/* Search results */}
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
            {/* No results message */}
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

/**
 * Component Maintenance Notes:
 * 
 * 1. Search Functionality:
 *    - Case-insensitive search
 *    - Real-time filtering
 *    - Searches file names only (consider adding path/content search)
 * 
 * 2. Keyboard Navigation:
 *    - Escape to close
 *    - Enter to select first result
 *    - Consider adding:
 *      - Arrow key navigation
 *      - Tab navigation between results
 * 
 * 3. Performance:
 *    - Flattens file tree on every search
 *    - Consider memoizing flattened results
 *    - Consider debouncing search for large file sets
 * 
 * 4. Accessibility:
 *    - Autofocus on search input
 *    - Keyboard navigation
 *    - Screen reader considerations
 * 
 * 5. Future Improvements:
 *    - Add search history
 *    - Add fuzzy search
 *    - Add file type filtering
 *    - Add search within file contents
 *    - Add recently opened files section
 * 
 * 6. Dependencies:
 *    - @/components/shared/Dialog
 *    - lucide-react icons
 *    - @/utils/fileUtils
 */
