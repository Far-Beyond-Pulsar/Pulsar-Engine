'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Save, Files, Search, Settings, Plus,
  ChevronRight, ChevronDown,
  FileCode, Folder, FolderOpen,
  X, Check, AlertCircle, Trash2,
  FileDown, RefreshCw, FolderInput
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./Dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./AlertDialog";

// Dynamically import Tauri APIs
let invoke;
let dialog;

// Initialize Tauri APIs
const initTauri = async () => {
  const tauri = await import('@tauri-apps/api/tauri');
  const tauriDialog = await import('@tauri-apps/api/dialog');
  invoke = tauri.invoke;
  dialog = tauriDialog.open;
};

// Utils for client-side detection
const isBrowser = typeof window !== 'undefined';

// Dynamic import of Monaco Editor with explicit SSR disabling
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-black">
        <span className="text-gray-400">Loading editor...</span>
      </div>
    )
  }
);

const CodeEditor = () => {
  // Add client-side only initialization
  const [isClient, setIsClient] = useState(false);

  // Core state
  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [minimap, setMinimap] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedPath, setSelectedPath] = useState(null);
  const [currentProjectPath, setCurrentProjectPath] = useState('.');

  // Monaco editor instance ref
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Load directory structure
  const loadDirectoryStructure = async (pathOverride = null) => {
    try {
      setIsLoading(true);
      const pathToUse = pathOverride || currentProjectPath;
      console.log('Loading directory structure for path:', pathToUse);
      
      const entries = await invoke('get_directory_structure', { 
        path: pathToUse
      });

      const processEntries = (entries) => {
        entries.sort((a, b) => {
          if (a.entry_type === 'directory' && b.entry_type !== 'directory') return -1;
          if (a.entry_type !== 'directory' && b.entry_type === 'directory') return 1;
          return 0;
        });

        const result = [];
        const pathMap = new Map();

        entries.forEach(entry => {
          const normalizedPath = entry.path.replace(/\\/g, '/');
          const parts = normalizedPath.split('/');
          const item = {
            name: entry.name,
            path: normalizedPath,
            type: entry.entry_type,
            children: entry.entry_type === 'directory' ? [] : undefined,
            open: false
          };

          pathMap.set(normalizedPath, item);

          if (parts.length === 1) {
            result.push(item);
          } else {
            const parentPath = parts.slice(0, -1).join('/');
            const parent = pathMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(item);
            }
          }
        });

        return result;
      };

      const structuredItems = processEntries(entries);
      setFiles(structuredItems);
      setLoadError(null);
    } catch (error) {
      const errorMessage = `Failed to load directory structure: ${error}`;
      console.error(errorMessage);
      setLoadError(errorMessage);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: errorMessage
      }]);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openProject = async () => {
    try {
      const { dialog } = await import('@tauri-apps/api');

      const selected = await dialog.open({
        directory: true,
        multiple: false,
        title: 'Select Project Directory'
      });

      if (selected) {
        setCurrentProjectPath(selected);
        setOpenTabs([]);
        setActiveTab(null);
        setFiles([]);
        await loadDirectoryStructure();
        setConsoleOutput(prev => [...prev, {
          type: 'success',
          message: `Opened project: ${selected}`
        }]);
      }
    } catch (error) {
      const errorMessage = `Error opening project: ${error}`;
      console.error(errorMessage);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: errorMessage
      }]);
    }
  };

  const openFile = async (file) => {
    try {
      if (!openTabs.some(tab => tab.path === file.path)) {
        const result = await invoke('read_file_content', { path: file.path });

        setOpenTabs(prev => [...prev, {
          ...file,
          content: result.content,
          language: result.language
        }]);

        setConsoleOutput(prev => [...prev, {
          type: 'info',
          message: `Opened file: ${file.name}`
        }]);
      }
      setActiveTab(file.path);
    } catch (error) {
      const errorMessage = `Error opening file ${file.name}: ${error}`;
      console.error(errorMessage);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: errorMessage
      }]);
    }
  };

  const saveFile = async () => {
    const activeFile = openTabs.find(tab => tab.path === activeTab);
    if (!activeFile || !editorRef.current) return;

    try {
      const currentContent = editorRef.current.getValue();

      await invoke('save_file_content', {
        path: activeFile.path,
        content: currentContent
      });

      setOpenTabs(prev =>
        prev.map(tab =>
          tab.path === activeTab
            ? { ...tab, content: currentContent }
            : tab
        )
      );

      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `File saved: ${activeFile.name}`
      }]);
    } catch (error) {
      const errorMessage = `Error saving file: ${error}`;
      console.error(errorMessage);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: errorMessage
      }]);
    }
  };

  const createNewFile = async () => {
    if (!newItemName) return;

    try {
      const path = `${selectedPath || '.'}/${newItemName}`;
      await invoke('create_file', { path });
      await loadDirectoryStructure();
      setShowNewFileDialog(false);
      setNewItemName('');
      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Created new file: ${newItemName}`
      }]);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error creating file: ${error}`
      }]);
    }
  };

  const createNewFolder = async () => {
    if (!newItemName) return;

    try {
      const path = `${selectedPath || '.'}/${newItemName}`;
      await invoke('create_directory', { path });
      await loadDirectoryStructure();
      setShowNewFolderDialog(false);
      setNewItemName('');
      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Created new folder: ${newItemName}`
      }]);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error creating folder: ${error}`
      }]);
    }
  };

  const deletePath = async () => {
    if (!selectedPath) return;

    try {
      await invoke('delete_path', { path: selectedPath });
      await loadDirectoryStructure();

      if (openTabs.some(tab => tab.path === selectedPath)) {
        closeTab(selectedPath);
      }

      setShowDeleteDialog(false);
      setSelectedPath(null);
      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Deleted: ${selectedPath}`
      }]);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error deleting path: ${error}`
      }]);
    }
  };

  const closeTab = (path, e) => {
    if (e) e.stopPropagation();
    setOpenTabs(prev => prev.filter(tab => tab.path !== path));
    if (activeTab === path) {
      setActiveTab(openTabs[openTabs.length - 2]?.path || null);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });

    // Configure editor theme
    monaco.editor.defineTheme('amoled-black', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'regexp', foreground: 'D16969' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'class', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'constant', foreground: '4FC1FF' },
        { token: 'parameter', foreground: '9CDCFE' },
        { token: 'builtin', foreground: '4EC9B0' },
        { token: 'variable.predefined', foreground: '4FC1FF' },
      ],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#0F0F0F',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editor.selectionHighlightBackground': '#ADD6FF26',
        'editor.wordHighlightBackground': '#575757B8',
        'editor.wordHighlightStrongBackground': '#004972B8',
        'editorBracketMatch.background': '#0064001A',
        'editorBracketMatch.border': '#888888'
      }
    });

    monaco.editor.setTheme('amoled-black');
  };

  // File tree component
  const FileTree = ({ items }) => (
    <div className="text-sm">
      {items.map((item) => (
        <div key={item.path}>
          <div
            className={`flex items-center gap-1 py-1 px-2 hover:bg-gray-950 cursor-pointer
              ${activeTab === item.path ? 'bg-gray-950' : ''}`}
            onClick={() => {
              if (item.type === 'directory') {
                setFiles(prev => {
                  const updateItem = (items) =>
                    items.map(i =>
                      i.path === item.path
                        ? { ...i, open: !i.open }
                        : i.type === 'directory'
                          ? { ...i, children: updateItem(i.children || []) }
                          : i
                    );
                  return updateItem(prev);
                });
              } else {
                openFile(item);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setSelectedPath(item.path);
              setShowDeleteDialog(true);
            }}
          >
            {item.type === 'directory' && (
              item.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
            {item.type === 'directory' ? (
              item.open ? (
                <FolderOpen size={16} className="text-blue-400" />
              ) : (
                <Folder size={16} className="text-blue-400" />
              )
            ) : (
              <FileCode size={16} className="text-blue-400" />
            )}
            <span>{item.name}</span>
          </div>
          {item.type === 'directory' && item.open && item.children && (
            <div className="ml-4">
              <FileTree items={item.children} />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    setIsClient(true);
    const init = async () => {
      await initTauri();
      await loadDirectoryStructure();
    };
    init();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFile]);

  // Don't render anything until we're on the client
  if (!isClient) {
    return (
      <div className="flex flex-col h-full bg-black text-gray-300">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin" />
            Initializing editor...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-gray-300">
      {loadError && (
        <div className="p-4 bg-red-900/50 text-red-200 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-800 flex flex-col bg-black">
          <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
            <span>EXPLORER</span>
            <div className="flex items-center gap-1">
              <button
                onClick={openProject}
                className="p-1 hover:bg-gray-900 rounded"
                title="Open Project"
              >
                <FolderInput size={16} />
              </button>
              <button
                onClick={() => {
                  setNewItemName('');
                  setShowNewFolderDialog(true);
                }}
                className="p-1 hover:bg-gray-900 rounded"
                title="New Folder"
              >
                <Folder size={16} />
              </button>
              <button
                onClick={loadDirectoryStructure}
                className="p-1 hover:bg-gray-900 rounded"
                title="Refresh"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <FileTree items={files} />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex bg-black border-b border-gray-800 overflow-x-auto">
            {openTabs.map((tab) => (
              <div
                key={tab.path}
                className={`px-3 py-2 text-sm flex items-center gap-2 cursor-pointer border-r border-gray-800 whitespace-nowrap
                ${activeTab === tab.path ? 'bg-gray-950 text-white' : 'hover:bg-gray-950'}`}
                onClick={() => setActiveTab(tab.path)}
              >
                <FileCode size={14} className="text-blue-400" />
                <span>{tab.name}</span>
                <button
                  className="ml-2 p-1 hover:bg-gray-800 rounded-full"
                  onClick={(e) => closeTab(tab.path, e)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            {activeTab ? (
              <MonacoEditor
                height="100%"
                defaultLanguage={openTabs.find(tab => tab.path === activeTab)?.language || 'plaintext'}
                onMount={handleEditorDidMount}
                value={openTabs.find(tab => tab.path === activeTab)?.content || ''}
                onChange={(value) => {
                  setOpenTabs(prev =>
                    prev.map(tab =>
                      tab.path === activeTab ? { ...tab, content: value } : tab
                    )
                  );
                }}
                options={{
                  readOnly: false,
                  minimap: { enabled: minimap },
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible',
                    useShadows: false,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                  },
                  colorDecorators: true,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  rulers: [80],
                  bracketPairColorization: { enabled: true }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No file selected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center px-2 py-1 bg-black border-t border-gray-800 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">
            {openTabs.find(tab => tab.path === activeTab)?.language || 'plaintext'}
          </span>
          <span>{`Ln ${cursorPosition.line}, Col ${cursorPosition.column}`}</span>
        </div>
        <div className="flex-1" />
        <button
          className="p-2 hover:bg-gray-950 rounded transition-colors text-blue-400"
          onClick={saveFile}
        >
          <Save size={16} />
        </button>
        <button
          className="p-2 hover:bg-gray-950 rounded transition-colors text-blue-400"
          onClick={() => setMinimap(prev => !prev)}
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Console Panel */}
      {consoleOutput.length > 0 && (
        <div className="h-32 border-t border-gray-800 bg-black overflow-auto">
          {consoleOutput.map((output, index) => (
            <div
              key={index}
              className={`px-4 py-2 flex items-center gap-2 ${
                output.type === 'error' ? 'text-red-400' :
                output.type === 'success' ? 'text-green-400' :
                'text-blue-400'
              }`}
            >
              {output.type === 'error' ? <AlertCircle size={16} /> :
                output.type === 'success' ? <Check size={16} /> :
                <Files size={16} />}
              <span>{output.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Enter the name for your new file
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="filename.ext"
              className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewFile();
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
              onClick={() => setShowNewFileDialog(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
              onClick={createNewFile}
            >
              Create
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter the name for your new folder
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="folder-name"
              className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewFolder();
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
              onClick={createNewFolder}
            >
              Create
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={deletePath} className="bg-red-600 hover:bg-red-500">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CodeEditor;