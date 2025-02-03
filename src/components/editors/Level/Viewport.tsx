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

const Viewport = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<ViewportMode>(TOOLS.SELECT);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmos, setShowGizmos] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  // Set up canvas with zeroed pixel data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });
    
    if (!ctx) return;

    // Create zeroed pixel data
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const pixels = new Uint8Array(imageData.data.buffer);
    pixels.fill(0);  // Zero out all pixels

    // Animation loop that keeps putting zeroed data
    const animate = () => {
      if (!isPlaying) return;
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />

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
          onClick={() => setIsPlaying(!isPlaying)}
          title="Play/Pause (Space)"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${showGrid ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid (G)"
        >
          <Grid3X3 size={20} />
        </button>

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${showGizmos ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => setShowGizmos(!showGizmos)}
          title="Toggle Gizmos (V)"
        >
          {showGizmos ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>

        <div className="w-px h-6 bg-blue-900/20 mx-1" />

        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
          ${showDebug ? 'text-red-500 bg-red-900/10' : 'text-gray-400'}`}
          onClick={() => setShowDebug(!showDebug)}
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

      {showDebug && (
        <div className="absolute top-3 right-3 bg-black/80 text-xs text-gray-300 p-3 rounded-lg border border-red-500/20">
          <h3 className="text-red-400 font-medium mb-2">Debug Info</h3>
          <div className="space-y-1">
            <div>Canvas active with zeroed pixel data</div>
            <div>Size: {canvasRef.current?.width || 0} x {canvasRef.current?.height || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Viewport);