import { readDir, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Save, Files, Search, Settings,
  ChevronRight, ChevronDown,
  FileCode, Folder, FolderOpen,
  X, Check, AlertCircle
} from 'lucide-react';

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
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
  // Core state
  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [minimap, setMinimap] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [fsReady, setFsReady] = useState(false);

  // Monaco editor instance ref
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Load directory contents
  const loadDirectoryStructure = async () => {
    try {
      // Use the app's current directory
      const path = '.';
      console.log('Starting directory load from:', path);
      
      const entries = await readDir(path, { 
        recursive: true,
        dir: BaseDirectory.App 
      });

      const processEntries = (entries) => {
        return entries.map(entry => ({
          name: entry.name,
          path: entry.path,
          type: entry.children ? 'directory' : 'file',
          children: entry.children ? processEntries(entry.children) : undefined,
          open: false
        }));
      };
  
      const structuredItems = processEntries(entries);
      console.log('Processed files:', structuredItems);
      setFiles(structuredItems);
      setFsReady(true);
    } catch (error) {
      console.error('Full error:', error);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `${error.message} (${error.code})`
      }]);
      // Initialize with empty file list on error
      setFiles([]);
      setFsReady(true);
    }
  };

  // File operations
  const openFile = async (file) => {
    try {
      if (!openTabs.some(tab => tab.path === file.path)) {
        const content = await readTextFile(file.path);
        const language = getFileLanguage(file.name);
        
        setOpenTabs(prev => [...prev, {
          ...file,
          content,
          language
        }]);
      }
      setActiveTab(file.path);
    } catch (error) {
      console.error('Error opening file:', error);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error opening file: ${error.message}`
      }]);
    }
  };

  const closeTab = (path, e) => {
    e.stopPropagation();
    setOpenTabs(prev => prev.filter(tab => tab.path !== path));
    if (activeTab === path) {
      setActiveTab(openTabs[openTabs.length - 2]?.path || null);
    }
  };

  // Helper function to get file language
  const getFileLanguage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'rs': 'rust',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'json': 'json',
      'md': 'markdown',
      'css': 'css',
      'html': 'html',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
    };
    return languageMap[ext] || 'plaintext';
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
      rules: [],
      colors: {
        'editor.background': '#000000',
      }
    });
  };

  // File tree component with recursive rendering
  const FileTree = ({ items }) => (
    <div className="text-sm">
      {items.map((item) => (
        <div key={item.path}>
          {item.type === 'directory' ? (
            <div>
              <div
                className="flex items-center gap-1 py-1 hover:bg-gray-950 px-2 cursor-pointer"
                onClick={() => {
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
                }}
              >
                {item.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {item.open ? (
                  <FolderOpen size={16} className="text-blue-400" />
                ) : (
                  <Folder size={16} className="text-blue-400" />
                )}
                <span>{item.name}</span>
              </div>
              {item.open && item.children && (
                <div className="ml-4">
                  <FileTree items={item.children} />
                </div>
              )}
            </div>
          ) : (
            <div
              className={`flex items-center gap-1 py-1 hover:bg-gray-950 px-2 cursor-pointer
                  ${activeTab === item.path ? 'bg-gray-950 text-white' : ''}`}
              onClick={() => openFile(item)}
            >
              <FileCode size={16} className="text-blue-400" />
              <span>{item.name}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Initial load
  useEffect(() => {
    loadDirectoryStructure();
  }, []);

  // Loading state
  if (!fsReady) {
    return (
      <div className="flex flex-col h-full bg-black text-gray-300">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">
            Initializing file system...
          </div>
        </div>
      </div>
    );
  }

  // Main UI (rest of your UI code remains the same)
  return (
    <div className="flex flex-col h-full bg-black text-gray-300">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-800 flex flex-col bg-black">
          <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
            <span>EXPLORER</span>
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
                theme="amoled-black"
                onMount={handleEditorDidMount}
                value={openTabs.find(tab => tab.path === activeTab)?.content || ''}
                onChange={(value) => {
                  const updatedTabs = openTabs.map(tab =>
                    tab.path === activeTab ? { ...tab, content: value } : tab
                  );
                  setOpenTabs(updatedTabs);
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
                  tabSize: 4,
                  rulers: [80],
                  bracketPairColorization: { enabled: true },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No file selected
              </div>
            )}
          </div>
        </div>

        {/* Code Area */}
        <textarea
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleTab}
          spellCheck="false"
          className="flex-1 p-2 bg-black text-white resize-none outline-none leading-6"
          style={{
            tabSize: 2,
            WebkitFontSmoothing: 'antialiased',
          }}
        />
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
          onClick={() => setMinimap(prev => !prev)}
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Console Panel for errors */}
      {consoleOutput.length > 0 && (
        <div className="h-32 border-t border-gray-800 bg-black overflow-auto">
          {consoleOutput.map((output, index) => (
            <div
              key={index}
              className={`px-4 py-2 ${
                output.type === 'error' ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {output.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScriptEditor;
