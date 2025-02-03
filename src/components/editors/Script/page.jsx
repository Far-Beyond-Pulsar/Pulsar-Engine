import React, { useState, useEffect, useRef } from 'react';

// Explorer components
import FileTree from './explorer/FileTree.jsx';
import ExplorerToolbar from './explorer/ExplorerToolbar.jsx';
import ResizeHandle from './explorer/ResizeHandle.jsx';

// Editor components
import EditorTabs from './editor/EditorTabs.jsx';
import EditorContent from './editor/EditorContent.jsx';

// Media components
import MediaViewer from './media/MediaViewer.jsx';

// Terminal components
import Terminal from './terminal/Terminal.jsx';

// Status bar
import StatusBar from './statusbar/StatusBar.jsx';

// Dialog components
import NewFileDialog from './dialogs/NewFileDialog.jsx';
import NewFolderDialog from './dialogs/NewFolderDialog.jsx';
import DeleteDialog from './dialogs/DeleteDialog.jsx';
import RenameDialog from './dialogs/RenameDialog.jsx';
import SearchDialog from './dialogs/SearchDialog.jsx';
import SettingsDialog from './dialogs/SettingsDialog.jsx';

// Hooks
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { useFileSystem } from './hooks/useFileSystem.js';
import { useEditor } from './hooks/useEditor.js';

/**
 * Quasar Component
 * 
 * Main code editor component that integrates all editor functionality.
 * Manages file system operations, editor state, and UI interactions.
 * 
 * @component
 */
const Quasar = () => {
  /**
   * File System Hook
   * Manages all file system operations and state
   */
  const {
    files,                // File tree structure
    fileHandles,          // File system handles
    loadProjectFolder,    // Load project directory
    refreshFiles,         // Refresh file tree
    createFile,          // Create new file
    createFolder,        // Create new folder
    deleteItem,          // Delete file/folder
    renameItem,          // Rename file/folder
    setFiles,            // Update file tree
    toggleFolder,        // Toggle folder open/closed
    currentProjectPath,  // Current project root path
  } = useFileSystem();

  /**
   * Editor Hook
   * Manages editor state and operations
   */
  const {
    openTabs,           // Currently open files
    activeTab,          // Currently active file
    consoleOutput,      // Terminal output messages
    handleFileOpen,     // Open file in editor
    handleTabClose,     // Close editor tab
    handleTabClick,     // Switch active tab
    handleFileSave,     // Save file changes
  } = useEditor(fileHandles);

  /**
   * UI State
   */
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [isTerminalVisible, setTerminalVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Dialog State
   */
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  /**
   * Editor Settings
   */
  const [editorSettings, setEditorSettings] = useState({
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
  });

  /**
   * Initialize Keyboard Shortcuts
   */
  useKeyboardShortcuts({
    onSave: handleFileSave,
    onSearch: () => setShowSearch(true),
    onNewFile: () => setShowNewFileDialog(true),
    onToggleSidebar: () => setSidebarVisible(prev => !prev),
    onToggleTerminal: () => setTerminalVisible(prev => !prev),
  });

  /**
   * Handles loading a project folder
   * Updates file tree and handles loading state
   */
  const handleLoadProject = async () => {
    setIsLoading(true);
    try {
      const result = await loadProjectFolder();
      if (result && result.structure) {
        setFiles(result.structure);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles refreshing the file explorer
   * Falls back to load project if no folder is open
   */
  const handleRefresh = async () => {
    if (!fileHandles || fileHandles.size === 0) {
      await handleLoadProject();
      return;
    }
    
    setIsLoading(true);
    try {
      await refreshFiles();
    } catch (error) {
      console.error('Failed to refresh files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles creating a new file
   * @param {string} filename - Name of new file
   * @param {string} path - Parent directory path
   */
  const handleCreateFile = async (filename, path) => {
    try {
      await createFile(filename, path);
      await refreshFiles();
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  };

  /**
   * Handles renaming files and folders
   * Closes affected tabs and refreshes file tree
   */
  const handleRename = async (oldPath, newName) => {
    setIsLoading(true);
    try {
      await renameItem(oldPath, newName);
      // Close affected tabs
      if (openTabs.some(tab => tab.path.startsWith(oldPath))) {
        const tabsToClose = openTabs.filter(tab => tab.path.startsWith(oldPath));
        tabsToClose.forEach(tab => handleTabClose(tab.path));
      }
      await refreshFiles();
    } catch (error) {
      console.error('Failed to rename item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles deleting files and folders
   * Closes affected tabs and updates UI
   */
  const handleDelete = async (path) => {
    try {
      setIsLoading(true);
      await deleteItem(path);
      
      // Close affected tabs
      if (openTabs.some(tab => tab.path.startsWith(path))) {
        const tabsToClose = openTabs.filter(tab => tab.path.startsWith(path));
        tabsToClose.forEach(tab => handleTabClose(tab.path));
      }
      
      setShowDeleteDialog(false);
      setSelectedPath(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles creating a new folder
   */
  const handleCreateFolder = async (folderName, path) => {
    try {
      await createFolder(folderName, path);
      await refreshFiles();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  /**
   * Handle sidebar resizing
   * Adds and removes mouse event listeners
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth > 160 && newWidth < window.innerWidth / 2) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="h-screen flex flex-col bg-black text-gray-300 overflow-hidden overscroll-none touch-none">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar / File Explorer */}
        {isSidebarVisible && (
          <div 
            className="border-r border-gray-800 flex flex-col bg-black relative"
            style={{ width: `${sidebarWidth}px` }}
          >
            {/* Explorer Header */}
            <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
              <span className="uppercase tracking-wider">Explorer</span>
              <ExplorerToolbar 
                onNewFile={() => setShowNewFileDialog(true)}
                onNewFolder={() => setShowNewFolderDialog(true)}
                onRefresh={handleRefresh}
                isLoading={isLoading}
              />
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-auto">
              <FileTree 
                items={files}
                activeTab={activeTab}
                onItemClick={handleFileOpen}
                onNewFile={(path) => {
                  setSelectedPath(path);
                  setShowNewFileDialog(true);
                }}
                onNewFolder={(path) => {
                  setSelectedPath(path);
                  setShowNewFolderDialog(true);
                }}
                onDelete={(path) => {
                  setSelectedPath(path);
                  setShowDeleteDialog(true);
                }}
                onRename={(item) => {
                  setSelectedItem(item);
                  setShowRenameDialog(true);
                }}
                toggleFolder={toggleFolder}
              />

              {/* Rename Dialog */}
              <RenameDialog 
                isOpen={showRenameDialog}
                onClose={() => {
                  setShowRenameDialog(false);
                  setSelectedItem(null);
                }}
                onRename={handleRename}
                item={selectedItem}
              />
            </div>

            {/* Resize Handle */}
            <ResizeHandle 
              onMouseDown={() => setIsResizing(true)} 
            />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Tabs */}
          <EditorTabs 
            tabs={openTabs}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
          />

          {/* Editor Content */}
          <EditorContent 
            activeTab={activeTab}
            openTabs={openTabs}
            settings={editorSettings}
            onSave={handleFileSave}
            onOpenFolder={handleLoadProject}
            onNewFile={() => setShowNewFileDialog(true)}
          />
        </div>
      </div>

      {/* Terminal */}
      <Terminal 
        isVisible={isTerminalVisible}
        onClose={() => setTerminalVisible(false)}
        output={consoleOutput}
      />

      {/* Status Bar */}
      <StatusBar 
        activeTab={openTabs.find(tab => tab.path === activeTab)}
        settings={editorSettings}
        onSettingsClick={() => setShowSettings(true)}
        onSave={handleFileSave}
        onWordWrapToggle={() => 
          setEditorSettings(prev => ({
            ...prev,
            wordWrap: prev.wordWrap === 'on' ? 'off' : 'on'
          }))
        }
      />

      {/* Dialogs */}
      <NewFileDialog 
        isOpen={showNewFileDialog}
        onClose={() => setShowNewFileDialog(false)}
        onCreate={handleCreateFile}
        selectedPath={selectedPath}
        currentProjectPath={currentProjectPath}
      />
      
      <NewFolderDialog 
        isOpen={showNewFolderDialog}
        onClose={() => {
          setShowNewFolderDialog(false);
          setSelectedPath(null);
        }}
        onCreate={handleCreateFolder}
        selectedPath={selectedPath}
        currentProjectPath={currentProjectPath}
      />
      
      <DeleteDialog 
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedPath(null);
        }}
        onDelete={handleDelete}
        path={selectedPath}
      />
      
      <SearchDialog 
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        files={files}
        onFileSelect={handleFileOpen}
      />
      
      <SettingsDialog 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={editorSettings}
        onSettingsChange={setEditorSettings}
      />
    </div>
  );
};

export default Quasar;

/**
 * Component Maintenance Notes:
 * 
 * 1. Component Structure:
 *    - Main layout (sidebar, editor, terminal)
 *    - Dialogs (file, folder, settings, etc.)
 *    - Status bar
 * 
 * 2. State Management:
 *    - File system state (useFileSystem)
 *    - Editor state (useEditor)
 *    - UI state (visibility, dimensions)
 *    - Dialog state
 *    - Settings state
 * 
 * 3. Features:
 *    - File/folder operations
 *    - Editor operations
 *    - Terminal output
 *    - Keyboard shortcuts
 *    - Resizable panels
 * 
 * 4. Error Handling:
 *    - Try-catch blocks
 *    - Loading states
 *    - Console output
 * 
 * 5. Performance:
 *    - Conditional rendering
 *    - Event cleanup
 *    - State updates
 * 
 * 6. Future Improvements:
 *    - Add state management (Redux/Zustand)
 *    - Add error boundaries
 *    - Add file search
 *    - Add git integration
 *    - Add extensions system
 *    - Add themes
 *    - Add settings persistence
 *    - Add file type associations
 * 
 * 7. Dependencies:
 *    - React
 *    - Custom hooks
 *    - UI components
 *    - File system API
 */
