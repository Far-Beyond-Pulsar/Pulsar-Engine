import { useState, useCallback } from 'react';

export const useEditor = () => {
  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);

  const handleFileOpen = useCallback(async (file) => {
    try {
      if (!openTabs.some(tab => tab.path === file.path)) {
        // File opening logic here
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
  }, [openTabs]);

  const handleTabClose = useCallback((path) => {
    const tab = openTabs.find(t => t.path === path);
    if (tab?.isDirty) {
      const confirmed = window.confirm(`Do you want to save the changes to ${tab.name} before closing?`);
      if (confirmed) {
        handleFileSave().then(() => {
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
  }, [activeTab, openTabs]);

  const handleFileSave = useCallback(async () => {
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
  }, [activeTab, openTabs]);

  return {
    files,
    setFiles,
    openTabs,
    setOpenTabs,
    activeTab,
    setActiveTab,
    consoleOutput,
    setConsoleOutput,
    handleFileOpen,
    handleTabClose,
    handleTabClick: setActiveTab,
    handleFileSave,
  };
};
