import React, { useState, useEffect, useCallback, useRef } from 'react';
import Titlebar from "../components/Titlebar";
import Menubar from '../components/Menubar';
import useCanvas from '../hooks/useCanvas';
import { initialSceneObjects, menus } from '../components/types';
import EditorTabs from './EditorTabs';

interface PanelVisibility {
  hierarchy: boolean;
  properties: boolean;
  console: boolean;
  viewport: boolean;
  [key: string]: boolean;
}

interface PanelPosition {
  x: number;
  y: number;
}

interface PanelPositions {
  hierarchy: PanelPosition;
  properties: PanelPosition;
  console: PanelPosition;
  viewport: PanelPosition;
  [key: string]: PanelPosition;
}

const GameEngineUI = () => {
  // Core state management
  const [sceneObjects, setSceneObjects] = useState(initialSceneObjects);
  const [selectedObject, setSelectedObject] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [consoleMessages, setConsoleMessages] = useState<{ type: string; message: string; timestamp: string; }[]>([]);
  const [fps, setFps] = useState(1000);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Panel visibility state
  const [visiblePanels, setVisiblePanels] = useState<PanelVisibility>({
    hierarchy: true,
    properties: true,
    console: true,
    viewport: true
  });

  // Panel positions state with safe initial values
  const [panelPositions, setPanelPositions] = useState<PanelPositions>({
    hierarchy: { x: 0, y: 40 },
    properties: { x: 0, y: 40 },
    console: { x: 0, y: 40 },
    viewport: { x: 250, y: 40 }
  });

  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { lastFrameTimeRef, animationFrameRef, renderScene } = useCanvas(sceneObjects, selectedObject);

  // Update panel positions after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPanelPositions({
        hierarchy: { x: 0, y: 40 },
        properties: { x: window.innerWidth - 300, y: 40 },
        console: { x: 0, y: window.innerHeight - 200 },
        viewport: { x: 250, y: 40 }
      });
    }
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setPanelPositions(prev => ({
        ...prev,
        properties: { x: window.innerWidth - 300, y: prev.properties.y },
        console: { x: prev.console.x, y: window.innerHeight - 200 }
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    switch(action) {
      case 'new':
        setSceneObjects(initialSceneObjects);
        setSelectedObject(null);
        logMessage('info', 'New project created');
        break;
      case 'save':
        logMessage('success', 'Project saved');
        break;
      case 'toggleHierarchy':
        setVisiblePanels(prev => ({ ...prev, hierarchy: !prev.hierarchy }));
        break;
      case 'toggleProperties':
        setVisiblePanels(prev => ({ ...prev, properties: !prev.properties }));
        break;
      case 'toggleConsole':
        setVisiblePanels(prev => ({ ...prev, console: !prev.console }));
        break;
      case 'toggleViewport':
        setVisiblePanels(prev => ({ ...prev, viewport: !prev.viewport }));
        break;
      default:
        logMessage('info', `Action: ${action}`);
    }
    setActiveMenu(null);
  }, [logMessage]);

  // Tool handlers
  const handleToolChange = useCallback((tool: string) => {
    setActiveTool(tool);
    logMessage('info', `Selected tool: ${tool}`);
  }, [logMessage]);

  // Property handlers
  const handlePropertyChange = useCallback((obj: any, property: string, axis: string, value: string) => {
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

    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    renderScene(ctx, canvas.width, canvas.height);
    animationFrameRef.current = requestAnimationFrame(animate) as unknown as null;
  }, [renderScene]);

  // Window control handlers
  const handleMinimize = () => logMessage('info', 'Window minimized');
  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    logMessage('info', isMaximized ? 'Window restored' : 'Window maximized');
  };
  const handleClose = () => logMessage('info', 'Window closed');

  // Effects
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  // Menu click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && !target.closest('.menu-item') && !target.closest('.menu-dropdown')) {
        setActiveMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleMenuAction('new');
            break;
          case 's':
            e.preventDefault();
            handleMenuAction('save');
            break;
          case 'b':
            e.preventDefault();
            togglePanel('hierarchy');
            break;
          case 'p':
            e.preventDefault();
            togglePanel('properties');
            break;
          case '`':
            e.preventDefault();
            togglePanel('console');
            break;
          default:
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'v':
            handleToolChange('select');
            break;
          case 'w':
            handleToolChange('move');
            break;
          case 'e':
            handleToolChange('rotate');
            break;
          case 'r':
            handleToolChange('scale');
            break;
          case ' ':
            e.preventDefault();
            setIsPlaying(prev => !prev);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMenuAction, handleToolChange, togglePanel]);

  return (
    <div className={`flex flex-col h-screen bg-black text-white ${isMaximized ? '' : 'rounded-lg'} overscroll-none`}>
      <Titlebar 
        isMaximized={isMaximized}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />
      <Menubar 
        menus={menus}
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
        onMenuAction={handleMenuAction}
      />
      
      {/* Replace the LevelEditor with EditorTabs */}
      <EditorTabs onTabChange={(type) => {
        // Handle tab type change here if needed
        console.log('Tab changed to:', type);
      }} />
    </div>
  );
};

export default GameEngineUI;