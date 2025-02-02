import React from 'react';
import dynamic from 'next/dynamic';
import { FileCode } from 'lucide-react';
import MediaViewer from '../media/MediaViewer';
import WelcomeScreen from './WelcomeScreen';

const MonacoEditor = dynamic(() => import('./MonacoWrapper'), { ssr: false });

const EditorContent = ({ activeTab, openTabs, settings, onSave }) => {
  const activeFile = openTabs.find(tab => tab.path === activeTab);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <WelcomeScreen />
      </div>
    );
  }

  if (!activeFile) return null;

  if (activeFile.fileType === 'image' || activeFile.fileType === '3d') {
    return <MediaViewer file={activeFile} />;
  }

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage={activeFile.language || 'plaintext'}
      value={activeFile.content || ''}
      options={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: settings.fontSize,
        lineHeight: 1.6,
        minimap: { enabled: settings.minimap },
        wordWrap: settings.wordWrap,
        tabSize: settings.tabSize,
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
      theme={settings.theme}
    />
  );
};

export default EditorContent;
