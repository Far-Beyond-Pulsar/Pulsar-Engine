import { useState, useCallback } from 'react';

export const useFileSystem = () => {
  const [fileHandles] = useState(new Map());
  const [currentProjectPath, setCurrentProjectPath] = useState('');

  const loadProjectFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const projectStructure = await processDirectory(dirHandle);
      setCurrentProjectPath(dirHandle.name);
      return { structure: projectStructure, projectPath: dirHandle.name };
    } catch (error) {
      console.error('Error loading project:', error);
      throw error;
    }
  };

  const processDirectory = async (handle, path = '') => {
    const entries = [];
    for await (const entry of handle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      
      if (entry.kind === 'directory') {
        const dirHandle = await handle.getDirectoryHandle(entry.name);
        fileHandles.set(entryPath, dirHandle);
        const children = await processDirectory(dirHandle, entryPath);
        entries.push({
          name: entry.name,
          path: entryPath,
          type: 'directory',
          children,
          open: false,
        });
      } else {
        const fileHandle = await handle.getFileHandle(entry.name);
        fileHandles.set(entryPath, fileHandle);
        entries.push({
          name: entry.name,
          path: entryPath,
          type: 'file',
        });
      }
    }
    
    return entries.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const createFile = async (filename, parentPath) => {
    try {
      const parentHandle = parentPath ? 
        fileHandles.get(parentPath) : 
        await window.showDirectoryPicker();

      const fileHandle = await parentHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write('');
      await writable.close();

      fileHandles.set(`${parentPath || '.'}/${filename}`, fileHandle);
      return true;
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  };

  return {
    fileHandles,
    currentProjectPath,
    loadProjectFolder,
    createFile,
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