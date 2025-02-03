import React from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';

/**
 * Dynamic import of Monaco Editor with loading state
 * Uses Next.js dynamic import to prevent SSR issues
 */
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

/**
 * MonacoWrapper Component
 * 
 * A wrapper component for Monaco Editor with default configurations
 * and loading state handling.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - Editor content
 * @param {string} props.language - Programming language
 * @param {string} props.theme - Editor theme
 * @param {Object} props.options - Editor options
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onMount - Mount handler
 * 
 * @example
 * <MonacoWrapper
 *   value={fileContent}
 *   language="javascript"
 *   theme="vs-dark"
 *   options={{ fontSize: 14 }}
 *   onChange={handleChange}
 * />
 */
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
        // Font settings
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: options?.fontSize || 14,
        lineHeight: 1.6,

        // Editor features
        minimap: { enabled: options?.minimap ?? true },
        wordWrap: options?.wordWrap || 'on',
        tabSize: options?.tabSize || 2,
        
        // Cursor settings
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        
        // Scrolling behavior
        smoothScrolling: true,
        scrollBeyondLastLine: false,
        
        // Layout
        automaticLayout: true,
        padding: { top: 10 },
        
        // Visual aids
        lineNumbers: options?.lineNumbers || 'on',
        renderWhitespace: 'selection',
        bracketPairColorization: { enabled: true },
        guides: {
          indentation: true,
          bracketPairs: true
        },
        
        // Merge additional options
        ...options,
      }}
      onChange={onChange}
      onMount={onMount}
      {...props}
    />
  );
};

export default MonacoWrapper;

/**
 * Component Maintenance Notes:
 * 
 * 1. Dynamic Loading:
 *    - Uses Next.js dynamic import
 *    - Custom loading spinner
 *    - No SSR to prevent hydration issues
 * 
 * 2. Default Configuration:
 *    - Font settings (JetBrains Mono)
 *    - Editor behavior
 *    - Visual aids
 *    - Performance settings
 * 
 * 3. Customization:
 *    - All Monaco options available
 *    - Default values with override capability
 *    - Theme support
 * 
 * 4. Performance:
 *    - Automatic layout handling
 *    - Smooth animations
 *    - Optimized loading
 * 
 * 5. Future Improvements:
 *    - Add error boundary
 *    - Add custom extensions support
 *    - Add command palette
 *    - Add snippets support
 *    - Add custom themes
 * 
 * 6. Dependencies:
 *    - @monaco-editor/react
 *    - next/dynamic
 *    - lucide-react
 */
