import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/shared/DropdownMenu";
import { Plus, Folder, Trash2, MoreVertical, Edit2 } from 'lucide-react';

/**
 * FileTreeItemMenu Component
 * 
 * Context menu for file tree items providing actions like
 * new file/folder creation, rename, and delete.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.item - File/folder item
 * @param {Function} props.onNewFile - New file handler
 * @param {Function} props.onNewFolder - New folder handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onRename - Rename handler
 * 
 * @example
 * <FileTreeItemMenu
 *   item={fileItem}
 *   onNewFile={handleNewFile}
 *   onNewFolder={handleNewFolder}
 *   onDelete={handleDelete}
 *   onRename={handleRename}
 * />
 */
const FileTreeItemMenu = ({ item, onNewFile, onNewFolder, onDelete, onRename }) => (
  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
    <DropdownMenu>
      {/* Menu Trigger */}
      <DropdownMenuTrigger asChild>
        <button className="p-1 hover:bg-gray-800 rounded">
          <MoreVertical size={14} />
        </button>
      </DropdownMenuTrigger>

      {/* Menu Content */}
      <DropdownMenuContent className="bg-gray-900 border-gray-800">
        {/* Directory-specific actions */}
        {item.type === 'directory' && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onNewFile(item.path);
              }}
              className="text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              <Plus size={14} className="mr-2" />
              New File
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onNewFolder(item.path);
              }}
              className="text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              <Folder size={14} className="mr-2" />
              New Folder
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
          </>
        )}
        
        {/* Common actions */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRename(item);
          }}
          className="text-gray-300 hover:bg-gray-800 cursor-pointer"
        >
          <Edit2 size={14} className="mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.path);
          }}
          className="text-red-400 hover:bg-gray-800 cursor-pointer"
        >
          <Trash2 size={14} className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export default FileTreeItemMenu;

/**
 * Component Maintenance Notes:
 * 
 * 1. Menu Features:
 *    - Conditional directory actions
 *    - Common file/folder actions
 *    - Click propagation handling
 *    - Icons for actions
 * 
 * 2. Styling:
 *    - Consistent with theme
 *    - Hover states
 *    - Transitions
 *    - Icon alignment
 * 
 * 3. Accessibility:
 *    - Keyboard navigation
 *    - Screen reader support
 *    - Focus management
 * 
 * 4. Future Improvements:
 *    - Add keyboard shortcuts
 *    - Add action tooltips
 *    - Add confirmation dialogs
 *    - Add custom actions
 *    - Add action permissions
 * 
 * 5. Dependencies:
 *    - @/components/shared/DropdownMenu
 *    - lucide-react
 */
