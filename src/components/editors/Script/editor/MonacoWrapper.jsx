import React from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
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

const MonacoWrapper = ({
  value,
  language,
  theme,
  options,
  onChange,
  onMount,
  ...props
}) => {
  return (
    <MonacoEditor
      value={value}
      defaultLanguage={language}
      theme={theme}
      options={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: options?.fontSize || 14,
        lineHeight: 1.6,
        minimap: { enabled: options?.minimap ?? true },
        wordWrap: options?.wordWrap || 'on',
        tabSize: options?.tabSize || 2,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        smoothScrolling: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 10 },
        lineNumbers: options?.lineNumbers || 'on',
        renderWhitespace: 'selection',
        bracketPairColorization: { enabled: true },
        guides: {
          indentation: true,
          bracketPairs: true
        },
        ...options,
      }}
      onChange={onChange}
      onMount={onMount}
      {...props}
    />
  );
};

export default MonacoWrapper;