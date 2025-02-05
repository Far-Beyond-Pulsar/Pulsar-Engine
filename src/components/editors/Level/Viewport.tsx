import React, { useRef, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import {
  Camera, Hand, Move, ZoomIn, Play, Pause,
  Grid3X3, Eye, EyeOff, Bug, RotateCcw, Monitor
} from 'lucide-react';

const TOOLS = {
  SELECT: 'select',
  ORBIT: 'orbit',
  ZOOM: 'zoom',
  PAN: 'pan'
} as const;

const RENDER_MODES = {
  NATIVE: 'native',
  WEB: 'web'
} as const;

type ViewportMode = typeof TOOLS[keyof typeof TOOLS];
type RenderMode = typeof RENDER_MODES[keyof typeof RENDER_MODES];

declare global {
  interface Navigator {
    gpu: any;
  }
}

const Viewport = () => {
  const nativeCanvasRef = useRef<HTMLCanvasElement>(null);
  const webCanvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const [activeTool, setActiveTool] = useState<ViewportMode>(TOOLS.SELECT);
  const [renderMode, setRenderMode] = useState<RenderMode>(RENDER_MODES.NATIVE);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmos, setShowGizmos] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [webCanvasKey, setWebCanvasKey] = useState(0);

  // Native renderer
  useEffect(() => {
    if (renderMode !== RENDER_MODES.NATIVE || !nativeCanvasRef.current) return;
    
    const canvas = nativeCanvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });
    
    if (!ctx) return;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const pixels = new Uint8Array(imageData.data.buffer);
    pixels.fill(0);

    const animate = () => {
      if (!isPlaying || renderMode !== RENDER_MODES.NATIVE || canvas.style.display === 'none') return;
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, renderMode]);

  // WebGPU renderer
  useEffect(() => {
    if (renderMode !== RENDER_MODES.WEB || !webCanvasRef.current) {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'cleanup' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      return;
    }

    const canvas = webCanvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (!navigator.gpu) {
      console.error('WebGPU not supported');
      setRenderMode(RENDER_MODES.NATIVE);
      return;
    }

    const offscreenCanvas = canvas.transferControlToOffscreen();
    workerRef.current = new Worker(new URL('./webgpu.worker.ts', import.meta.url));
    workerRef.current.postMessage({ type: 'init', canvas: offscreenCanvas }, [offscreenCanvas]);

    let frameId: number;
    const animate = () => {
      if (isPlaying && renderMode === RENDER_MODES.WEB && canvas.style.display !== 'none') {
        workerRef.current?.postMessage({ type: 'render' });
      }
      frameId = requestAnimationFrame(animate);
    };

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'initialized') {
        frameId = requestAnimationFrame(animate);
      }
    };

    return () => {
      cancelAnimationFrame(frameId);
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'cleanup' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isPlaying, renderMode, webCanvasKey]);

  const handleRenderModeToggle = () => {
    if (renderMode === RENDER_MODES.NATIVE) {
      setWebCanvasKey(prev => prev + 1);
      setRenderMode(RENDER_MODES.WEB);
    } else {
      setRenderMode(RENDER_MODES.NATIVE);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={nativeCanvasRef}
        className="w-full h-full"
        style={{ display: renderMode === RENDER_MODES.NATIVE ? 'block' : 'none' }}
      />
      {renderMode === RENDER_MODES.WEB && (
        <canvas 
          key={webCanvasKey}
          ref={webCanvasRef}
          className="w-full h-full"
        />
      )}

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
          ${renderMode === RENDER_MODES.WEB ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={handleRenderModeToggle}
          title="Toggle Render Mode (M)"
        >
          <Monitor size={20} />
        </button>

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
            <div>Render Mode: {renderMode.toUpperCase()}</div>
            <div>WebGPU: {navigator.gpu ? 'Available' : 'Not Available'}</div>
            <div>Canvas: {renderMode === RENDER_MODES.NATIVE ? 
              `${nativeCanvasRef.current?.width || 0} x ${nativeCanvasRef.current?.height || 0}` :
              `${webCanvasRef.current?.width || 0} x ${webCanvasRef.current?.height || 0}`
            }</div>
            <div>WebCanvas Key: {webCanvasKey}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Viewport);