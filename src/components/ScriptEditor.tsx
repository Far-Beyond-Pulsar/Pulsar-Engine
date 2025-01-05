import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Save, Files, Search, Settings, 
  ChevronRight, ChevronDown,
  FileCode, Folder, FolderOpen,
  Terminal, GitBranch, 
  AlertCircle, Check, Clock,
  X, Maximize2, Minimize2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  
  // Editor content
  const [editorContent, setEditorContent] = useState({});
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const updateHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };
  
    // Initial calculation
    updateHeight();
  
    // Also calculate when content changes
    if (editorContent[activeTab]) {
      // Small delay to ensure content is rendered
      setTimeout(updateHeight, 0);
    }
  }, [editorContent[activeTab]]);
  
  // Ref for cursor position updates
  const textareaRef = useRef(null);

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
      setEditorContent(prev => ({
        ...prev,
        [file.name]: content
      }));
    }
    
    setFiles(prev => [...prev, ...newFiles]);
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

  // Editor functionality
  const handleCodeChange = (e) => {
    const newContent = e.target.value;
    setEditorContent(prev => ({
      ...prev,
      [activeTab]: newContent
    }));
  };

  const handleKeyDown = (e) => {
    // Handle tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      setEditorContent(prev => ({
        ...prev,
        [activeTab]: newValue
      }));
      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
    
    // Save file (Ctrl/Cmd + S)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Command palette (Ctrl/Cmd + P)
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      setShowCommandPalette(true);
    }
  };

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    
    let line = 1;
    let column = 1;
    
    for (let i = 0; i < selectionStart; i++) {
      if (value[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
    
    setCursorPosition({ line, column });
    setSelectedText(textarea.value.substring(textarea.selectionStart, textarea.selectionEnd));
  };

  // Command handling
  const handleSave = async () => {
    if (!activeTab) return;
    
    try {
      const content = editorContent[activeTab];
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

  const handleRun = async () => {
    if (!activeTab) return;
    
    try {
      const content = editorContent[activeTab];
      // Create a safe evaluation environment
      const consoleLog = (...args) => {
        setConsoleOutput(prev => [...prev, {
          type: 'log',
          message: args.join(' ')
        }]);
      };
      
      const safeEval = new Function('console', `
        const log = console.log;
        try {
          ${content}
        } catch (error) {
          log('Error:', error.message);
        }
      `);
      
      setConsoleOutput([]);
      safeEval({ log: consoleLog });
      setConsoleOpen(true);
    } catch (error) {
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error: ${error.message}`
      }]);
      setConsoleOpen(true);
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
                className="flex items-center gap-1 py-1 hover:bg-gray-900 px-2 -ml-4 cursor-pointer"
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
              className={`flex items-center gap-1 py-1 hover:bg-gray-900 px-2 -ml-4 cursor-pointer
                ${activeTab === item.path ? 'bg-blue-900 text-white' : ''}`}
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

  // Console component
  const Console = () => (
    <div className="h-48 bg-black border-t border-gray-800">
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-800">
        <span className="text-sm font-medium">Console</span>
        <button onClick={() => setConsoleOpen(false)}>
          <X size={16} />
        </button>
      </div>
      <div className="p-2 h-40 overflow-auto font-mono text-sm">
        {consoleOutput.map((output, index) => (
          <div 
            key={index}
            className={`mb-1 ${
              output.type === 'error' ? 'text-red-400' :
              output.type === 'success' ? 'text-green-400' :
              'text-gray-300'
            }`}
          >
            {output.message}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black text-gray-300">
      {/* Toolbar */}
      <div className="flex items-center p-2 bg-black border-b border-gray-800">
        <button 
          className="p-2 hover:bg-gray-900 rounded transition-colors text-blue-400" 
          title="Run Script"
          onClick={handleRun}
        >
          <Play size={16} />
        </button>
        <button 
          className="p-2 hover:bg-gray-900 rounded transition-colors text-blue-400" 
          title="Save Script"
          onClick={handleSave}
        >
          <Save size={16} />
        </button>
        <div className="flex-1" />
        <button 
          className="p-2 hover:bg-gray-900 rounded transition-colors text-blue-400"
          onClick={() => setShowCommandPalette(true)}
        >
          <Search size={16} />
        </button>
        <button className="p-2 hover:bg-gray-900 rounded transition-colors text-blue-400">
          <Settings size={16} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 border-r border-gray-800 flex flex-col">
            <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
              <span>EXPLORER</span>
              <label className="cursor-pointer p-1 hover:bg-gray-900 rounded">
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
          {openTabs.length > 0 && (
            <div className="flex bg-black border-b border-gray-800">
              {openTabs.map((tab) => (
                <div 
                  key={tab.path}
                  className={`px-3 py-2 text-sm flex items-center gap-2 cursor-pointer border-r border-gray-800
                    ${activeTab === tab.path ? 'bg-gray-900 text-white' : 'hover:bg-gray-900'}`}
                  onClick={() => setActiveTab(tab.path)}
                >
                  <FileCode size={16} className="text-blue-400" />
                  {tab.name}
                  <button
                    className="hover:bg-gray-800 rounded-full p-1"
                    onClick={(e) => closeTab(tab.path, e)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor Content */}
          {activeTab ? (
            <div className="flex flex-1 overflow-hidden">
<div className="flex flex-1">
  <div className="flex min-w-full flex-grow overflow-auto">
    {/* Line Numbers */}
    <div className="flex-none px-4 py-2 text-right bg-black text-gray-600 select-none border-r border-gray-800 font-mono">
      {editorContent[activeTab]?.split('\n').map((_, i) => (
        <div key={i} className="leading-6 text-sm">
          {i + 1}
        </div>
      ))}
    </div>

    {/* Code Area */}
    <div className="flex-1">
      <textarea
        ref={textareaRef}
        value={editorContent[activeTab] || ''}
        onChange={handleCodeChange}
        onKeyDown={handleKeyDown}
        onSelect={updateCursorPosition}
        onClick={updateCursorPosition}
        spellCheck="false"
        className="block w-full p-2 bg-black text-gray-200 border-none outline-none leading-6 font-mono text-sm"
        style={{
          tabSize: 2,
          WebkitFontSmoothing: 'antialiased',
          resize: 'none',
          overflow: 'hidden',
          minHeight: '100%',
          height: `${textareaRef.current?.scrollHeight}px`
        }}
      />
    </div>
  </div>
</div>

              {/* Minimap */}
              {minimap && (
                <div className="w-20 border-l border-gray-800 bg-black">
                  <div className="opacity-30 p-2 text-[4px] leading-[4px] whitespace-pre overflow-hidden">
                    {editorContent[activeTab]}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No file open
            </div>
          )}
        </div>
      </div>

      {/* Console */}
      {consoleOpen && <Console />}

      {/* Status Bar */}
      <div className="flex items-center px-2 py-1 bg-gray-900 text-gray-400 text-xs border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <GitBranch size={14} className="text-blue-400" />
            <span>main</span>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <span>JavaScript</span>
          <span>UTF-8</span>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-blue-400" />
            <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          </div>
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-80 flex items-start justify-center pt-20"
          onClick={() => setShowCommandPalette(false)}
        >
          <div 
            className="w-96 bg-black border border-gray-800 rounded-lg shadow-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <input
              type="text"
              className="w-full bg-gray-900 px-4 py-3 outline-none text-sm border-b border-gray-800"
              placeholder="Type a command or search..."
              autoFocus
            />
            <div className="max-h-96 overflow-auto">
              {[
                {
                  label: 'Toggle Terminal',
                  description: 'Show or hide the console',
                  action: () => {
                    setConsoleOpen(!consoleOpen);
                    setShowCommandPalette(false);
                  }
                },
                {
                  label: 'Toggle Sidebar',
                  description: 'Show or hide the file explorer',
                  action: () => {
                    setSidebarOpen(!sidebarOpen);
                    setShowCommandPalette(false);
                  }
                },
                {
                  label: 'Toggle Minimap',
                  description: 'Show or hide code overview',
                  action: () => {
                    setMinimap(!minimap);
                    setShowCommandPalette(false);
                  }
                },
                {
                  label: 'Run Code',
                  description: 'Execute current file',
                  action: () => {
                    handleRun();
                    setShowCommandPalette(false);
                  }
                },
                {
                  label: 'Save File',
                  description: 'Save current file',
                  action: () => {
                    handleSave();
                    setShowCommandPalette(false);
                  }
                }
              ].map((command, index) => (
                <div 
                  key={index}
                  className="p-2 hover:bg-gray-900 cursor-pointer"
                  onClick={command.action}
                >
                  <div className="text-sm text-blue-400">{command.label}</div>
                  <div className="text-xs text-gray-500">{command.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="hidden">
        Shortcuts:
        - Ctrl/Cmd + S: Save file
        - Ctrl/Cmd + P: Open command palette
        - Tab: Insert 2 spaces
        - Ctrl/Cmd + /: Toggle comment
        - Ctrl/Cmd + F: Find in file
        - Ctrl/Cmd + Shift + F: Find in all files
      </div>
    </div>
  );
};

export default CodeEditor;