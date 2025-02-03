import React from 'react';
import { FileCode, Image, Box, X } from 'lucide-react';
import { isImageFile, is3DFile } from '@/utils/fileUtils';

/**
 * EditorTabs Component
 * 
 * Displays and manages tabs for open files in the editor.
 * Supports different file types with appropriate icons.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of open tabs
 * @param {string} props.activeTab - Path of currently active tab
 * @param {Function} props.onTabClick - Handler for tab selection
 * @param {Function} props.onTabClose - Handler for tab closure
 * 
 * @example
 * <EditorTabs
 *   tabs={openTabs}
 *   activeTab="/path/to/active.js"
 *   onTabClick={handleTabSelect}
 *   onTabClose={handleTabClose}
 * />
 */
const EditorTabs = ({ tabs, activeTab, onTabClick, onTabClose }) => (
  <div className="flex bg-black border-b border-gray-800 overflow-x-auto">
    {tabs.map((tab) => (
      <div
        key={tab.path}
        className={`group px-3 py-2 text-sm flex items-center gap-2 cursor-pointer border-r border-gray-800 min-w-0
          ${activeTab === tab.path ? 'bg-gray-950 text-white border-b-2 border-b-blue-500' : 'hover:bg-gray-950'}`}
        onClick={() => onTabClick(tab.path)}
      >
        {/* File type icon */}
        {isImageFile(tab.name) ? (
          <Image size={14} className="text-blue-400 shrink-0" />
        ) : is3DFile(tab.name) ? (
          <Box size={14} className="text-blue-400 shrink-0" />
        ) : (
          <FileCode size={14} className="text-blue-400 shrink-0" />
        )}
        
        {/* File name */}
        <span className="truncate">{tab.name}</span>
        
        {/* Unsaved changes indicator */}
        {tab.isDirty && (
          <span className="text-blue-400 shrink-0">●</span>
        )}
        
        {/* Close button */}
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

/**
 * Component Maintenance Notes:
 * 
 * 1. Tab Features:
 *    - File type icons
 *    - Unsaved changes indicator
 *    - Close button (hidden until hover)
 *    - Active tab highlighting
 * 
 * 2. Styling:
 *    - Tailwind CSS
 *    - Responsive design
 *    - Hover states
 *    - Transitions
 * 
 * 3. Accessibility:
 *    - Close button title/tooltip
 *    - Click handlers
 *    - Focus states (could be improved)
 * 
 * 4. Future Improvements:
 *    - Add drag and drop tab reordering
 *    - Add tab context menu
 *    - Add tab groups
 *    - Add tab search
 *    - Add tab preview
 *    - Add keyboard navigation
 * 
 * 5. Dependencies:
 *    - lucide-react icons
 *    - @/utils/fileUtils
 * 
 * 6. Event Handling:
 *    - Click propagation control
 *    - Separate close handler
 *    - Tab selection
 */
