import { useState, useCallback, useRef } from 'react';
import { isImageFile, is3DFile, getFileLanguage } from '@/utils/fileUtils';

/**
 * useEditor Hook
 * 
 * Manages the editor state and operations including:
 * - Open tabs management
 * - File content handling
 * - Editor instance management
 * - Console output
 * 
 * @param {Map} fileHandles - Map of file handles from the file system
 * @returns {Object} Editor state and handlers
 */
export const useEditor = (fileHandles) => {
  // Editor state
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const editorRef = useRef(null);

  /**
   * Handles opening a file in the editor
   * Supports different file types (text, image, 3D)
   */
  const handleFileOpen = useCallback(async (file) => {
    if (file.type === 'directory') return;

    try {
      // Check if file is already open
      if (!openTabs.some(tab => tab.path === file.path)) {
        // Validate file handle
        if (!fileHandles || !fileHandles.get(file.path)) {
          throw new Error('File handle not found');
        }
        
        // Load file content
        const handle = fileHandles.get(file.path);
        const fileData = await handle.getFile();
        let content;
        
        // Handle different file types
        if (isImageFile(file.name)) {
          content = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(fileData);
          });
        } else {
          content = await fileData.text();
        }
        
        // Create new tab with file info
        const newTab = {
          ...file,
          content,
          language: getFileLanguage(file.name),
          fileType: isImageFile(file.name) ? 'image' : 
                   is3DFile(file.name) ? '3d' : 'text',
          mediaType: isImageFile(file.name) ? 
                    `image/${file.name.split('.').pop()}` : null,
          isDirty: false,
          originalContent: content
        };

        setOpenTabs(prev => [...prev, newTab]);
      }
      setActiveTab(file.path);
    } catch (error) {
      console.error('Error opening file:', error);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error opening file: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [openTabs, fileHandles]);

  /**
   * Handles closing a tab
   * Prompts to save if there are unsaved changes
   */
  const handleTabClose = useCallback((path) => {
    const tab = openTabs.find(t => t.path === path);
    
    if (tab?.isDirty) {
      const shouldSave = window.confirm(
        `Do you want to save the changes to ${tab.name} before closing?`
      );
      
      if (shouldSave) {
        handleFileSave(path).then(() => {
          setOpenTabs(prev => prev.filter(t => t.path !== path));
          if (activeTab === path) {
            const remainingTabs = openTabs.filter(t => t.path !== path);
            setActiveTab(remainingTabs[remainingTabs.length - 1]?.path || null);
          }
        });
        return;
      }
    }
    
    setOpenTabs(prev => prev.filter(t => t.path !== path));
    if (activeTab === path) {
      const remainingTabs = openTabs.filter(t => t.path !== path);
      setActiveTab(remainingTabs[remainingTabs.length - 1]?.path || null);
    }
  }, [activeTab, openTabs]);

  /**
   * Handles saving the current file
   * Updates file content and tab state
   */
  const handleFileSave = useCallback(async (path = activeTab) => {
    const fileToSave = openTabs.find(tab => tab.path === path);
    if (!fileToSave || !editorRef.current) return;

    try {
      const handle = fileHandles.get(fileToSave.path);
      if (!handle) throw new Error('File handle not found');
      
      const writable = await handle.createWritable();
      const content = editorRef.current.getValue();
      await writable.write(content);
      await writable.close();

      setOpenTabs(prev =>
        prev.map(tab =>
          tab.path === path
            ? { ...tab, content, isDirty: false, originalContent: content }
            : tab
        )
      );

      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Saved ${fileToSave.name}`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error saving file:', error);
      setConsoleOutput(prev => [...prev, {
        type: 'error',
        message: `Error saving file: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [activeTab, openTabs, fileHandles]);

  /**
   * Handles tab selection
   */
  const handleTabClick = useCallback((path) => {
    setActiveTab(path);
  }, []);

  /**
   * Sets the Monaco editor instance reference
   */
  const setEditorInstance = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  return {
    openTabs,
    activeTab,
    consoleOutput,
    handleFileOpen,
    handleTabClose,
    handleTabClick,
    handleFileSave,
    setEditorInstance,
  };
};

/**
 * Hook Maintenance Notes:
 * 
 * 1. State Management:
 *    - Tabs state
 *    - Active tab tracking
 *    - Console output
 *    - Editor reference
 * 
 * 2. File Operations:
 *    - Opening files
 *    - Saving files
 *    - Closing tabs
 *    - Different file type support
 * 
 * 3. Error Handling:
 *    - File operation errors
 *    - Console logging
 *    - User notifications
 * 
 * 4. Future Improvements:
 *    - Add auto-save
 *    - Add file change watching
 *    - Add undo/redo stack
 *    - Add tab reordering
 *    - Add split views
 * 
 * 5. Performance:
 *    - Memoized callbacks
 *    - Efficient state updates
 *    - File handle caching
 */
