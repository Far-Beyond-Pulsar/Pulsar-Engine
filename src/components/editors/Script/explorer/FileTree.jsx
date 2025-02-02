import React from 'react';
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, Image, Box, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/shared/DropdownMenu";

const FileTree = ({ items, onItemClick, onNewFile, onNewFolder, onDelete }) => (
  <div className="text-sm">
    {items.map((item) => (
      <div key={item.path}>
        <div
          className={`flex items-center gap-1 py-1 px-2 hover:bg-gray-950 cursor-pointer group
            ${activeTab === item.path ? 'bg-gray-950' : ''}`}
          onClick={() => onItemClick(item)}
        >
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {item.type === 'directory' && (
              item.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
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
            <span className="truncate">{item.name}</span>
          </div>
          
          <FileTreeItemMenu 
            item={item} 
            onNewFile={onNewFile} 
            onNewFolder={onNewFolder} 
            onDelete={onDelete}
          />
        </div>
        {item.type === 'directory' && item.open && item.children && (
          <div className="ml-4">
            <FileTree 
              items={item.children} 
              onItemClick={onItemClick}
              onNewFile={onNewFile}
              onNewFolder={onNewFolder}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>
    ))}
  </div>
);

export default FileTree;
