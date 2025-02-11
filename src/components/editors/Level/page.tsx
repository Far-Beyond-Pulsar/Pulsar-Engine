import React, { useState, useEffect, useCallback, useRef } from 'react';

import {DockablePanel}       from '@/components/DockablePanel/index';
import {initialSceneObjects} from '@/components/types';
import useCanvas             from '@/hooks/useCanvas';
import PropertiesPanel       from './PropertiesPanel';
import SceneHierarchy        from './SceneHierarchy';
import Viewport              from './Viewport';

interface PanelVisibility {
  properties:    boolean;
  hierarchy:     boolean;
  viewport:      boolean;
  console:       boolean;
  [key: string]: boolean;
}

interface PanelPosition {
  x: number;
  y: number;
}

interface PanelPositions {
  hierarchy:     PanelPosition;
  properties:    PanelPosition;
  console:       PanelPosition;
  viewport:      PanelPosition;
  [key: string]: PanelPosition;
}

interface SceneObject {
  id:            string;
  name:          string;
  type:          string;
  position:      { x: number; y: number; z: number };
  rotation:      { x: number; y: number; z: number };
  scale:         { x: number; y: number; z: number };
  [key: string]: any;
}

interface ConsoleMessage {
  type:      string;
  message:   string;
  timestamp: string;
}

const LevelEditor: React.FC = () => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Core state management
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [selectedObject, setSelectedObject] =   useState<SceneObject | null>(null);
  const [sceneObjects, setSceneObjects] =       useState<SceneObject[]>(initialSceneObjects);
  const [isMaximized, setIsMaximized] =         useState<boolean>(false);
  const [activeTool, setActiveTool] =           useState<string>('select');
  const [activeMenu, setActiveMenu] =           useState<string | null>(null);
  const [isPlaying] =                           useState<boolean>(false);
  const [fps, setFps] =                         useState<number>(1024);
  
  // Panel visibility state
  const [visiblePanels, setVisiblePanels] = useState<PanelVisibility>({
    hierarchy: true,
    properties: true,
    console: true,
    viewport: true
  });

  // Panel positions state with percentage-based positioning
  const [panelPositions, setPanelPositions] = useState<PanelPositions>({
    hierarchy:  { x: 0, y: 40 },
    properties: { x: 0, y: 40 },
    console:    { x: 0, y: 40 },
    viewport:   { x: 250, y: 40 }
  });
  
  const { lastFrameTimeRef, renderScene } = useCanvas(sceneObjects, selectedObject);
  const animationFrameRef = useRef<number | null>(null);

  // Utility functions
  const logMessage = useCallback((type: string, message: string) => {
    setConsoleMessages(prev => [
      ...prev,
      { type, message, timestamp: new Date().toISOString() }
    ].slice(-100));
  }, []);

  // Menu handlers
  const handleMenuClick = useCallback((menuName: string) => {
    setActiveMenu(prev => prev === menuName ? null : menuName);
  }, []);

  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'new':
        setSceneObjects(initialSceneObjects);
        setSelectedObject(null);
        logMessage('info', 'New project created');
        break;
      case 'save':
        try {
          localStorage.setItem('sceneObjects', JSON.stringify(sceneObjects));
          logMessage('success', 'Project saved successfully');
        } catch (error) {
          logMessage('error', 'Failed to save project');
        }
        break;
      case 'load':
        try {
          const savedScene = localStorage.getItem('sceneObjects');
          if (savedScene) {
            setSceneObjects(JSON.parse(savedScene));
            logMessage('success', 'Project loaded successfully');
          }
        } catch (error) {
          logMessage('error', 'Failed to load project');
        }
        break;
      default:
        if (action.startsWith('toggle')) {
          const panelName = action.replace('toggle', '').toLowerCase();
          togglePanel(panelName as keyof PanelVisibility);
        }
    }
    setActiveMenu(null);
  }, [sceneObjects, logMessage]);

  // Tool handlers
  const handleToolChange = useCallback((tool: string) => {
    setActiveTool(tool);
    logMessage('info', `Selected tool: ${tool}`);
  }, [logMessage]);

  // Property handlers
  const handlePropertyChange = useCallback((
    obj: SceneObject,
    property: string,
    axis: string,
    value: string
  ) => {
    if (!obj?.id) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setSceneObjects(prev => prev.map(o => {
      if (o.id === obj.id) {
        return {
          ...o,
          [property]: { ...(o as any)[property], [axis]: numValue }
        };
      }
      return o;
    }));
  }, []);

  // Panel handlers
  const handlePanelMove = useCallback((panelId: string, position: PanelPosition) => {
    setPanelPositions(prev => ({
      ...prev,
      [panelId]: position
    }));
  }, []);

  const togglePanel = useCallback((panelName: keyof PanelVisibility) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
    logMessage('info', `${panelName} panel ${visiblePanels[panelName] ? 'hidden' : 'shown'}`);
  }, [visiblePanels, logMessage]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (lastFrameTimeRef.current) {
      const newFps = 1000 / (timestamp - lastFrameTimeRef.current);
      setFps(Math.round(newFps));
    }
    lastFrameTimeRef.current = timestamp;

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    renderScene(ctx, canvas.width, canvas.height);

    if (isPlaying) {
      requestAnimationFrame(animate);
    }
  }, [renderScene, isPlaying]);

  // Window control handlers
  const handleMinimize = useCallback(() => {
    logMessage('info', 'Window minimized');
  }, [logMessage]);

  const handleMaximize = useCallback(() => {
    setIsMaximized(!isMaximized);
    logMessage('info', isMaximized ? 'Window restored' : 'Window maximized');
  }, [isMaximized, logMessage]);

  const handleClose = useCallback(() => {
    logMessage('info', 'Window closed');
  }, [logMessage]);

  // Animation frame effect
  useEffect(() => {
    if (isPlaying) {
      requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, isPlaying]);

  // Menu click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.menu-item') && !target.closest('.menu-dropdown')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-gray-900 text-white">
      <div className="relative flex-1">
        <div className="absolute inset-0 flex">
          <DockablePanel
            id="hierarchy"
            title="Scene Hierarchy"
            isVisible={visiblePanels.hierarchy}
            onClose={() => togglePanel('hierarchy')}
            defaultDock="left"
            defaultSize={{ width: 250, height: '100%' }}
            onMove={(pos) => handlePanelMove('hierarchy', pos)}
          >
            <SceneHierarchy
              sceneObjects={sceneObjects}
              selectedObject={selectedObject}
              onSelectObject={setSelectedObject}
            />
          </DockablePanel>

          <div className="flex-1">
            <DockablePanel
              id="viewport"
              title="Viewport"
              isVisible={visiblePanels.viewport}
              onClose={() => togglePanel('viewport')}
              defaultDock={null}
              defaultSize={{ width: '100%', height: '100%' }}
              onMove={(pos) => handlePanelMove('viewport', pos)}
            >
              <div className="w-full h-full bg-black">
                <Viewport/>
              </div>
            </DockablePanel>
          </div>

          <DockablePanel
            id="properties"
            title="Properties"
            isVisible={visiblePanels.properties}
            onClose={() => togglePanel('properties')}
            defaultDock="right"
            defaultSize={{ width: 300, height: '100%' }}
            onMove={(pos) => handlePanelMove('properties', pos)}
          >
            <PropertiesPanel
              selectedObject={selectedObject}
              onPropertyChange={handlePropertyChange}
            />
          </DockablePanel>
        </div>
      </div>
    </div>
  );
};

export default LevelEditor;