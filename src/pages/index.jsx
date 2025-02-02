import React, { useState, useEffect, useCallback, useRef } from 'react';
import Titlebar from  "../components/Titlebar";
import Menubar from   '../components/Menubar';
import useCanvas from '../hooks/useCanvas';
import { initialSceneObjects, menus } from '../components/types';
import EditorTabs from './EditorTabs';

const GameEngineUI = () => {
  // Core state management
  const [activeMenu, setActiveMenu] = useState(null);
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [sceneObjects, setSceneObjects] = useState(initialSceneObjects);
  const [selectedObject, setSelectedObject] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(1000);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Panel visibility state
  const [visiblePanels, setVisiblePanels] = useState({
    hierarchy: true,
    properties: true,
    console: true,
    viewport: true
  });

  // Panel positions state with safe initial values
  const [panelPositions, setPanelPositions] = useState({
    hierarchy: { x: 0, y: 40 },
    properties: { x: 0, y: 40 },
    console: { x: 0, y: 40 },
    viewport: { x: 250, y: 40 }
  });

  // Canvas references
  const canvasRef = useRef(null);
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
  const logMessage = useCallback((type, message) => {
    setConsoleMessages(prev => [
      ...prev, 
      { type, message, timestamp: new Date().toISOString() }
    ].slice(-100));
  }, []);

  // Menu handlers
  const handleMenuClick = useCallback((menuName) => {
    setActiveMenu(prev => prev === menuName ? null : menuName);
  }, []);

  const handleMenuAction = useCallback((action) => {
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
  const handleToolChange = useCallback((tool) => {
    setActiveTool(tool);
    logMessage('info', `Selected tool: ${tool}`);
  }, [logMessage]);

  // Property handlers
  const handlePropertyChange = useCallback((obj, property, axis, value) => {
    if (!obj?.id) return;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setSceneObjects(prev => prev.map(o => {
      if (o.id === obj.id) {
        return {
          ...o,
          [property]: { ...(o)[property], [axis]: numValue }
        };
      }
      return o;
    }));
  }, []);

  // Panel handlers
  const handlePanelMove = useCallback((panelId, position) => {
    setPanelPositions(prev => ({
      ...prev,
      [panelId]: position
    }));
  }, []);

  const togglePanel = useCallback((panelName) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
    logMessage('info', `${panelName} panel ${visiblePanels[panelName] ? 'hidden' : 'shown'}`);
  }, [visiblePanels, logMessage]);

  // Animation loop
  const animate = useCallback((timestamp) => {
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
    animationFrameRef.current = requestAnimationFrame(animate);
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
    const handleClickOutside = (e) => {
      const target = e.target;
      if (target && !target.closest('.menu-item') && !target.closest('.menu-dropdown')) {
        setActiveMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col h-screen bg-black text-white ${isMaximized ? '' : 'rounded-lg'} overscroll-none`}>
      <Titlebar 
        isMaximized={isMaximized}
        onMinimize= {handleMinimize}
        onMaximize= {handleMaximize}
        onClose=    {handleClose}
      />
      <Menubar 
        menus={menus}
        onMenuAction={handleMenuAction}
        onMenuClick= {handleMenuClick}
        activeMenu=  {activeMenu}
      />
      
      <EditorTabs onTabChange={(type) => {
        console.log('Tab changed to:', type);
      }} />
    </div>
  );
};

export default GameEngineUI;