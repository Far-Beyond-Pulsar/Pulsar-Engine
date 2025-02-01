import React, { useRef, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import {
  Camera, Hand, Move, ZoomIn, Play, Pause,
  Grid3X3, Eye, EyeOff, Bug, RotateCcw
} from 'lucide-react';

const TOOLS = {
  SELECT: 'select',
  ORBIT: 'orbit',
  ZOOM: 'zoom',
  PAN: 'pan'
} as const;

type ViewportMode = typeof TOOLS[keyof typeof TOOLS];

interface ViewportConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  device_pixel_ratio: number;
}

const Viewport = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<ViewportMode>(TOOLS.SELECT);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmos, setShowGizmos] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateNativeViewport = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const config: ViewportConfig = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        device_pixel_ratio: window.devicePixelRatio || 1
      };

      invoke('update_native_viewport', { config })
        .catch(console.error);
    };

    // Initialize the viewport
    invoke('initialize_viewport', {
      config: {
        x: Math.round(containerRef.current.getBoundingClientRect().x),
        y: Math.round(containerRef.current.getBoundingClientRect().y),
        width: Math.round(containerRef.current.getBoundingClientRect().width),
        height: Math.round(containerRef.current.getBoundingClientRect().height),
        device_pixel_ratio: window.devicePixelRatio || 1
      }
    }).catch(console.error);

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateNativeViewport);
    resizeObserver.observe(containerRef.current);

    // Handle window resize and scroll
    window.addEventListener('resize', updateNativeViewport);
    window.addEventListener('scroll', updateNativeViewport);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateNativeViewport);
      window.removeEventListener('scroll', updateNativeViewport);
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      switch (event.key.toLowerCase()) {
        case 'q':
          setActiveTool(TOOLS.SELECT);
          break;
        case 'w':
          setActiveTool(TOOLS.PAN);
          break;
        case 'e':
          setActiveTool(TOOLS.ORBIT);
          break;
        case 'r':
          setActiveTool(TOOLS.ZOOM);
          break;
        case ' ':
          event.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'g':
          setShowGrid(prev => !prev);
          break;
        case 'v':
          setShowGizmos(prev => !prev);
          break;
        case 'd':
          setShowDebug(prev => !prev);
          break;
        case 'f':
          invoke('reset_viewport_camera').catch(console.error);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-transparent">
      {/* Controls overlay */}
      <div className="absolute top-3 left-3 flex gap-1 bg-black/80 border border-blue-900/20 rounded-lg p-1">
        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${activeTool === TOOLS.SELECT ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => setActiveTool(TOOLS.SELECT)}
          title="Select (Q)"
        >
          <Camera size={20} />
        </button>

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${activeTool === TOOLS.PAN ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => setActiveTool(TOOLS.PAN)}
          title="Pan (W)"
        >
          <Hand size={20} />
        </button>

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${activeTool === TOOLS.ORBIT ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => setActiveTool(TOOLS.ORBIT)}
          title="Orbit (E)"
        >
          <Move size={20} />
        </button>

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${activeTool === TOOLS.ZOOM ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => setActiveTool(TOOLS.ZOOM)}
          title="Zoom (R)"
        >
          <ZoomIn size={20} />
        </button>

        <div className="w-px h-6 bg-blue-900/20 mx-1" />

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${isPlaying ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => setIsPlaying(prev => !prev)}
          title="Play/Pause (Space)"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${showGrid ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => setShowGrid(prev => !prev)}
          title="Toggle Grid (G)"
        >
          <Grid3X3 size={20} />
        </button>

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${showGizmos ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => setShowGizmos(prev => !prev)}
          title="Toggle Gizmos (V)"
        >
          {showGizmos ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>

        <div className="w-px h-6 bg-blue-900/20 mx-1" />

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${showDebug ? 'text-red-500 bg-red-900/10' : 'text-gray-400'}`}
          onClick={() => setShowDebug(prev => !prev)}
          title="Toggle Debug Overlay (D)"
        >
          <Bug size={20} />
        </button>

        <button
          className="p-2 rounded hover:bg-blue-900/10 hover:text-blue-500 text-gray-400"
          onClick={() => invoke('reset_viewport_camera')}
          title="Reset View (F)"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Debug overlay */}
      {showDebug && (
        <div className="absolute top-3 right-3 bg-black/80 text-xs text-gray-300 p-3 rounded-lg border border-red-500/20">
          <h3 className="text-red-400 font-medium mb-2">Debug Info</h3>
          <div className="space-y-1">
            <div>Tool: {activeTool}</div>
            <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
            <div>Grid: {showGrid ? 'Visible' : 'Hidden'}</div>
            <div>Gizmos: {showGizmos ? 'Visible' : 'Hidden'}</div>
            <div>Position: {containerRef.current?.getBoundingClientRect().x.toFixed(0)}, {containerRef.current?.getBoundingClientRect().y.toFixed(0)}</div>
            <div>Size: {containerRef.current?.getBoundingClientRect().width.toFixed(0)} x {containerRef.current?.getBoundingClientRect().height.toFixed(0)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Viewport);