import React from 'react';
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, Image, Box } from 'lucide-react';
import FileTreeItemMenu from "./FileTreeItemMenu";
import { isImageFile, is3DFile } from '@/utils/fileUtils';

/**
 * FileTree Component
 * 
 * Recursive component that renders a tree view of files and folders
 * with expand/collapse functionality and context menu actions.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of file/folder items
 * @param {string} props.activeTab - Current active file path
 * @param {Function} props.onItemClick - Click handler for items
 * @param {Function} props.onNewFile - Handler for new file creation
 * @param {Function} props.onNewFolder - Handler for new folder creation
 * @param {Function} props.onDelete - Handler for item deletion
 * @param {Function} props.onRename - Handler for item renaming
 * @param {Function} props.toggleFolder - Handler for folder expansion
 */
const FileTree = ({ 
  items, 
  activeTab, 
  onItemClick, 
  onNewFile, 
  onNewFolder, 
  onDelete, 
  onRename,
  toggleFolder 
}) => {
  /**
   * Handles click events on tree items
   * @param {Object} item - Clicked item
   */
  const handleItemClick = (item) => {
    if (item.type === 'directory') {
      toggleFolder(item.path);
    } else {
      onItemClick(item);
    }
  };

  return (
    <div className="text-sm">
      {items.map((item) => (
        <div key={item.path}>
          {/* Item Row */}
          <div
            className={`flex items-center gap-1 py-1 px-2 hover:bg-gray-950 cursor-pointer group
              ${activeTab === item.path ? 'bg-gray-950' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            {/* Item Icon and Name */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {/* Folder Chevron */}
              {item.type === 'directory' && (
                item.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
              
              {/* Item Type Icon */}
              {item.type === 'directory' ? (
                item.open ? (
                  <FolderOpen size={16} className="text-blue-400 shrink-0" />
                ) : (
                  <Folder size={16} className="text-blue-400 shrink-0" />
                )
              ) : isImageFile(item.name) ? (
                <Image size={16} className="text-blue-400 shrink-0" />
              ) : is3DFile(item.name) ? (
                <Box size={16} className="text-blue-400 shrink-0" />
              ) : (
                <FileCode size={16} className="text-blue-400 shrink-0" />
              )}
              
              {/* Item Name */}
              <span className="truncate">{item.name}</span>
            </div>
            
            {/* Context Menu */}
            <FileTreeItemMenu 
              item={item} 
              onNewFile={onNewFile} 
              onNewFolder={onNewFolder} 
              onDelete={onDelete}
              onRename={onRename}
            />
          </div>

          {/* Recursively render children */}
          {item.type === 'directory' && item.open && item.children && (
            <div className="ml-4">
              <FileTree 
                items={item.children}
                activeTab={activeTab}
                onItemClick={onItemClick}
                onNewFile={onNewFile}
                onNewFolder={onNewFolder}
                onDelete={onDelete}
                onRename={onRename}
                toggleFolder={toggleFolder}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileTree;

/**
 * Component Maintenance Notes:
 * 
 * 1. Tree Structure:
 *    - Recursive rendering
 *    - Folder expansion state
 *    - File type icons
 *    - Context menus
 * 
 * 2. Performance:
 *    - Consider virtualization for large trees
 *    - Memoize components/callbacks
 *    - Optimize re-renders
 * 
 * 3. Styling:
 *    - Indentation levels
 *    - Active item highlighting
 *    - Hover states
 *    - Icon consistency
 * 
 * 4. Future Improvements:
 *    - Drag and drop
 *    - Multi-selection
 *    - File search/filter
 *    - Collapsible sections
 *    - Custom icons
 * 
 * 5. Dependencies:
 *    - lucide-react
 *    - @/utils/fileUtils
 */
