import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Save, Files, Search, Settings, 
  ChevronRight, ChevronDown,
  FileCode, Folder, FolderOpen,
  X, Check, AlertCircle
} from 'lucide-react';
import TerminalPanel from '../components/Terminal';

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(mod => {
  // Pre-configure Monaco editor settings
  const MonacoEditorComponent = mod.default;
  return (props) => <MonacoEditorComponent {...props} options={{
    ...props.options,
    theme: 'amoled-black',
    backgroundColor: '#000000',
  }} />;
}), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-black">
      <span className="text-gray-400">Loading editor...</span>
    </div>
  )
});

const CodeEditor = () => {
  // Core state
  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [diagnostics, setDiagnostics] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  
  // Monaco editor instance ref
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // File handling
  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = [];
    
    for (const file of uploadedFiles) {
      const content = await file.text();
      newFiles.push({
        name: file.name,
        type: 'file',
        content,
        path: file.name,
      });
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Editor setup handler
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Register languages and set up editor options
    if (monaco) {
      // Define custom AMOLED theme
      monaco.editor.defineTheme('amoled-black', {
        base: 'hc-black',
        inherit: true,
        rules: [
          { token: '', foreground: 'ffffff', background: '000000' },
          { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' }
        ],
        colors: {
          'editor.background': '#000000',
          'editor.foreground': '#FFFFFF',
          'editor.lineHighlightBackground': '#111111',
          'editor.selectionBackground': '#264F78',
          'editorCursor.foreground': '#FFFFFF',
          'editorWhitespace.foreground': '#333333',
          'editorLineNumber.foreground': '#666666',
          'editor.selectionHighlightBackground': '#333333',
          'editor.wordHighlightBackground': '#333333',
          'editor.wordHighlightStrongBackground': '#444444',
          'editorBracketMatch.background': '#333333',
          'editorBracketMatch.border': '#666666'
        }
      });

      // Force apply the custom theme
      monaco.editor.setTheme('amoled-black');
      
      // Configure default editor background
      const darkThemeData = {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          // Editor colors
          'editor.background': '#000000',
          'editor.foreground': '#FFFFFF',
          'editorLineNumber.foreground': '#FFFFFF',
          'editor.lineHighlightBackground': '#101010',
          'editorGutter.background': '#000000',
          'editor.selectionBackground': '#264F78',
          'editor.inactiveSelectionBackground': '#264F78',
          
          // Widget colors (command palette, context menus, etc)
          'editorWidget.background': '#000000',
          'editorWidget.border': '#1E1E1E',
          'editorWidget.foreground': '#FFFFFF',
          'editorSuggestWidget.background': '#000000',
          'editorSuggestWidget.border': '#1E1E1E',
          'editorSuggestWidget.foreground': '#FFFFFF',
          'editorSuggestWidget.selectedBackground': '#264F78',
          'editorHoverWidget.background': '#000000',
          'editorHoverWidget.border': '#1E1E1E',
          'debugExceptionWidget.background': '#000000',
          'debugExceptionWidget.border': '#1E1E1E',
          
          // Dropdown control
          'dropdown.background': '#000000',
          'dropdown.border': '#1E1E1E',
          'dropdown.foreground': '#FFFFFF',
          
          // List and tree colors
          'list.activeSelectionBackground': '#264F78',
          'list.activeSelectionForeground': '#FFFFFF',
          'list.hoverBackground': '#101010',
          'list.hoverForeground': '#FFFFFF',
          'list.focusBackground': '#264F78',
          'list.focusForeground': '#FFFFFF',
          'list.inactiveSelectionBackground': '#1E1E1E',
          
          // Menu colors
          'menu.background': '#000000',
          'menu.foreground': '#FFFFFF',
          'menu.selectionBackground': '#264F78',
          'menu.selectionForeground': '#FFFFFF',
          'menu.separatorBackground': '#1E1E1E',
          
          // Quick picker
          'quickInput.background': '#000000',
          'quickInput.foreground': '#FFFFFF',
          'quickInputList.focusBackground': '#264F78',
          'pickerGroup.border': '#1E1E1E',
          'pickerGroup.foreground': '#3794FF',
          
          // Status bar colors
          'statusBar.background': '#000000',
          'statusBar.foreground': '#FFFFFF',
          'statusBar.border': '#1E1E1E',
          
          // Tab colors
          'tab.activeBackground': '#000000',
          'tab.inactiveBackground': '#000000',
          'tab.border': '#1E1E1E',
          
          // Title bar colors
          'titleBar.activeBackground': '#000000',
          'titleBar.activeForeground': '#FFFFFF',
          'titleBar.inactiveBackground': '#000000',
          'titleBar.inactiveForeground': '#CCCCCC',
          
          // Scrollbar
          'scrollbar.shadow': '#000000',
          'scrollbarSlider.background': '#1E1E1E80',
          'scrollbarSlider.hoverBackground': '#264F7880',
          'scrollbarSlider.activeBackground': '#264F78'
        }
      };
      
      monaco.editor.defineTheme('amoled-black', darkThemeData);
      monaco.editor.setTheme('amoled-black');

      // Register Rust language
      monaco.languages.register({ id: 'rust' });
      
      // Configure Rust analyzer
      monaco.languages.registerDocumentFormattingEditProvider('rust', {
        async provideDocumentFormattingEdits(model) {
          // This is where you'd typically call rustfmt
          // For now, we'll just preserve the existing formatting
          return [];
        }
      });

      // Register diagnostic provider
      monaco.languages.registerHoverProvider('rust', {
        provideHover: function(model, position) {
          // Simulate Rust analyzer hover information
          const word = model.getWordAtPosition(position);
          if (word) {
            return {
              contents: [
                { value: '**Rust Type Information**' },
                { value: 'Simulated type information for: ' + word.word }
              ]
            };
          }
        }
      });
      
      editor.updateOptions({
        minimap: { enabled: minimap },
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        rulers: [80],
        bracketPairColorization: { enabled: true },
        theme: 'vs-dark',
      });

      // Track cursor position
      editor.onDidChangeCursorPosition((e) => {
        const position = editor.getPosition();
        setCursorPosition({
          line: position.lineNumber,
          column: position.column
        });
      });

      // Simulate Rust analyzer diagnostics
      editor.onDidChangeModelContent(() => {
        const content = editor.getValue();
        // Simple simulation of Rust analysis
        const simpleAnalysis = [];
        if (content.includes('println!') && !content.includes('use std::io')) {
          simpleAnalysis.push({
            message: 'Consider importing std::io',
            severity: monaco.MarkerSeverity.Hint,
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
          });
        }
        monaco.editor.setModelMarkers(editor.getModel(), 'rust', simpleAnalysis);
        setDiagnostics(simpleAnalysis);
      });
    }
  };

  // Tab management
  const openFile = (file) => {
    if (!openTabs.find(tab => tab.path === file.path)) {
      setOpenTabs(prev => [...prev, file]);
    }
    setActiveTab(file.path);
  };

  const closeTab = (path, e) => {
    e.stopPropagation();
    setOpenTabs(prev => prev.filter(tab => tab.path !== path));
    if (activeTab === path) {
      setActiveTab(openTabs[openTabs.length - 2]?.path || null);
    }
  };

  // Command handling
  const handleSave = async () => {
    if (!activeTab || !editorRef.current) return;
    
    try {
      const content = editorRef.current.getValue();
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeTab;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Saved ${activeTab}`
      }]);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error saving ${activeTab}: ${error.message}`
      }]);
    }
  };

  // File tree component
  const FileTree = ({ items }) => (
    <div className="text-sm">
      {items.map((item, index) => (
        <div key={index} className="ml-4">
          {item.type === 'folder' ? (
            <div>
              <div 
                className="flex items-center gap-1 py-1 hover:bg-gray-950 px-2 -ml-4 cursor-pointer"
                onClick={() => {
                  const newFiles = [...files];
                  newFiles[index].open = !newFiles[index].open;
                  setFiles(newFiles);
                }}
              >
                {item.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {item.open ? <FolderOpen size={16} className="text-blue-400" /> : <Folder size={16} className="text-blue-400" />}
                <span>{item.name}</span>
              </div>
              {item.open && item.children && <FileTree items={item.children} />}
            </div>
          ) : (
            <div 
              className={`flex items-center gap-1 py-1 hover:bg-gray-950 px-2 -ml-4 cursor-pointer
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

  // Only render the editor on the client side
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <span className="text-gray-400">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-gray-300">
      {/* Toolbar */}
      <div className="flex items-center p-2 bg-black border-b border-gray-800">
        <button 
          className="p-2 hover:bg-gray-950 rounded transition-colors text-blue-400" 
          title="Save Script"
          onClick={handleSave}
        >
          <Save size={16} />
        </button>
        <div className="flex-1" />
        <button 
          className="p-2 hover:bg-gray-950 rounded transition-colors text-blue-400"
          onClick={() => setShowCommandPalette(true)}
        >
          <Search size={16} />
        </button>
        <button className="p-2 hover:bg-gray-950 rounded transition-colors text-blue-400">
          <Settings size={16} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 border-r border-gray-800 flex flex-col bg-black">
            <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
              <span>EXPLORER</span>
              <label className="cursor-pointer p-1 hover:bg-gray-950 rounded">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                />
                <Files size={16} className="text-blue-400" />
              </label>
            </div>
            <div className="flex-1 overflow-auto">
              <FileTree items={files} />
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex bg-black border-b border-gray-800">
            {openTabs.map((tab) => (
              <div 
                key={tab.path}
                className={`px-3 py-2 text-sm flex items-center gap-2 cursor-pointer border-r border-gray-800
                  ${activeTab === tab.path ? 'bg-gray-950 text-white' : 'hover:bg-gray-950'}`}
                onClick={() => openFile(tab)}
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
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              defaultLanguage="rust"
              theme="amoled-black"
              onMount={handleEditorDidMount}
              value={openTabs.find(tab => tab.path === activeTab)?.content || ''}
              options={{
                readOnly: !activeTab,
                minimap: { enabled: minimap },
                theme: 'amoled-black',
                backgroundColor: '#000000',
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
              }}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center px-2 py-1 bg-black border-t border-gray-800 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">Rust</span>
          <span>{`Ln ${cursorPosition.line}, Col ${cursorPosition.column}`}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {diagnostics.length > 0 ? (
            <div className="flex items-center gap-1 text-yellow-500">
              <AlertCircle size={14} />
              <span>{diagnostics.length} warnings</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-500">
              <Check size={14} />
              <span>No problems</span>
            </div>
          )}
        </div>
      </div>

      {/* Console Panel */}
      {consoleOpen && (
        <div className="h-48 border-t border-gray-800 bg-black">
          <TerminalPanel output={consoleOutput} />
        </div>
      )}
    </div>
  );
};

export default CodeEditor;