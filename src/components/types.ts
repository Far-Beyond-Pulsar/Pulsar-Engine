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
        { label: 'New Scene', shortcut: 'Ctrl+Shift+N', action: 'newScene' },
        { label: 'New Script', shortcut: 'Ctrl+Alt+N', action: 'newScript' },
        { label: 'Open Project', shortcut: 'Ctrl+O', action: 'open' },
        { label: 'Open Recent', 
          submenu: [
            { label: 'Clear Recent', action: 'clearRecent' }
          ]
        },
        { type: 'separator' },
        { label: 'Save Project', shortcut: 'Ctrl+S', action: 'save' },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: 'saveAs' },
        { label: 'Save Scene As...', action: 'saveSceneAs' },
        { label: 'Save All', shortcut: 'Ctrl+Alt+S', action: 'saveAll' },
        { label: 'Export Scene', action: 'exportScene' },
        { type: 'separator' },
        { label: 'Project Templates', 
          submenu: [
            { label: 'Save As Template', action: 'saveTemplate' },
            { label: 'Import Template', action: 'importTemplate' },
            { label: 'Manage Templates', action: 'manageTemplates' },
            { type: 'separator' },
            { label: 'First Person Template', action: 'templateFPS' },
            { label: 'Third Person Template', action: 'templateTPS' },
            { label: '2D Platformer Template', action: 'template2DPlatform' },
            { label: 'Top-Down Template', action: 'templateTopDown' },
            { label: 'Empty 3D Project', action: 'template3DEmpty' },
            { label: 'Empty 2D Project', action: 'template2DEmpty' }
          ]
        },
        { type: 'separator' },
        { label: 'Close Project', shortcut: 'Ctrl+W', action: 'close' },
        { label: 'Close All', shortcut: 'Ctrl+Shift+W', action: 'closeAll' },
        { label: 'Exit', shortcut: 'Alt+F4', action: 'exit' }
      ]
    },
    {
      name: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: 'undo' },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: 'redo' },
        { label: 'History', action: 'history' },
        { type: 'separator' },
        { label: 'Cut', shortcut: 'Ctrl+X', action: 'cut' },
        { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
        { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
        { label: 'Paste Special', shortcut: 'Ctrl+Shift+V', action: 'pasteSpecial' },
        { label: 'Delete', shortcut: 'Del', action: 'delete' },
        { label: 'Duplicate', shortcut: 'Ctrl+D', action: 'duplicate' },
        { type: 'separator' },
        { label: 'Select All', shortcut: 'Ctrl+A', action: 'selectAll' },
        { label: 'Deselect', shortcut: 'Ctrl+Shift+A', action: 'deselect' },
        { label: 'Select Children', shortcut: 'Ctrl+Alt+A', action: 'selectChildren' },
        { label: 'Select Parent', shortcut: 'Ctrl+P', action: 'selectParent' },
        { label: 'Select Similar', action: 'selectSimilar' },
        { type: 'separator' },
        { label: 'Find', shortcut: 'Ctrl+F', action: 'find' },
        { label: 'Find in Scene', shortcut: 'Ctrl+Shift+F', action: 'findInScene' },
        { label: 'Find in Project', shortcut: 'Ctrl+Alt+F', action: 'findInProject' },
        { label: 'Replace', shortcut: 'Ctrl+H', action: 'replace' },
        { type: 'separator' },
        { label: 'Transform',
          submenu: [
            { label: 'Reset Transform', shortcut: 'Ctrl+R', action: 'resetTransform' },
            { label: 'Reset Position', action: 'resetPosition' },
            { label: 'Reset Rotation', action: 'resetRotation' },
            { label: 'Reset Scale', action: 'resetScale' },
            { type: 'separator' },
            { label: 'Align to View', action: 'alignToView' },
            { label: 'Align to Ground', action: 'alignToGround' }
          ]
        },
        { label: 'Snap Settings',
          submenu: [
            { label: 'Snap to Grid', shortcut: 'Ctrl+G', action: 'snapToGrid' },
            { label: 'Snap to Objects', action: 'snapToObjects' },
            { label: 'Snap to Surface', action: 'snapToSurface' },
            { label: 'Snap to Vertex', action: 'snapToVertex' },
            { type: 'separator' },
            { label: 'Configure Grid', action: 'configureGrid' },
            { label: 'Configure Snap', action: 'configureSnap' }
          ]
        }
      ]
    },
    {
      name: 'View',
      items: [
        { label: '| Scene Hierarchy', action: 'toggleScene' },
        { label: '# Properties', action: 'toggleProperties' },
        { label: '> Console', action: 'toggleConsole' },
        { label: '= Asset Browser', action: 'toggleAssets' },
        { label: '~ Animation Timeline', action: 'toggleTimeline' },
        { label: '@ Physics Debug', action: 'togglePhysics' },
        { label: '$ Network Monitor', action: 'toggleNetwork' },
        { label: '% Memory Usage', action: 'toggleMemory' },
        { type: 'separator' },
        { label: 'Layout',
          submenu: [
            { label: 'Default Layout', action: 'layoutDefault' },
            { label: 'Wide Layout', action: 'layoutWide' },
            { label: 'Tall Layout', action: 'layoutTall' },
            { label: '4-Split Layout', action: 'layout4Split' },
            { type: 'separator' },
            { label: 'Save Layout', action: 'saveLayout' },
            { label: 'Load Layout', action: 'loadLayout' },
            { label: 'Reset Layout', action: 'resetLayout' }
          ]
        },
        { label: 'Camera',
          submenu: [
            { label: 'Top View', shortcut: 'Num7', action: 'viewTop' },
            { label: 'Bottom View', shortcut: 'Ctrl+Num7', action: 'viewBottom' },
            { label: 'Front View', shortcut: 'Num1', action: 'viewFront' },
            { label: 'Back View', shortcut: 'Ctrl+Num1', action: 'viewBack' },
            { label: 'Left View', shortcut: 'Num3', action: 'viewLeft' },
            { label: 'Right View', shortcut: 'Ctrl+Num3', action: 'viewRight' },
            { label: 'Perspective', shortcut: 'Num5', action: 'viewPerspective' },
            { type: 'separator' },
            { label: 'Frame Selected', shortcut: 'F', action: 'frameSelected' },
            { label: 'Frame All', shortcut: 'A', action: 'frameAll' },
            { type: 'separator' },
            { label: 'Toggle Orthographic', shortcut: 'Num0', action: 'toggleOrthographic' },
            { label: 'Focus Selected', shortcut: 'Z', action: 'focusSelected' }
          ]
        },
        { label: 'Gizmos',
          submenu: [
            { label: 'Show Grid', action: 'toggleGrid' },
            { label: 'Show Wireframe', action: 'toggleWireframe' },
            { label: 'Show Colliders', action: 'toggleColliders' },
            { label: 'Show Bounds', action: 'toggleBounds' },
            { label: 'Show Light Radius', action: 'toggleLightRadius' },
            { label: 'Show Camera Frustum', action: 'toggleCameraFrustum' },
            { type: 'separator' },
            { label: 'Configure Gizmos', action: 'configureGizmos' }
          ]
        },
        { type: 'separator' },
        { label: 'Zoom In', shortcut: 'Ctrl++', action: 'zoomIn' },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: 'zoomOut' },
        { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: 'resetZoom' },
        { type: 'separator' },
        { label: 'Full Screen', shortcut: 'F11', action: 'toggleFullScreen' },
        { type: 'separator' },
        { label: 'Statistics', action: 'toggleStats' },
        { label: 'Render Settings',
          submenu: [
            { label: 'Quality Settings', action: 'qualitySettings' },
            { label: 'Post Processing', action: 'postProcessing' },
            { label: 'View Mode',
              submenu: [
                { label: 'Lit', action: 'viewModeLit' },
                { label: 'Unlit', action: 'viewModeUnlit' },
                { label: 'Wireframe', action: 'viewModeWireframe' },
                { label: 'Normal', action: 'viewModeNormal' },
                { label: 'UV', action: 'viewModeUV' },
                { label: 'Overdraw', action: 'viewModeOverdraw' }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Project',
      items: [
        { label: 'Project Settings', action: 'projectSettings' },
        { label: 'Build Settings', action: 'buildSettings' },
        { label: 'Package Manager', action: 'packageManager' },
        { label: 'Version Control',
          submenu: [
            { label: 'Initialize Repository', action: 'initRepo' },
            { label: 'Commit Changes', action: 'commit' },
            { label: 'Push Changes', action: 'push' },
            { label: 'Pull Changes', action: 'pull' },
            { type: 'separator' },
            { label: 'Branch Management', action: 'branchManagement' },
            { label: 'Merge Tool', action: 'mergeTool' }
          ]
        },
        { type: 'separator' },
        { label: 'Asset Management',
          submenu: [
            { label: 'Import Assets', action: 'importAssets' },
            { label: 'Import Package', action: 'importPackage' },
            { label: 'Export Package', action: 'exportPackage' },
            { label: 'Reimport All', action: 'reimportAssets' },
            { label: 'Clean Unused Assets', action: 'cleanAssets' },
            { type: 'separator' },
            { label: 'Asset Labels', action: 'assetLabels' },
            { label: 'Asset Bundles', action: 'assetBundles' }
          ]
        },
        { type: 'separator' },
        { label: 'Run Project', shortcut: 'F5', action: 'runProject' },
        { label: 'Debug Project', shortcut: 'F6', action: 'debugProject' },
        { label: 'Profile Project', shortcut: 'F7', action: 'profile' },
        { label: 'Stop', shortcut: 'Shift+F5', action: 'stopProject' },
        { label: 'Pause', shortcut: 'Ctrl+F5', action: 'pauseProject' },
        { label: 'Step Frame', shortcut: 'F10', action: 'stepFrame' },
        { type: 'separator' },
        { label: 'Publish Project', action: 'publishProject' },
        { label: 'Export Project',
          submenu: [
            { label: 'Windows', action: 'exportWindows' },
            { label: 'macOS', action: 'exportMacOS' },
            { label: 'Linux', action: 'exportLinux' },
            { type: 'separator' },
            { label: 'Web (WebAssembly)', action: 'exportWeb' },
            { label: 'Mobile',
              submenu: [
                { label: 'Android', action: 'exportAndroid' },
                { label: 'iOS', action: 'exportIOS' }
              ]
            },
            { type: 'separator' },
            { label: 'Configure Platforms', action: 'configurePlatforms' }
          ]
        }
      ]
    },
    {
      name: 'Build',
      items: [
        { label: 'Build Project', shortcut: 'Ctrl+B', action: 'buildProject' },
        { label: 'Rebuild All', action: 'rebuildAll' },
        { label: 'Clean Build', action: 'cleanBuild' },
        { type: 'separator' },
        { label: 'Build and Run', action: 'buildAndRun' },
        { label: 'Build Configuration',
          submenu: [
            { label: 'Debug', action: 'configDebug' },
            { label: 'Release', action: 'configRelease' },
            { label: 'Profile', action: 'configProfile' },
            { type: 'separator' },
            { label: 'Custom...', action: 'configCustom' }
          ]
        },
        { type: 'separator' },
        { label: 'Batch Build', action: 'batchBuild' },
        { label: 'Build Archive', action: 'buildArchive' },
        { type: 'separator' },
        { label: 'Generate Documentation', action: 'generateDocs' }
      ]
    },
    {
      name: 'Tools',
      items: [
        { label: 'Asset Pipeline',
          submenu: [
            { label: 'Texture Tools',
              submenu: [
                { label: 'Texture Compiler', action: 'textureCompiler' },
                { label: 'Texture Atlas Generator', action: 'textureAtlas' },
                { label: 'Sprite Sheet Slicer', action: 'spriteSlicer' },
                { label: 'Normal Map Generator', action: 'normalMapGen' },
                { label: 'Mipmap Generator', action: 'mipmapGen' },
                { label: 'Texture Compression', action: 'textureCompress' }
              ]
            },
            { label: 'Model Tools',
              submenu: [
                { label: 'Model Optimizer', action: 'modelOptimizer' },
                { label: 'LOD Generator', action: 'lodGenerator' },
                { label: 'UV Unwrapper', action: 'uvUnwrap' },
                { label: 'Mesh Simplifier', action: 'meshSimplify' },
                { label: 'Collision Mesh Generator', action: 'collisionGen' }
              ]
            },
            { label: 'Audio Tools',
              submenu: [
                { label: 'Audio Converter', action: 'audioConverter' },
                { label: 'Audio Compressor', action: 'audioCompress' },
                { label: 'Waveform Generator', action: 'waveformGen' },
                { label: 'Sound Bank Creator', action: 'soundBankCreate' }
              ]
            },
            { type: 'separator' },
            { label: 'Batch Process', action: 'batchProcess' },
            { label: 'Asset Validation', action: 'assetValidate' }
          ]
        },
        { label: 'Scene Tools',
          submenu: [
            { label: 'Prefab Editor', action: 'prefabEditor' },
            { label: 'Material Editor', action: 'materialEditor' },
            { label: 'Particle Editor', action: 'particleEditor' },
            { label: 'Terrain Editor', action: 'terrainEditor' },
            { type: 'separator' },
            { label: 'Navigation',
              submenu: [
                { label: 'Navigation Mesh Generator', action: 'navMeshGen' },
                { label: 'Path Finding Debug', action: 'pathFindDebug' },
                { label: 'Obstacle Manager', action: 'obstacleManager' }
              ]
            },
            { label: 'Scene Optimization',
              submenu: [
                { label: 'Occlusion Culling', action: 'occlusionSetup' },
                { label: 'Light Probe Generator', action: 'lightProbeGen' },
                { label: 'Reflection Probe Setup', action: 'reflectionSetup' }
              ]
            }
          ]
        },
        { type: 'separator' },
        { label: 'Editors',
          submenu: [
            { label: 'Script Editor', action: 'scriptEditor' },
            { label: 'Shader Editor', action: 'shaderEditor' },
            { label: 'Animation Editor', action: 'animationEditor' },
            { label: 'State Machine Editor', action: 'stateMachineEditor' },
            { label: 'UI Editor', action: 'uiEditor' },
            { label: 'Dialogue Editor', action: 'dialogueEditor' }
          ]
        },
        { label: 'Visual Scripting',
          submenu: [
            { label: 'Node Editor', action: 'nodeEditor' },
            { label: 'Blueprint Editor', action: 'blueprintEditor' },
            { label: 'Behavior Tree Editor', action: 'behaviorTreeEditor' },
            { type: 'separator' },
            { label: 'Custom Nodes', action: 'customNodes' },
            { label: 'Debug Visual Scripts', action: 'debugVisualScripts' }
          ]
        },
        { type: 'separator' },
        { label: 'Debug Tools',
          submenu: [
            { label: 'Performance Profiler', action: 'profiler' },
            { label: 'Memory Analyzer', action: 'memoryAnalyzer' },
            { label: 'Network Debugger', action: 'networkDebugger' },
            { label: 'Physics Debugger', action: 'physicsDebugger' },
            { label: 'Audio Debugger', action: 'audioDebugger' },
            { type: 'separator' },
            { label: 'Debug Console', action: 'debugConsole' },
            { label: 'Debug Draw', action: 'debugDraw' }
          ]
        },
        { label: 'AI Tools',
          submenu: [
            { label: 'Behavior Tree Designer', action: 'behaviorDesigner' },
            { label: 'Navigation Mesh Editor', action: 'navMeshEditor' },
            { label: 'Pathfinding Debug', action: 'pathfindingDebug' },
            { type: 'separator' },
            { label: 'AI Training', action: 'aiTraining' },
            { label: 'Neural Network Editor', action: 'neuralNetEditor' }
          ]
        }
      ]
    },
    {
      name: 'Settings',
      items: [
        { label: 'Preferences', action: 'preferences' },
        { label: 'Keyboard Shortcuts', action: 'keyboardShortcuts' },
        { type: 'separator' },
        { label: 'Editor Settings',
          submenu: [
            { label: 'General', action: 'settingsGeneral' },
            { label: 'Rendering', action: 'settingsRendering' },
            { label: 'Physics', action: 'settingsPhysics' },
            { label: 'Audio', action: 'settingsAudio' },
            { label: 'Input', action: 'settingsInput' },
            { label: 'Navigation', action: 'settingsNavigation' },
            { label: 'Networking', action: 'settingsNetwork' }
          ]
        },
        { label: 'Theme',
          submenu: [
            { label: 'Light', action: 'themeLight' },
            { label: 'Dark', action: 'themeDark' },
            { label: 'System', action: 'themeSystem' },
            { type: 'separator' },
            { label: 'Customize Theme', action: 'themeCustomize' }
          ]
        },
        { label: 'Extensions',
          submenu: [
            { label: 'Extension Manager', action: 'extensionManager' },
            { label: 'Install Extension', action: 'installExtension' },
            { type: 'separator' },
            { label: 'Extension Development', action: 'extensionDev' }
          ]
        }
      ]
    },
    {
      name: 'Help',
      items: [
        { label: 'Documentation', action: 'documentation' },
        { label: 'API Reference', action: 'apiReference' },
        { label: 'Tutorials', action: 'tutorials' },
        { label: 'Sample Projects', action: 'samples' },
        { type: 'separator' },
        { label: 'Learning Resources',
          submenu: [
            { label: 'Getting Started Guide', action: 'gettingStarted' },
            { label: 'Video Tutorials', action: 'videoTutorials' },
            { label: 'Best Practices', action: 'bestPractices' },
            { label: 'Performance Guide', action: 'performanceGuide' }
          ]
        },
        { label: 'Community',
          submenu: [
            { label: 'Forums', action: 'forums' },
            { label: 'Discord Server', action: 'discord' },
            { label: 'Developer Blog', action: 'blog' },
            { label: 'Asset Store', action: 'assetStore' }
          ]
        },
        { type: 'separator' },
        { label: 'Report Issue', action: 'reportIssue' },
        { label: 'Feature Request', action: 'featureRequest' },
        { label: 'Security Report', action: 'securityReport' },
        { type: 'separator' },
        { label: 'Check for Updates', action: 'checkUpdates' },
        { label: 'Register Product', action: 'register' },
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