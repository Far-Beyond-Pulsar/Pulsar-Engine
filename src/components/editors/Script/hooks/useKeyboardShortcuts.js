import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
  onSave,
  onSearch,
  onNewFile,
  onToggleSidebar,
  onToggleTerminal,
}) => {
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Save - Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        await onSave();
      }
      
      // Search - Ctrl/Cmd + P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        onSearch();
      }
      
      // Toggle Sidebar - Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        onToggleSidebar();
      }
      
      // Toggle Terminal - Ctrl/Cmd + `
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        onToggleTerminal();
      }

      // New File - Ctrl/Cmd + N
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onNewFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onSearch, onNewFile, onToggleSidebar, onToggleTerminal]);
};
