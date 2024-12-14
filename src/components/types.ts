// types.ts

// Vector3 type for position, rotation, and scale
export interface Vector3 {
    x: number;
    y: number;
    z: number;
  }
  
  // Scene object interface
  export interface SceneObject {
    id: string;
    name: string;
    type: 'Camera' | 'Directional Light' | 'Cube' | 'Mesh';
    visible: boolean;
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
  }
  
  // Menu item interface
  export interface MenuItem {
    label?: string;
    shortcut?: string;
    action?: string;
    type?: 'separator';
  }
  
  export interface Menu {
    name: string;
    items: MenuItem[];
  }
  
  // Console message interface
  export interface ConsoleMessage {
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }
  
  // Tool types
  export type ToolType = 'select' | 'move' | 'rotate' | 'scale';
  
  // Initial scene objects
  export const initialSceneObjects: SceneObject[] = [
    { 
      id: 'obj_1', 
      name: 'Camera_1', 
      type: 'Camera', 
      visible: true, 
      position: { x: 0, y: 0, z: -10 }, 
      rotation: { x: 0, y: 0, z: 0 }, 
      scale: { x: 1, y: 1, z: 1 } 
    },
    { 
      id: 'obj_2', 
      name: 'Light_1', 
      type: 'Directional Light', 
      visible: true,
      position: { x: 5, y: 5, z: 5 }, 
      rotation: { x: 0, y: 0, z: 0 }, 
      scale: { x: 1, y: 1, z: 1 } 
    },
    { 
      id: 'obj_3', 
      name: 'Cube_1', 
      type: 'Cube', 
      visible: true,
      position: { x: 0, y: 0, z: 0 }, 
      rotation: { x: 0, y: 0, z: 0 }, 
      scale: { x: 1, y: 1, z: 1 } 
    }
  ];
  
  // Menu configuration
  export const menus: Menu[] = [
    {
      name: 'File',
      items: [
        { label: 'New Project', shortcut: 'Ctrl+N', action: 'new' },
        { label: 'Open Project', shortcut: 'Ctrl+O', action: 'open' },
        { type: 'separator' },
        { label: 'Save Project', shortcut: 'Ctrl+S', action: 'save' },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: 'saveAs' },
        { type: 'separator' },
        { label: 'Close Project', shortcut: 'Ctrl+W', action: 'close' },
        { label: 'Exit', shortcut: 'Alt+F4', action: 'exit' }
      ]
    },
    {
      name: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: 'undo' },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: 'redo' },
        { type: 'separator' },
        { label: 'Cut', shortcut: 'Ctrl+X', action: 'cut' },
        { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
        { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
        { label: 'Delete', shortcut: 'Del', action: 'delete' },
        { type: 'separator' },
        { label: 'Select All', shortcut: 'Ctrl+A', action: 'selectAll' },
        { label: 'Find', shortcut: 'Ctrl+F', action: 'find' },
        { label: 'Replace', shortcut: 'Ctrl+H', action: 'replace' }
      ]
    },
    {
      name: 'View',
      items: [
        { label: '⬦ Scene Hierarchy', action: 'toggleScene' },
        { label: '⚙ Properties', action: 'toggleProperties' },
        { label: '▤ Console', action: 'toggleConsole' },
        { type: 'separator' },
        { label: 'Zoom In', shortcut: 'Ctrl++', action: 'zoomIn' },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: 'zoomOut' },
        { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: 'resetZoom' },
        { type: 'separator' },
        { label: 'Full Screen', shortcut: 'F11', action: 'toggleFullScreen' }
      ]
    },
    {
      name: 'Project',
      items: [
        { label: 'Project Settings', action: 'projectSettings' },
        { label: 'Build Settings', action: 'buildSettings' },
        { type: 'separator' },
        { label: 'Run Project', shortcut: 'F5', action: 'runProject' },
        { label: 'Debug Project', shortcut: 'F6', action: 'debugProject' },
        { label: 'Profile Project', shortcut: 'F7', action: 'profile' },
        { type: 'separator' },
        { label: 'Publish Project', action: 'publishProject' },
        { label: 'Export Project', action: 'exportProject' }
      ]
    },
    {
      name: 'Build',
      items: [
        { label: 'Build Project', shortcut: 'Ctrl+B', action: 'buildProject' },
        { label: 'Clean Build', action: 'cleanBuild' },
        { type: 'separator' },
        { label: 'Build and Run', action: 'buildAndRun' }
      ]
    },
    {
      name: 'Help',
      items: [
        { label: 'Documentation', action: 'documentation' },
        { label: 'Keyboard Shortcuts', action: 'keyboardShortcuts' },
        { label: 'About', action: 'about' }
      ]
    }
  ];
  
  // Constants for rendering
  export const GRID_SIZE = 50;
  export const CANVAS_BACKGROUND = {
    startColor: '#0f1525',
    endColor: '#000000'
  };
  
  export const TOOL_ICONS = {
    select: 'Camera',
    move: 'Move',
    rotate: 'RotateCw',
    scale: 'Maximize2',
    play: 'Play'
  } as const;
  
  // Theme colors
  export const THEME = {
    primary: '#2388ff',
    background: '#000000',
    border: 'rgba(37, 99, 235, 0.2)',
    text: {
      primary: '#ffffff',
      secondary: '#666666',
      muted: '#4a5568'
    },
    hover: {
      primary: 'rgba(37, 99, 235, 0.1)',
      danger: 'rgba(239, 68, 68, 0.2)'
    }
  } as const;