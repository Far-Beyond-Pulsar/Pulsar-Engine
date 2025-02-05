"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Titlebar from  "../components/Titlebar";
import Menubar from   '../components/Menubar';
import EditorTabs from './EditorTabs';
import StatusBar from './StatusBar';
import useCanvas from '../hooks/useCanvas';
import { initialSceneObjects, menus } from '../components/types';

const GameEngineUI = () => {
  const [engineState, setEngineState] = useState({
    tabs: [
      { id: 1, name: 'Main Scene' },
      { id: 2, name: 'Physics Debug' }
    ],
    showNewTabMenu: false,
    fps: 3000,
    memoryUsage: 702,
    
    // Rust Analyzer state
    rustAnalyzer: {
      status: 'running', // 'running' | 'error' | 'warning'
      diagnostics: 2,
      inlayHints: true,
      version: '0.4.0',
      details: {
        parseErrors: 0,
        typeErrors: 1,
        warnings: 1
      }
    },
    
    // Game engine performance metrics
    engineMetrics: {
      drawCalls: 1250,
      entityCount: 3420,
      physicsObjects: 145,
      cpuUsage: 2,
      gpuUsage: 3,
      frameTime: 3.1,
      gcStats: {
        collections: 12,
        pauseTime: 0.5
      }
    },
    
    // Git integration state
    gitInfo: {
      branch: 'feature/physics-update',
      modified: true,
      lastCommit: 'a1b2c3d4e5f6g7h8i9j0',
      uncommittedFiles: [
        'src/physics/collision.rs',
        'src/engine/world.rs',
        'assets/config/physics.toml'
      ]
    },
    
    // Detailed memory statistics
    memoryDetails: {
      total: 1024,
      used: 512,
      peak: 768,
      allocations: 15460
    }
  });

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
    properties: { x: 0, y: 40 },
    hierarchy:  { x: 0, y: 40 },
    viewport:   { x: 250, y: 40 },
    console:    { x: 0, y: 40 },
  });

  // Canvas references
  const canvasRef = useRef(null);
  const { lastFrameTimeRef, animationFrameRef, renderScene } = useCanvas(sceneObjects, selectedObject);

  // Update panel positions after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPanelPositions({
        properties: { x: window.innerWidth - 300, y: 40 },
        console:    { x: 0, y: window.innerHeight - 200 },
        viewport:   { x: 250, y: 40 },
        hierarchy:  { x: 0, y: 40 }
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

    useEffect(() => {
    let frameId;
    
    const updateMetrics = () => {
      setEngineState(prevState => ({
        ...prevState,
        fps: Math.floor(Math.random() * 10 + 3000), // Simulate FPS fluctuation
        engineMetrics: {
          ...prevState.engineMetrics,
          drawCalls: Math.floor(Math.random() * 100 + 1200),
          cpuUsage: Math.floor(Math.random() * 10 + 40),
          gpuUsage: Math.floor(Math.random() * 10 + 70),
          frameTime: 1000 / (Math.random() * 10 + 55)
        },
        memoryUsage: Math.floor(Math.random() * 100 + 450)
      }));
      
      frameId = requestAnimationFrame(updateMetrics);
    };
    
    frameId = requestAnimationFrame(updateMetrics);
    return () => cancelAnimationFrame(frameId);
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
      <StatusBar
        tabs={engineState.tabs}
        showNewTabMenu={engineState.showNewTabMenu}
        fps={engineState.fps}
        memoryUsage={engineState.memoryUsage}
        rustAnalyzer={engineState.rustAnalyzer}
        engineMetrics={engineState.engineMetrics}
        gitInfo={engineState.gitInfo}
        memoryDetails={engineState.memoryDetails}
      />    </div>
  );
};

export default GameEngineUI;