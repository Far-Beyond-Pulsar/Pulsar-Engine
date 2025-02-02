import React from 'react';
import { Plus, Folder, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/shared/DropdownMenu";

const FileTreeItemMenu = ({ item, onNewFile, onNewFolder, onDelete }) => (
  <div className="hidden group-hover:flex items-center gap-1">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 hover:bg-gray-800 rounded">
          <MoreVertical size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-800">
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
