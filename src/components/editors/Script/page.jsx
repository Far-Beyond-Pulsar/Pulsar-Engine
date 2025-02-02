import React, { useState, useEffect, useRef } from 'react';
import FileTree from './explorer/FileTree';
import EditorTabs from './editor/EditorTabs';
import MediaViewer from './media/MediaViewer';
import Terminal from './terminal/Terminal';
import StatusBar from './statusbar/StatusBar';
import NewFileDialog from './dialogs/NewFileDialog';
import NewFolderDialog from './dialogs/NewFolderDialog';
import DeleteDialog from './dialogs/DeleteDialog';
import SearchDialog from './dialogs/SearchDialog';
import SettingsDialog from './dialogs/SettingsDialog';
import ExplorerToolbar from './explorer/ExplorerToolbar';
import ResizeHandle from './explorer/ResizeHandle';
import EditorContent from './editor/EditorContent';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFileSystem } from './hooks/useFileSystem';
import { useEditor } from './hooks/useEditor';

const Quasar = () => {
  // State management
  const {
    files,
    openTabs,
    activeTab,
    consoleOutput,
    handleFileOpen,
    handleTabClose,
    handleTabClick,
    handleFileSave,
  } = useEditor();

  const {
    createFile,
    createFolder,
    deletePath,
    loadDirectoryStructure,
  } = useFileSystem();

  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [isTerminalVisible, setTerminalVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog state
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

  // Editor settings
  const [editorSettings, setEditorSettings] = useState({
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
  });

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onSave: handleFileSave,
    onSearch: () => setShowSearch(true),
    onNewFile: () => setShowNewFileDialog(true),
    onToggleSidebar: () => setSidebarVisible(prev => !prev),
    onToggleTerminal: () => setTerminalVisible(prev => !prev),
  });

  // Handle sidebar resizing
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
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {isSidebarVisible && (
          <div 
            className="border-r border-gray-800 flex flex-col bg-black relative"
            style={{ width: `${sidebarWidth}px` }}
          >
            <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
              <span className="uppercase tracking-wider">Explorer</span>
              <div className="flex items-center gap-1">
                <ExplorerToolbar 
                  onNewFile={() => setShowNewFileDialog(true)}
                  onNewFolder={() => setShowNewFolderDialog(true)}
                  onRefresh={loadDirectoryStructure}
                  isLoading={isLoading}
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <FileTree 
                items={files}
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
              />
            </div>
            <ResizeHandle 
              onMouseDown={() => setIsResizing(true)} 
            />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <EditorTabs 
            tabs={openTabs}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
          />
          <EditorContent 
            activeTab={activeTab}
            openTabs={openTabs}
            settings={editorSettings}
            onSave={handleFileSave}
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
        onCreate={createFile}
        selectedPath={selectedPath}
      />
      
      <NewFolderDialog 
        isOpen={showNewFolderDialog}
        onClose={() => setShowNewFolderDialog(false)}
        onCreate={createFolder}
        selectedPath={selectedPath}
      />
      
      <DeleteDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={deletePath}
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
