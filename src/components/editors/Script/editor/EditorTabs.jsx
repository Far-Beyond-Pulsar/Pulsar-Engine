import React from 'react';
import { FileCode, Image, Box, X } from 'lucide-react';
import { isImageFile, is3DFile } from '@/utils/fileUtils';

const EditorTabs = ({ tabs, activeTab, onTabClick, onTabClose }) => (
  <div className="flex bg-black border-b border-gray-800 overflow-x-auto">
    {tabs.map((tab) => (
      <div
        key={tab.path}
        className={`group px-3 py-2 text-sm flex items-center gap-2 cursor-pointer border-r border-gray-800 min-w-0
          ${activeTab === tab.path ? 'bg-gray-950 text-white border-b-2 border-b-blue-500' : 'hover:bg-gray-950'}`}
        onClick={() => onTabClick(tab.path)}
      >
        {isImageFile(tab.name) ? (
          <Image size={14} className="text-blue-400 shrink-0" />
        ) : is3DFile(tab.name) ? (
          <Box size={14} className="text-blue-400 shrink-0" />
        ) : (
          <FileCode size={14} className="text-blue-400 shrink-0" />
        )}
        <span className="truncate">{tab.name}</span>
        {tab.isDirty && (
          <span className="text-blue-400 shrink-0">●</span>
        )}
        <button
          className="ml-2 p-1 hover:bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onTabClose(tab.path);
          }}
          title="Close (Ctrl+W)"
        >
          <X size={12} />
        </button>
      </div>
    ))}
  </div>
);

export default EditorTabs;
