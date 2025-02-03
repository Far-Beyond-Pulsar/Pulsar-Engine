import { useEffect } from 'react';

/**
 * useKeyboardShortcuts Hook
 * 
 * A custom hook that handles global keyboard shortcuts for the editor.
 * Supports common editor actions with Ctrl/Cmd key combinations.
 * 
 * @param {Object} params - Hook parameters
 * @param {Function} params.onSave - Handler for save action
 * @param {Function} params.onSearch - Handler for search action
 * @param {Function} params.onNewFile - Handler for new file action
 * @param {Function} params.onToggleSidebar - Handler for toggling sidebar
 * @param {Function} params.onToggleTerminal - Handler for toggling terminal
 * 
 * @example
 * useKeyboardShortcuts({
 *   onSave: handleSave,
 *   onSearch: handleSearch,
 *   onNewFile: handleNewFile,
 *   onToggleSidebar: toggleSidebar,
 *   onToggleTerminal: toggleTerminal,
 * });
 */
export const useKeyboardShortcuts = ({
  onSave,
  onSearch,
  onNewFile,
  onToggleSidebar,
  onToggleTerminal,
}) => {
  useEffect(() => {
    /**
     * Global keyboard event handler
     * @param {KeyboardEvent} e - Keyboard event
     */
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

    // Add and remove event listener
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onSearch, onNewFile, onToggleSidebar, onToggleTerminal]);
};

/**
 * Hook Maintenance Notes:
 * 
 * 1. Supported Shortcuts:
 *    - Ctrl/Cmd + S: Save
 *    - Ctrl/Cmd + P: Search
 *    - Ctrl/Cmd + B: Toggle Sidebar
 *    - Ctrl/Cmd + `: Toggle Terminal
 *    - Ctrl/Cmd + N: New File
 * 
 * 2. Platform Support:
 *    - Windows/Linux: Ctrl key
 *    - macOS: Cmd key
 * 
 * 3. Event Handling:
 *    - Prevents default browser actions
 *    - Async support for save operation
 *    - Cleanup on unmount
 * 
 * 4. Future Improvements:
 *    - Add configurable shortcuts
 *    - Add multi-key combinations
 *    - Add shortcut conflict detection
 *    - Add shortcut overlay/help
 *    - Add modifier key combinations
 *    - Add shortcut recording
 * 
 * 5. Known Issues:
 *    - Potential conflicts with browser shortcuts
 *    - No visual feedback for shortcuts
 *    - No shortcut customization
 * 
 * 6. Best Practices:
 *    - Prevent default carefully
 *    - Clean up event listeners
 *    - Handle async operations
 *    - Consider platform differences
 */
