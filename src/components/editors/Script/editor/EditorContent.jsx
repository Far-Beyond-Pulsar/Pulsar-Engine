import React from 'react';
import dynamic from 'next/dynamic';
import { FileCode } from 'lucide-react';
import MediaViewer from '../media/MediaViewer';
import WelcomeScreen from './WelcomeScreen';

// Dynamically import Monaco Editor to prevent SSR issues
const MonacoEditor = dynamic(() => import('./MonacoWrapper'), { ssr: false });

/**
 * EditorContent Component
 * 
 * Main editor component that handles different types of content:
 * - Code editor (Monaco)
 * - Media viewer (images/3D)
 * - Welcome screen
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Path of the currently active tab
 * @param {Array} props.openTabs - Array of open file tabs
 * @param {Object} props.settings - Editor settings
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onOpenFolder - Folder open handler
 * @param {Function} props.onNewFile - New file handler
 * 
 * @example
 * <EditorContent
 *   activeTab="/path/to/file.js"
 *   openTabs={[...]}
 *   settings={editorSettings}
 *   onSave={handleSave}
 *   onOpenFolder={handleOpenFolder}
 *   onNewFile={handleNewFile}
 * />
 */
const EditorContent = ({ 
  activeTab, 
  openTabs, 
  settings, 
  onSave, 
  onOpenFolder, 
  onNewFile 
}) => {
  // Find the currently active file
  const activeFile = openTabs.find(tab => tab.path === activeTab);

  // Show welcome screen if no tab is active
  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <WelcomeScreen onOpenFolder={onOpenFolder} onNewFile={onNewFile} />
      </div>
    );
  }

  // Return null if active file not found
  if (!activeFile) return null;

  // Show media viewer for images and 3D files
  if (activeFile.fileType === 'image' || activeFile.fileType === '3d') {
    return <MediaViewer file={activeFile} />;
  }

  // Show Monaco editor for code files
  return (
    <MonacoEditor
      height="100%"
      defaultLanguage={activeFile.language || 'plaintext'}
      value={activeFile.content || ''}
      options={{
        // Editor appearance
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: settings.fontSize,
        lineHeight: 1.6,
        minimap: { enabled: settings.minimap },
        wordWrap: settings.wordWrap,
        tabSize: settings.tabSize,
        
        // Editor behavior
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        smoothScrolling: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        
        // Visual guides
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

/**
 * Component Maintenance Notes:
 * 
 * 1. Content Handling:
 *    - Supports code files (Monaco)
 *    - Supports media files (images/3D)
 *    - Welcome screen for empty state
 * 
 * 2. Editor Settings:
 *    - Font settings
 *    - Visual settings (minimap, word wrap)
 *    - Editor behavior
 *    - Theme support
 * 
 * 3. Performance:
 *    - Dynamic import for Monaco
 *    - No SSR for editor
 *    - Automatic layout handling
 * 
 * 4. Future Improvements:
 *    - Add error boundaries
 *    - Add loading states
 *    - Add file type specific settings
 *    - Add custom editor extensions
 * 
 * 5. Dependencies:
 *    - next/dynamic
 *    - Monaco Editor
 *    - MediaViewer
 *    - WelcomeScreen
 */
