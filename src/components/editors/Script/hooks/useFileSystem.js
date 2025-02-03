import { useState, useCallback } from 'react';

/**
 * useFileSystem Hook
 * 
 * Manages file system operations using the File System Access API.
 * Handles file/folder operations and maintains file tree structure.
 * 
 * @returns {Object} File system state and operations
 */
export const useFileSystem = () => {
  // State management
  const [files, setFiles] = useState([]); // File tree structure
  const [fileHandles, setFileHandles] = useState(new Map()); // File handle cache
  const [currentProjectPath, setCurrentProjectPath] = useState('');
  const [rootDirectoryHandle, setRootDirectoryHandle] = useState(null);

  /**
   * Toggles folder open/closed state
   * @param {string} path - Path of folder to toggle
   */
  const toggleFolder = useCallback((path) => {
    setFiles(prevFiles => {
      const updateFiles = (items) => {
        return items.map(item => {
          if (item.path === path && item.type === 'directory') {
            return { ...item, open: !item.open };
          }
          if (item.children) {
            return { ...item, children: updateFiles(item.children) };
          }
          return item;
        });
      };
      return updateFiles(prevFiles);
    });
  }, []);

  /**
   * Loads a project folder and builds file tree
   * @returns {Promise<Object>} Project structure and path
   */
  const loadProjectFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      setRootDirectoryHandle(dirHandle);
      
      // Initialize file handles
      const newFileHandles = new Map();
      newFileHandles.set(dirHandle.name, dirHandle);
      
      // Process directory structure
      const projectStructure = await processDirectory(dirHandle, '', newFileHandles);
      
      // Update state
      setFileHandles(newFileHandles);
      setFiles(projectStructure);
      setCurrentProjectPath(dirHandle.name);
      
      return { structure: projectStructure, projectPath: dirHandle.name };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Folder selection was cancelled');
        return null;
      }
      console.error('Error loading project:', error);
      return null;
    }
  };

  /**
   * Creates a new file in the specified directory
   * @param {string} filename - Name of new file
   * @param {string} parentPath - Path of parent directory
   */
  const createFile = async (filename, parentPath) => {
    try {
      let parentHandle;
      if (parentPath) {
        parentHandle = fileHandles.get(parentPath);
      } else {
        parentHandle = rootDirectoryHandle;
      }

      if (!parentHandle) {
        throw new Error('Parent directory not found');
      }

      // Create and initialize file
      const fileHandle = await parentHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write('');
      await writable.close();

      await refreshFiles();
      return true;
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  };

  /**
   * Deletes a file or directory
   * @param {string} path - Path of item to delete
   */
  const deleteItem = async (path) => {
    try {
      if (!rootDirectoryHandle) throw new Error('No root directory');
      
      const handle = fileHandles.get(path);
      if (!handle) throw new Error('Item not found');
  
      // Get parent directory
      const pathParts = path.split('/');
      const itemName = pathParts.pop();
      const parentPath = pathParts.join('/');
      const parentHandle = parentPath ? fileHandles.get(parentPath) : rootDirectoryHandle;
  
      if (!parentHandle) throw new Error('Parent directory not found');
  
      // Delete item
      if (handle.kind === 'directory') {
        await parentHandle.removeEntry(itemName, { recursive: true });
      } else {
        await parentHandle.removeEntry(itemName);
      }
  
      await refreshFiles();
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  /**
   * Copies directory contents recursively
   * @param {FileSystemDirectoryHandle} sourceDir - Source directory
   * @param {FileSystemDirectoryHandle} targetDir - Target directory
   */
  const copyDirectoryContents = async (sourceDir, targetDir) => {
    for await (const entry of sourceDir.values()) {
      if (entry.kind === 'directory') {
        const newDir = await targetDir.getDirectoryHandle(entry.name, { create: true });
        const sourceSubDir = await sourceDir.getDirectoryHandle(entry.name);
        await copyDirectoryContents(sourceSubDir, newDir);
      } else {
        const file = await entry.getFile();
        const newFileHandle = await targetDir.getFileHandle(entry.name, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(await file.arrayBuffer());
        await writable.close();
      }
    }
  };

  /**
   * Renames a file or directory
   * @param {string} oldPath - Current path
   * @param {string} newName - New name
   */
  const renameItem = async (oldPath, newName) => {
    try {
      if (!rootDirectoryHandle) throw new Error('No root directory');
      
      const handle = fileHandles.get(oldPath);
      if (!handle) throw new Error('Item not found');

      // Get parent directory
      const pathParts = oldPath.split('/');
      const oldName = pathParts.pop();
      const parentPath = pathParts.join('/');
      const parentHandle = parentPath ? fileHandles.get(parentPath) : rootDirectoryHandle;

      if (!parentHandle) throw new Error('Parent directory not found');

      // Rename operation
      try {
        if (handle.kind === 'directory') {
          const newDirHandle = await parentHandle.getDirectoryHandle(newName, { create: true });
          await copyDirectoryContents(handle, newDirHandle);
          await parentHandle.removeEntry(oldName, { recursive: true });
        } else {
          const file = await handle.getFile();
          const newFileHandle = await parentHandle.getFileHandle(newName, { create: true });
          const writable = await newFileHandle.createWritable();
          await writable.write(await file.arrayBuffer());
          await writable.close();
          await parentHandle.removeEntry(oldName);
        }
      } catch (error) {
        throw new Error(`Failed to rename: ${error.message}`);
      }

      await refreshFiles();
      return true;
    } catch (error) {
      console.error('Error renaming item:', error);
      throw error;
    }
  };

  /**
   * Refreshes the file tree structure
   */
  const refreshFiles = async () => {
    try {
      if (!rootDirectoryHandle) return;
      
      const newFileHandles = new Map();
      newFileHandles.set(currentProjectPath, rootDirectoryHandle);
      
      const projectStructure = await processDirectory(
        rootDirectoryHandle, 
        '', 
        newFileHandles
      );
      
      setFileHandles(newFileHandles);
      setFiles(projectStructure);
      
      return { structure: projectStructure, projectPath: currentProjectPath };
    } catch (error) {
      console.error('Error refreshing files:', error);
      throw error;
    }
  };

  /**
   * Creates a new folder
   * @param {string} folderName - Name of new folder
   * @param {string} parentPath - Path of parent directory
   */
  const createFolder = async (folderName, parentPath) => {
    try {
      let parentHandle;
      if (parentPath) {
        parentHandle = fileHandles.get(parentPath);
      } else {
        parentHandle = rootDirectoryHandle;
      }

      if (!parentHandle) {
        throw new Error('Parent directory not found');
      }

      await parentHandle.getDirectoryHandle(folderName, { create: true });
      await refreshFiles();
      
      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  /**
   * Processes directory structure recursively
   * @param {FileSystemDirectoryHandle} handle - Directory handle
   * @param {string} path - Current path
   * @param {Map} handles - File handles map
   * @returns {Array} Directory structure
   */
  const processDirectory = async (handle, path = '', handles = new Map()) => {
    const entries = [];
    for await (const entry of handle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      
      if (entry.kind === 'directory') {
        const dirHandle = await handle.getDirectoryHandle(entry.name);
        handles.set(entryPath, dirHandle);
        const children = await processDirectory(dirHandle, entryPath, handles);
        entries.push({
          name: entry.name,
          path: entryPath,
          type: 'directory',
          children,
          open: false,
        });
      } else {
        const fileHandle = await handle.getFileHandle(entry.name);
        handles.set(entryPath, fileHandle);
        entries.push({
          name: entry.name,
          path: entryPath,
          type: 'file',
        });
      }
    }
    
    // Sort directories first, then alphabetically
    return entries.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  return {
    files,
    setFiles,
    fileHandles,
    currentProjectPath,
    rootDirectoryHandle,
    loadProjectFolder,
    refreshFiles,
    toggleFolder,
    createFile,
    deleteItem,
    createFolder,
    renameItem,
    getFiles: () => files,
  };
};

// In your main Quasar component:
const ExampleUsage = () => {
  const [files, setFiles] = useState([]);
  const { loadProjectFolder, createFile, currentProjectPath } = useFileSystem();
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

  const handleLoadProject = async () => {
    try {
      const { structure } = await loadProjectFolder();
      setFiles(structure);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const handleCreateFile = async (filename, path) => {
    try {
      await createFile(filename, path);
      const { structure } = await loadProjectFolder();
      setFiles(structure);
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  };

  return (
    <>
      <button onClick={handleLoadProject}>Open Folder</button>
      
      <NewFileDialog
        isOpen={showNewFileDialog}
        onClose={() => setShowNewFileDialog(false)}
        onCreate={handleCreateFile}
        selectedPath={selectedPath}
        currentProjectPath={currentProjectPath}
      />
    </>
  );
};

/**
 * Hook Maintenance Notes:
 * 
 * 1. File System Features:
 *    - Project folder loading
 *    - File/folder creation
 *    - File/folder deletion
 *    - File/folder renaming
 *    - Directory processing
 *    - File handle management
 * 
 * 2. State Management:
 *    - File tree structure
 *    - File handles cache
 *    - Project path tracking
 *    - Root directory reference
 * 
 * 3. Error Handling:
 *    - Operation validation
 *    - Error propagation
 *    - User feedback
 * 
 * 4. Performance:
 *    - File handle caching
 *    - Optimized directory processing
 *    - Efficient state updates
 * 
 * 5. Future Improvements:
 *    - Add file watching
 *    - Add batch operations
 *    - Add undo/redo
 *    - Add file filters
 *    - Add search functionality
 *    - Add file metadata
 * 
 * 6. Dependencies:
 *    - File System Access API
 *    - React state management
 * 
 * 7. Browser Support:
 *    - Requires modern browsers
 *    - Requires HTTPS or localhost
 */