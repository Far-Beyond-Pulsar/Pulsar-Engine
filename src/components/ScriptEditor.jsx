'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Save, Files, Search, Settings, Plus,
  ChevronRight, ChevronDown,
  FileCode, Folder, FolderOpen,
  X, Check, AlertCircle, Trash2,
  FileDown, RefreshCw, FolderInput,
  PanelLeft, Maximize2, Minimize2,
  Terminal, Image, Box, File, ChevronsLeft,
  MoreVertical, Copy, Edit, Download
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/AlertDialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu";

// Dynamic imports for better performance
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-black text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin" size={24} />
          <span>Loading editor...</span>
        </div>
      </div>
    )
  }
);

// Utility functions
const isImageFile = (filename) => /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename);
const is3DFile = (filename) => /\.(glb|gltf|obj|fbx|stl)$/i.test(filename);
const getFileLanguage = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    sql: 'sql',
    rs: 'rust',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    dart: 'dart',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    vue: 'vue',
    svelte: 'svelte',
    graphql: 'graphql',
    proto: 'protobuf'
  };
  return languageMap[ext] || 'plaintext';
};

// Media viewer component
const MediaViewer = ({ file }) => {
  if (isImageFile(file.name)) {
    const renderActiveFile = () => {
      const activeFile = openTabs.find(tab => tab.path === activeTab);
      if (!activeFile) return null;
  
      if (activeFile.fileType === 'image' || activeFile.fileType === '3d') {
        return <MediaViewer file={activeFile} />;
      }
  
      return (
        <MonacoEditor
          height="100%"
          defaultLanguage={activeFile.language || 'plaintext'}
          value={activeFile.content || ''}
          onMount={handleEditorDidMount}
          onChange={(value) => {
            setOpenTabs(prev =>
              prev.map(tab =>
                tab.path === activeTab
                  ? { ...tab, content: value, isDirty: value !== tab.originalContent }
                  : tab
              )
            );
          }}
          options={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: fontSize,
            lineHeight: 1.6,
            minimap: { enabled: minimap },
            wordWrap: wordWrap,
            tabSize: tabSize,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10 },
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: {
              indentation: true,
              bracketPairs: true
            }
          }}
          theme={editorTheme}
        />
      );
    };
  
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="relative max-w-full max-h-full p-4">
          <img
            src={`data:${file.mediaType};base64,${file.content}`}
            alt={file.name}
            className="max-w-full max-h-[calc(100vh-12rem)] object-contain"
          />
        </div>
      </div>
    );
  }

  if (is3DFile(file.name)) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center p-4">
          <Box size={48} className="mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">3D viewer support coming soon...</p>
          <p className="text-sm text-gray-500 mt-2">File: {file.name}</p>
        </div>
      </div>
    );
  }

  return null;
};

// Main component
const Quasar = () => {
  // State management
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [isTerminalVisible, setTerminalVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  
  // File state
  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [minimap, setMinimap] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileHandles, setFileHandles] = useState(new Map());
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Dialog state
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedPath, setSelectedPath] = useState(null);
  const [currentProjectPath, setCurrentProjectPath] = useState('.');
  const [showSettings, setShowSettings] = useState(false);
  
  // Editor state
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(2);
  const [wordWrap, setWordWrap] = useState('on');
  
  // Refs
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const sidebarRef = useRef(null);
  const resizeRef = useRef(null);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // File system operations
  const createNewFile = async () => {
    if (!newItemName) return;

    try {
      const parentHandle = selectedPath ? fileHandles.get(selectedPath) : await window.showDirectoryPicker();
      
      if (!parentHandle) throw new Error('No directory selected');
      
      const fileHandle = await parentHandle.getFileHandle(newItemName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write('');
      await writable.close();

      fileHandles.set(`${selectedPath || '.'}/${newItemName}`, fileHandle);
      await loadDirectoryStructure();
      
      setShowNewFileDialog(false);
      setNewItemName('');
      
      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Created new file: ${newItemName}`,
        timestamp: new Date().toISOString()
      }]);

      // Open the newly created file
      const newFile = {
        name: newItemName,
        path: `${selectedPath || '.'}/${newItemName}`,
        type: 'file',
        handle: fileHandle
      };
      await openFile(newFile);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error creating file: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const createNewFolder = async () => {
    if (!newItemName) return;

    try {
      const parentHandle = selectedPath ? fileHandles.get(selectedPath) : await window.showDirectoryPicker();
      
      if (!parentHandle) throw new Error('No directory selected');
      
      const folderHandle = await parentHandle.getDirectoryHandle(newItemName, { create: true });
      fileHandles.set(`${selectedPath || '.'}/${newItemName}`, folderHandle);
      await loadDirectoryStructure();
      
      setShowNewFolderDialog(false);
      setNewItemName('');
      
      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Created new folder: ${newItemName}`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error creating folder: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const deletePath = async () => {
    if (!selectedPath) return;

    try {
      const handle = fileHandles.get(selectedPath);
      if (!handle) throw new Error('File handle not found');

      // If it's a file in the root directory
      if (selectedPath.indexOf('/') === -1) {
        await handle.remove();
      } else {
        // For nested files/folders
        const parentPath = selectedPath.substring(0, selectedPath.lastIndexOf('/'));
        const name = selectedPath.substring(selectedPath.lastIndexOf('/') + 1);
        const parentHandle = fileHandles.get(parentPath);
        
        if (!parentHandle) throw new Error('Parent directory not found');
        
        if (handle.kind === 'file') {
          await parentHandle.removeEntry(name);
        } else {
          await parentHandle.removeEntry(name, { recursive: true });
        }
      }

      fileHandles.delete(selectedPath);
      
      // Close tab if open
      if (openTabs.some(tab => tab.path === selectedPath)) {
        closeTab(selectedPath);
      }

      await loadDirectoryStructure();
      setShowDeleteDialog(false);
      setSelectedPath(null);
      
      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Deleted: ${selectedPath}`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error deleting path: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const closeTab = (path, e) => {
    if (e) e.stopPropagation();
    
    const tab = openTabs.find(t => t.path === path);
    if (tab?.isDirty) {
      const confirmed = window.confirm(`Do you want to save the changes to ${tab.name} before closing?`);
      if (confirmed) {
        saveFile().then(() => {
          setOpenTabs(prev => prev.filter(t => t.path !== path));
          if (activeTab === path) {
            setActiveTab(openTabs[openTabs.length - 2]?.path || null);
          }
        });
      } else {
        setOpenTabs(prev => prev.filter(t => t.path !== path));
        if (activeTab === path) {
          setActiveTab(openTabs[openTabs.length - 2]?.path || null);
        }
      }
    } else {
      setOpenTabs(prev => prev.filter(t => t.path !== path));
      if (activeTab === path) {
        setActiveTab(openTabs[openTabs.length - 2]?.path || null);
      }
    }
  };

  // Optimized loadDirectoryStructure function
  const loadDirectoryStructure = async () => {
    try {
      setIsLoading(true);
      const dirHandle = await window.showDirectoryPicker();
      
      // Process directory with lazy loading
      const processDirectory = async (handle, path = '', depth = 0) => {
        const entries = [];
        // Only load immediate children for depths > 2
        const shouldLoadChildren = depth <= 2;
        
        // Use for...of instead of collecting all entries first
        for await (const entry of handle.values()) {
          const entryPath = path ? `${path}/${entry.name}` : entry.name;
          
          if (entry.kind === 'directory') {
            const childHandle = await handle.getDirectoryHandle(entry.name);
            fileHandles.set(entryPath, childHandle);
            
            // Only process children if we're at a shallow depth
            const children = shouldLoadChildren ? 
              await processDirectory(childHandle, entryPath, depth + 1) : 
              [];
              
            entries.push({
              name: entry.name,
              path: entryPath,
              type: 'directory',
              children,
              open: false,
              handle: childHandle,
              // Flag to indicate if children need to be loaded
              hasUnloadedChildren: !shouldLoadChildren
            });
          } else {
            const fileHandle = await handle.getFileHandle(entry.name);
            fileHandles.set(entryPath, fileHandle);
            entries.push({
              name: entry.name,
              path: entryPath,
              type: 'file',
              handle: fileHandle
            });
          }
        }
        
        return entries.sort((a, b) => {
          if (a.type === 'directory' && b.type !== 'directory') return -1;
          if (a.type !== 'directory' && b.type === 'directory') return 1;
          return a.name.localeCompare(b.name);
        });
      };
    
      const structure = await processDirectory(dirHandle);
      setFiles(structure);
      setCurrentProjectPath(dirHandle.name);
      setLoadError(null);
      
      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Opened project: ${dirHandle.name}`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      const errorMessage = `Failed to load directory: ${error.message}`;
      setLoadError(errorMessage);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add this function to handle lazy loading of directory contents
  const loadDirectoryChildren = async (item) => {
    if (!item.hasUnloadedChildren || !item.handle) return;
    
    try {
      const children = await processDirectory(item.handle, item.path, 0);
      
      setFiles(prev => {
        const updateItem = (items) =>
          items.map(i =>
            i.path === item.path
              ? { ...i, children, hasUnloadedChildren: false }
              : i.type === 'directory'
                ? { ...i, children: updateItem(i.children || []) }
                : i
          );
        return updateItem(prev);
      });
    } catch (error) {
      console.error('Error loading directory contents:', error);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error loading directory contents: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };
  
  // Modify the FileTree click handler
  const handleItemClick = async (item) => {
    if (item.type === 'directory') {
      if (item.hasUnloadedChildren) {
        await loadDirectoryChildren(item);
      }
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
  };

  const openFile = async (file) => {
    try {
      if (!openTabs.some(tab => tab.path === file.path)) {
        const handle = fileHandles.get(file.path);
        if (!handle) throw new Error('File handle not found');
        
        const fileData = await handle.getFile();
        let content;
        
        if (isImageFile(file.name)) {
          content = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(fileData);
          });
        } else {
          content = await fileData.text();
        }
        
        setOpenTabs(prev => [...prev, {
          ...file,
          content,
          language: getFileLanguage(file.name),
          fileType: isImageFile(file.name) ? 'image' : is3DFile(file.name) ? '3d' : 'text',
          mediaType: isImageFile(file.name) ? `image/${file.name.split('.').pop()}` : '',
          isDirty: false,
          originalContent: content
        }]);
      }
      setActiveTab(file.path);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error opening file: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const saveFile = async () => {
    const activeFile = openTabs.find(tab => tab.path === activeTab);
    if (!activeFile || !editorRef.current) return;

    try {
      const handle = fileHandles.get(activeFile.path);
      if (!handle) throw new Error('File handle not found');
      
      const writable = await handle.createWritable();
      const content = editorRef.current.getValue();
      await writable.write(content);
      await writable.close();

      setOpenTabs(prev =>
        prev.map(tab =>
          tab.path === activeTab
            ? { ...tab, content, isDirty: false, originalContent: content }
            : tab
        )
      );

      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Saved ${activeFile.name}`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error saving file: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Editor setup
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor
    monaco.editor.defineTheme('quasar-dark', {
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
        { token: 'constant', foreground: '4FC1FF' }
      ],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#1073CF2D',
        'editor.lineHighlightBorder': '#1073CF2D',
        'editor.selectionBackground': '#264F78',
        'editor.selectionHighlightBackground': '#2B384D',
        'editor.findMatchBackground': '#515C6A',
        'editor.findMatchHighlightBackground': '#314365'
      }
    });

    monaco.editor.setTheme('quasar-dark');

    // Event handlers
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });

    editor.onDidChangeModelContent(() => {
      const currentContent = editor.getValue();
      const activeFile = openTabs.find(tab => tab.path === activeTab);
      if (activeFile && currentContent !== activeFile.originalContent) {
        setOpenTabs(prev =>
          prev.map(tab =>
            tab.path === activeTab ? { ...tab, isDirty: true } : tab
          )
        );
      }
    });
  };

  // FileTree component
  const FileTree = ({ items }) => (
    <div className="text-sm">
      {items.map((item) => (
        <div key={item.path}>
          <div
            className={`flex items-center gap-1 py-1 px-2 hover:bg-gray-950 cursor-pointer group
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
                          setSelectedPath(item.path);
                          setShowNewFileDialog(true);
                        }}
                        className="text-gray-300 hover:bg-gray-800 cursor-pointer"
                      >
                        <Plus size={14} className="mr-2" />
                        New File
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPath(item.path);
                          setShowNewFolderDialog(true);
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
                      setSelectedPath(item.path);
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-400 hover:bg-gray-800 cursor-pointer"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

  // Helper function to render the active file
  const renderActiveFile = () => {
    const activeFile = openTabs.find(tab => tab.path === activeTab);
    if (!activeFile) return null;

    if (activeFile.fileType === 'image' || activeFile.fileType === '3d') {
      return <MediaViewer file={activeFile} />;
    }

    return (
      <MonacoEditor
        height="100%"
        defaultLanguage={activeFile.language || 'plaintext'}
        value={activeFile.content || ''}
        onMount={handleEditorDidMount}
        onChange={(value) => {
          setOpenTabs(prev =>
            prev.map(tab =>
              tab.path === activeTab
                ? { ...tab, content: value, isDirty: value !== tab.originalContent }
                : tab
            )
          );
        }}
        options={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: fontSize,
          lineHeight: 1.6,
          minimap: { enabled: minimap },
          wordWrap: wordWrap,
          tabSize: tabSize,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: true,
          smoothScrolling: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 10 },
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: {
            indentation: true,
            bracketPairs: true
          }
        }}
        theme={editorTheme}
      />
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Save - Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        await saveFile();
      }
      
      // Search - Ctrl/Cmd + P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // Toggle Sidebar - Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarVisible(!isSidebarVisible);
      }
      
      // Toggle Terminal - Ctrl/Cmd + `
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setTerminalVisible(!isTerminalVisible);
      }

      // New File - Ctrl/Cmd + N
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowNewFileDialog(true);
      }

      // Close Tab - Ctrl/Cmd + W
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeTab) {
          closeTab(activeTab);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarVisible, isTerminalVisible, activeTab]);

  // Save warning before unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (openTabs.some(tab => tab.isDirty)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [openTabs]);

  return (
    <div className="h-screen flex flex-col bg-black text-gray-300 overflow-hidden overscroll-none touch-none">


      {/* Error Banner */}
      {loadError && (
        <div className="p-4 bg-red-900/50 text-red-200 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{loadError}</span>
          <button
            onClick={() => setLoadError(null)}
            className="ml-auto hover:bg-red-900/50 p-1 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {isSidebarVisible && (
          <div 
            ref={sidebarRef}
            className="border-r border-gray-800 flex flex-col bg-black"
            style={{ width: `${sidebarWidth}px` }}
          >
            <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
              <span className="uppercase tracking-wider">Explorer</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setShowNewFileDialog(true);
                    setSelectedPath(currentProjectPath);
                  }}
                  className="p-1 hover:bg-gray-900 rounded"
                  title="New File (Ctrl+N)"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderDialog(true);
                    setSelectedPath(currentProjectPath);
                  }}
                  className="p-1 hover:bg-gray-900 rounded"
                  title="New Folder"
                >
                  <Folder size={16} />
                </button>
                <button
                  onClick={loadDirectoryStructure}
                  className="p-1 hover:bg-gray-900 rounded"
                  title="Refresh Explorer"
                >
                  <RefreshCw 
                    size={16} 
                    className={isLoading ? "animate-spin" : ""} 
                  />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <FileTree items={files} />
            </div>
            {/* Resize handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50"
              onMouseDown={() => setIsResizing(true)}
            />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex bg-black border-b border-gray-800 overflow-x-auto">
            {openTabs.map((tab) => (
              <div
                key={tab.path}
                className={`group px-3 py-2 text-sm flex items-center gap-2 cursor-pointer border-r border-gray-800 min-w-0
                  ${activeTab === tab.path ? 'bg-gray-950 text-white border-b-2 border-b-blue-500' : 'hover:bg-gray-950'}`}
                onClick={() => setActiveTab(tab.path)}
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
                    closeTab(tab.path);
                  }}
                  title="Close (Ctrl+W)"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative min-h-0">
            {!activeTab ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileCode size={48} className="mx-auto mb-4 text-gray-700" />
                  <h2 className="text-xl font-medium mb-2">Welcome to Quasar</h2>
                  <p className="text-sm">Open a file to start editing</p>
                  <div className="mt-4 flex gap-2 justify-center">
                    <button
                      onClick={loadDirectoryStructure}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center gap-2"
                    >
                      <FolderInput size={16} />
                      Open Folder
                    </button>
                    <button
                      onClick={() => {
                        setShowNewFileDialog(true);
                        setSelectedPath(currentProjectPath);
                      }}
                      className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={16} />
                      New File
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {renderActiveFile()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Terminal */}
      {isTerminalVisible && (
        <div className="h-48 border-t border-gray-800 bg-black">
          <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
            <span>TERMINAL</span>
            <button
              onClick={() => setTerminalVisible(false)}
              className="p-1 hover:bg-gray-900 rounded"
            >
              <X size={14} />
            </button>
          </div>
          <div className="h-[calc(100%-2.5rem)] overflow-auto p-2 font-mono">
            {consoleOutput.map((output, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 mb-1 text-sm ${
                  output.type === 'error' ? 'text-red-400' :
                  output.type === 'success' ? 'text-green-400' :
                  'text-blue-400'
                }`}
              >
                <span className="text-gray-500 text-xs">
                  {new Date(output.timestamp).toLocaleTimeString()}
                </span>
                {output.type === 'error' ? <AlertCircle size={14} /> :
                  output.type === 'success' ? <Check size={14} /> :
                  <Terminal size={14} />}
                <span className="flex-1 break-all">{output.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center px-2 h-6 bg-black border-t border-gray-800 text-sm select-none">
        <div className="flex items-center gap-4">
          <span className="text-blue-400">
            {openTabs.find(tab => tab.path === activeTab)?.language || 'plaintext'}
          </span>
          <span>{`Ln ${cursorPosition.line}, Col ${cursorPosition.column}`}</span>
          <span>Spaces: {tabSize}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button
            className="px-2 hover:bg-gray-900 rounded transition-colors text-gray-400 hover:text-blue-400"
            onClick={() => setWordWrap(prev => prev === 'on' ? 'off' : 'on')}
            title="Toggle Word Wrap"
          >
            {wordWrap === 'on' ? 'Wrap' : 'No Wrap'}
          </button>
          <button
            className="px-2 hover:bg-gray-900 rounded transition-colors text-gray-400 hover:text-blue-400"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <Settings size={14} />
          </button>
          <button
            className="px-2 hover:bg-gray-900 rounded transition-colors text-blue-400"
            onClick={saveFile}
            title="Save (Ctrl+S)"
          >
            <Save size={14} />
          </button>
        </div>
      </div>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-200">Create New File</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the name for your new file
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="filename" className="text-sm text-gray-400">
                Filename with extension
              </label>
              <input
                id="filename"
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="example.js"
                className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    createNewFile();
                  }
                }}
                autoFocus
              />
              <span className="text-xs text-gray-500">
                Path: {selectedPath || currentProjectPath}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition-colors"
              onClick={() => {
                setShowNewFileDialog(false);
                setNewItemName('');
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white transition-colors"
              onClick={createNewFile}
            >
              Create
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-200">Create New Folder</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the name for your new folder
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="foldername" className="text-sm text-gray-400">
                Folder name
              </label>
              <input
                id="foldername"
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="new-folder"
                className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    createNewFolder();
                  }
                }}
                autoFocus
              />
              <span className="text-xs text-gray-500">
                Path: {selectedPath || currentProjectPath}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition-colors"
              onClick={() => {
                setShowNewFolderDialog(false);
                setNewItemName('');
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white transition-colors"
              onClick={createNewFolder}
            >
              Create
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-900 border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-200">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete{' '}
              <span className="text-gray-300 font-medium">{selectedPath}</span>?<br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedPath(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500 transition-colors"
              onClick={deletePath}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="bg-gray-900 border border-gray-800 max-w-xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-gray-950 rounded border border-gray-800 px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="bg-transparent text-white flex-1 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-96 overflow-auto">
              {files
                .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(file => (
                  <button
                    key={file.path}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-800 rounded text-left"
                    onClick={() => {
                      openFile(file);
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                  >
                    <FileCode size={16} className="text-blue-400" />
                    <span className="text-gray-300">{file.name}</span>
                    <span className="text-gray-500 text-sm ml-auto">{file.path}</span>
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-gray-900 border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-200">Editor Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400">Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-20 bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
                  min={8}
                  max={32}
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400">Tab Size</label>
                <input
                  type="number"
                  value={tabSize}
                  onChange={(e) => setTabSize(Number(e.target.value))}
                  className="w-20 bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
                  min={2}
                  max={8}
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400">Word Wrap</label>
                <select
                  value={wordWrap}
                  onChange={(e) => setWordWrap(e.target.value)}
                  className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
                >
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400">Theme</label>
                <select
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value)}
                  className="bg-gray-950 text-white border border-gray-800 rounded px-3 py-1"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="quasar-dark">Quasar Dark</option>
                </select>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};



export default Quasar;