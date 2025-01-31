import React, { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import {
  Camera,
  Hand,
  Move,
  ZoomIn,
  Play,
  Pause,
  Grid3X3,
  Eye,
  EyeOff,
  Bug,
  RotateCcw
} from 'lucide-react';

// Types and Constants
type ViewportMode = 'select' | 'pan' | 'orbit' | 'zoom';

const TOOLS = {
  SELECT: 'select' as ViewportMode,
  PAN: 'pan' as ViewportMode,
  ORBIT: 'orbit' as ViewportMode,
  ZOOM: 'zoom' as ViewportMode,
} as const;

// Debug Overlay Component
const DebugOverlay: React.FC<{
  isEnabled: boolean;
  renderRate: number;
  drawRate: number;
  viewportStatus: any;
  lastError?: string;
}> = ({
  isEnabled,
  renderRate,
  drawRate,
  viewportStatus,
  lastError
}) => {
    if (!isEnabled) return null;

    return (
      <div className="absolute top-3 right-3 bg-black/80 text-xs text-gray-300 p-3 rounded-lg border border-red-500/20">
        <h3 className="text-red-400 font-medium mb-2">Debug Info</h3>
        <div className="space-y-1">
          <div>Render Rate: {renderRate.toFixed(2)} fps</div>
          <div>Draw Rate: {drawRate.toFixed(2)} fps</div>
          <pre className="whitespace-pre-wrap mt-2">
            {JSON.stringify({
              viewportStatus,
              lastError
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

// Viewport Controls Component
const ViewportControls: React.FC<{
  activeTool: ViewportMode;
  isPlaying: boolean;
  showGrid: boolean;
  showGizmos: boolean;
  showDebug: boolean;
  onToolChange: (tool: ViewportMode) => void;
  onPlayToggle: () => void;
  onToggleGrid: () => void;
  onToggleGizmos: () => void;
  onToggleDebug: () => void;
  onResetView: () => void;
}> = ({
  activeTool,
  isPlaying,
  showGrid,
  showGizmos,
  showDebug,
  onToolChange,
  onPlayToggle,
  onToggleGrid,
  onToggleGizmos,
  onToggleDebug,
  onResetView,
}) => (
    <div className="absolute top-3 left-3 flex gap-1 bg-black/80 border border-blue-900/20 rounded-lg p-1">
      <button
        className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
        ${activeTool === TOOLS.SELECT ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
        onClick={() => onToolChange(TOOLS.SELECT)}
        title="Select (Q)"
      >
        <Camera size={20} />
      </button>

      <button
        className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
        ${activeTool === TOOLS.PAN ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
        onClick={() => onToolChange(TOOLS.PAN)}
        title="Pan (W)"
      >
        <Hand size={20} />
      </button>

      <button
        className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
        ${activeTool === TOOLS.ORBIT ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
        onClick={() => onToolChange(TOOLS.ORBIT)}
        title="Orbit (E)"
      >
        <Move size={20} />
      </button>

      <button
        className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
        ${activeTool === TOOLS.ZOOM ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
        onClick={() => onToolChange(TOOLS.ZOOM)}
        title="Zoom (R)"
      >
        <ZoomIn size={20} />
      </button>

      <div className="w-px h-6 bg-blue-900/20 mx-1" />

      <button
        className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
        ${isPlaying ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
        onClick={onPlayToggle}
        title="Play/Pause (Space)"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <button
        className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
        ${showGrid ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
        onClick={onToggleGrid}
        title="Toggle Grid (G)"
      >
        <Grid3X3 size={20} />
      </button>

      <button
        className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
        ${showGizmos ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
        onClick={onToggleGizmos}
        title="Toggle Gizmos (V)"
      >
        {showGizmos ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>

      <div className="w-px h-6 bg-blue-900/20 mx-1" />

      <button
        className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
        ${showDebug ? 'text-red-500 bg-red-900/10' : 'text-gray-400'}`}
        onClick={onToggleDebug}
        title="Toggle Debug Overlay (D)"
      >
        <Bug size={20} />
      </button>

      <button
        className="p-2 rounded hover:bg-blue-900/10 hover:text-blue-500 text-gray-400"
        onClick={onResetView}
        title="Reset View (F)"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );

// Setup native buffer conversion
const setupNativeBufferConversion = () => {
  if (typeof window !== 'undefined') {
    window.nativeBufferToArray = (ptr: number, size: number) => {
      const buffer = new Uint8Array(size);
      for (let i = 0; i < buffer.length; i += 4) {
        // Create a color gradient pattern
        buffer[i] = 50;     // Red
        buffer[i + 1] = 50; // Green
        buffer[i + 2] = 50; // Blue
        buffer[i + 3] = 255; // Alpha
      }
      return buffer;
    };
  }
};

// Main Viewport Component
const Viewport: React.FC = () => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sharedBufferRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

  // Performance tracking
  const renderFrameCountRef = useRef(0);
  const drawFrameCountRef = useRef(0);
  const renderLastFrameTimeRef = useRef(performance.now());
  const drawLastFrameTimeRef = useRef(performance.now());

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTool, setActiveTool] = useState<ViewportMode>(TOOLS.SELECT);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmos, setShowGizmos] = useState(true);
  const [showDebug, setShowDebug] = useState(true);
  const [renderRate, setRenderRate] = useState(0);
  const [drawRate, setDrawRate] = useState(0);
  const [viewportStatus, setViewportStatus] = useState<any>(null);
  const [lastError, setLastError] = useState<string>();

  // Setup native buffer conversion on component mount
  useEffect(() => {
    setupNativeBufferConversion();
  }, []);

  // Initialize viewport
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const initSharedMemory = async () => {
      if (!canvasRef.current) return;

      try {
        // Calculate dimensions
        const dpr = window.devicePixelRatio || 1;
        const rect = canvasRef.current.getBoundingClientRect();
        const physicalWidth = Math.floor(rect.width * dpr);
        const physicalHeight = Math.floor(rect.height * dpr);

        // Set canvas size
        canvasRef.current.width = physicalWidth;
        canvasRef.current.height = physicalHeight;

        // Listen for shared memory ready event
        unlisten = await listen('shared-memory-ready', (event) => {
          sharedBufferRef.current = event.payload as number;
          setIsInitialized(true);
        });

        // Initialize viewport and setup shared memory
        const status = await invoke('initialize_viewport', {
          config: {
            width: physicalWidth,
            height: physicalHeight,
            device_pixel_ratio: dpr
          }
        });
        setViewportStatus(status);

        await invoke('setup_shared_memory', {
          config: {
            width: physicalWidth,
            height: physicalHeight,
            device_pixel_ratio: dpr
          }
        });

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Viewport initialization failed:', errorMsg);
        setLastError(errorMsg);
      }
    };

    initSharedMemory();

    return () => {
      if (unlisten) unlisten();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Render loop
  useEffect(() => {
    if (!isInitialized || !canvasRef.current || !sharedBufferRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Frame rate control variables
    let lastFrameTime = performance.now();
    const MAX_FPS = 1000;
    const FRAME_MIN_TIME = 1000 / MAX_FPS;

    const renderFrame = async () => {
      const now = performance.now();
      const elapsed = now - lastFrameTime;

      if (elapsed >= FRAME_MIN_TIME) {
        try {
          // Verify nativeBufferToArray exists
          if (typeof window.nativeBufferToArray !== 'function') {
            throw new Error('window.nativeBufferToArray is not a function');
          }

          // Render Rate Tracking
          renderFrameCountRef.current++;
          const renderNow = performance.now();
          const renderElapsed = renderNow - renderLastFrameTimeRef.current;

          if (renderElapsed >= 1000) {
            const currentRenderRate = Math.round((renderFrameCountRef.current * 1000) / renderElapsed);
            setRenderRate(currentRenderRate);
            renderFrameCountRef.current = 0;
            renderLastFrameTimeRef.current = renderNow;
          }

          // Update viewport state
          await invoke('update_viewport');

          // Direct rendering using shared memory pointer
          const sharedPtr = sharedBufferRef.current;

          // Create ImageData directly from shared memory
          const imageData = new ImageData(
            new Uint8ClampedArray(
              window.nativeBufferToArray(sharedPtr, canvas.width * canvas.height * 4)
            ),
            canvas.width,
            canvas.height
          );

          // Draw Rate Tracking
          drawFrameCountRef.current++;
          const drawNow = performance.now();
          const drawElapsed = drawNow - drawLastFrameTimeRef.current;

          if (drawElapsed >= 1000) {
            const currentDrawRate = Math.round((drawFrameCountRef.current * 1000) / drawElapsed);
            setDrawRate(currentDrawRate);
            drawFrameCountRef.current = 0;
            drawLastFrameTimeRef.current = drawNow;
          }

          // Render to canvas
          ctx.putImageData(imageData, 0, 0);

          // Update last frame time, accounting for potential frame time overshooting
          lastFrameTime = now - (elapsed % FRAME_MIN_TIME);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error('Frame rendering failed:', errorMsg);
          setLastError(errorMsg);
        }
      }

      // Schedule next frame with timeout to maintain desired frame rate
      setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
      }, Math.max(0, FRAME_MIN_TIME - elapsed));
    };

    // Start render loop
    animationFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'q': setActiveTool(TOOLS.SELECT); break;
        case 'w': setActiveTool(TOOLS.PAN); break;
        case 'e': setActiveTool(TOOLS.ORBIT); break;
        case 'r': setActiveTool(TOOLS.ZOOM); break;
        case 'g': setShowGrid(prev => !prev); break;
        case 'v': setShowGizmos(prev => !prev); break;
        case 'd': setShowDebug(prev => !prev); break;
        case 'f': handleResetView(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handler for resetting view
  const handleResetView = useCallback(async () => {
    try {
      await invoke('reset_viewport_camera');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Reset view failed:', errorMsg);
      setLastError(errorMsg);
    }
  }, []);

  return (
    <div className="relative flex-1 h-full bg-gray-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />

      <ViewportControls
        activeTool={activeTool}
        isPlaying={isPlaying}
        showGrid={showGrid}
        showGizmos={showGizmos}
        showDebug={showDebug}
        onToolChange={setActiveTool}
        onPlayToggle={() => setIsPlaying(prev => !prev)}
        onToggleGrid={() => setShowGrid(prev => !prev)}
        onToggleGizmos={() => setShowGizmos(prev => !prev)}
        onToggleDebug={() => setShowDebug(prev => !prev)}
        onResetView={handleResetView}
      />

      <DebugOverlay
        isEnabled={showDebug}
        renderRate={renderRate}
        drawRate={drawRate}
        viewportStatus={viewportStatus}
        lastError={lastError}
      />

      {lastError && (
        <div className="absolute top-0 left-0 bg-red-500 text-white p-2">
          Error: {lastError}
        </div>
      )}
    </div>
  );
};

export default Viewport;

// Extend window interface to include the custom method
declare global {
  interface Window {
    nativeBufferToArray?: (ptr: number, size: number) => Uint8Array;
  }
}