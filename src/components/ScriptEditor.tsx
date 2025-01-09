import React, { useState } from 'react';
import { Play, Save } from 'lucide-react';

const ScriptEditor = () => {
  const [code, setCode] = useState('// Write your script here\n\n');
  const [lineCount, setLineCount] = useState(2);

  const handleCodeChange = (e: { target: { value: any; }; }) => {
    const newCode = e.target.value;
    setCode(newCode);
    const newLineCount = newCode.split('\n').length;
    setLineCount(newLineCount);
  };

  const handleTab = (e: { key: string; preventDefault: () => void; target: { selectionStart: any; selectionEnd: any; }; }) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      // Insert 2 spaces for tab
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      
      // Move cursor after inserted tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-neutral-900 border-b border-neutral-800">
        <button className="p-2 hover:bg-neutral-800 rounded transition-colors" title="Run Script">
          <Play size={18} />
        </button>
        <button className="p-2 hover:bg-neutral-800 rounded transition-colors" title="Save Script">
          <Save size={18} />
        </button>
      </div>

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden font-mono text-sm">
        {/* Line Numbers */}
        <div className="px-4 py-2 text-right bg-neutral-900 text-neutral-500 select-none">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="leading-6">
              {i + 1}
            </div>
          ))}
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
      <div className="px-4 py-1 bg-neutral-900 border-t border-neutral-800 text-neutral-500 text-xs">
        {lineCount} lines | JavaScript
      </div>
    </div>
  );
};

export default ScriptEditor;