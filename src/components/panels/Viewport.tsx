import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

declare global {
  interface Window {
    pulsar_shared_memory: ArrayBuffer;
    nativeBufferToArray: (ptr: number, targetBuffer: Uint8Array) => Uint8Array;
  }
}
import {
  Camera, Hand, Move, ZoomIn, Play, Pause,
  Grid3X3, Eye, EyeOff, Bug, RotateCcw
} from 'lucide-react';

// Types
type ViewportMode = 'select' | 'pan' | 'orbit' | 'zoom';

interface ViewportState {
  isInitialized: boolean;
  activeTool: ViewportMode;
  isPlaying: boolean;
  showGrid: boolean;
  showGizmos: boolean;
  showDebug: boolean;
}

interface PerformanceMetrics {
  renderRate: number;
  drawRate: number;
}

interface ViewportConfig {
  width: number;
  height: number;
  device_pixel_ratio: number;
}

interface ViewportControlsProps extends ViewportState {
  onToolChange: (tool: ViewportMode) => void;
  onPlayToggle: () => void;
  onToggleGrid: () => void;
  onToggleGizmos: () => void;
  onToggleDebug: () => void;
  onResetView: () => void;
}

interface DebugOverlayProps {
  viewportStatus: any;
  metrics: PerformanceMetrics;
  lastError?: string;
  isEnabled: boolean;
}

// Constants
const TOOLS = {
  SELECT: 'select' as ViewportMode,
  ORBIT: 'orbit' as ViewportMode,
  ZOOM: 'zoom' as ViewportMode,
  PAN: 'pan' as ViewportMode,
} as const;

const INITIAL_VIEWPORT_STATE: ViewportState = {
  isInitialized: false,
  activeTool: TOOLS.SELECT,
  isPlaying: true,
  showGrid: true,
  showGizmos: true,
  showDebug: false,
};

const INITIAL_METRICS: PerformanceMetrics = {
  renderRate: 0,
  drawRate: 0,
};

const TARGET_FPS = 120;
const FRAME_TIME = 1000 / TARGET_FPS;
const METRICS_UPDATE_INTERVAL = 1000;

// Memoized ViewportControls component
const ViewportControls = React.memo<ViewportControlsProps>(({
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
));

ViewportControls.displayName = 'ViewportControls';

// Memoized DebugOverlay component
const DebugOverlay = React.memo<DebugOverlayProps>(({
  viewportStatus,
  metrics,
  lastError,
  isEnabled,
}) => {
  if (!isEnabled) return null;

  return (
    <div className="absolute top-3 right-3 bg-black/80 text-xs text-gray-300 p-3 rounded-lg border border-red-500/20">
      <h3 className="text-red-400 font-medium mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Render Rate: {metrics.renderRate.toFixed(1)} fps</div>
        <div>Draw Rate: {metrics.drawRate.toFixed(1)} fps</div>
        {lastError && (
          <div className="text-red-400 mt-2">
            Error: {lastError}
          </div>
        )}
        <pre className="whitespace-pre-wrap mt-2 text-gray-400">
          {JSON.stringify(viewportStatus, null, 2)}
        </pre>
      </div>
    </div>
  );
});

DebugOverlay.displayName = 'DebugOverlay';

// Main Viewport component
const Viewport: React.FC = () => {
  // State
  const [viewportState, setViewportState] = useState<ViewportState>(INITIAL_VIEWPORT_STATE);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(INITIAL_METRICS);
  const [viewportStatus, setViewportStatus] = useState<any>(null);
  const [lastError, setLastError] = useState<string>();

  // Refs for canvas and rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sharedBufferRef = useRef<number | null>(null);
  const frameRequestRef = useRef<number>();
  const metricsTimeoutRef = useRef<NodeJS.Timeout>();

  // Refs for performance tracking
  const frameDataRef = useRef({
    renderCount: 0,
    drawCount: 0,
    lastMetricsUpdate: performance.now(),
    lastFrameTime: performance.now(),
  });

  // Refs for buffer management
  const imageDataRef = useRef<ImageData | null>(null);
  const bufferRef = useRef<Uint8Array | null>(null);
  const canvasConfigRef = useRef<ViewportConfig | null>(null);

  // Initialize canvas context with optimized settings
  const initContext = useCallback(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false,
    });
    
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    
    ctxRef.current = ctx;
  }, []);

  // Setup buffer and ImageData with proper dimensions
  const setupBufferAndImageData = useCallback((config: ViewportConfig) => {
    const bufferSize = config.width * config.height * 4;
    bufferRef.current = new Uint8Array(bufferSize);
    imageDataRef.current = new ImageData(
      new Uint8ClampedArray(bufferSize),
      config.width,
      config.height
    );
    canvasConfigRef.current = config;
  }, []);

  // Handle viewport resize
  const handleResize = useCallback(async () => {
    if (!canvasRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width * dpr);
    const height = Math.floor(rect.height * dpr);

    // Skip if dimensions haven't changed
    if (
      canvasConfigRef.current?.width === width &&
      canvasConfigRef.current?.height === height &&
      canvasConfigRef.current?.device_pixel_ratio === dpr
    ) {
      return;
    }

    const config: ViewportConfig = { width, height, device_pixel_ratio: dpr };

    try {
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      initContext();
      setupBufferAndImageData(config);

      await invoke('resize_viewport', { config });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Viewport resize failed:', errorMsg);
      setLastError(errorMsg);
    }
  }, [initContext, setupBufferAndImageData]);

  // Define native buffer conversion function
  useEffect(() => {
    // Define the buffer conversion function on window
    window.nativeBufferToArray = (ptr: number, targetBuffer: Uint8Array) => {
      // Create a view into the shared memory using the ptr
      const sharedView = new Uint8Array(window.pulsar_shared_memory, ptr, targetBuffer.length);
      
      return sharedView;
    };
  }, []);

  // Initialize viewport
  useEffect(() => {
    const initViewport = async () => {
      if (!canvasRef.current) return;

      try {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvasRef.current.getBoundingClientRect();
        const config: ViewportConfig = {
          width: Math.floor(rect.width * dpr),
          height: Math.floor(rect.height * dpr),
          device_pixel_ratio: dpr,
        };

        canvasRef.current.width = config.width;
        canvasRef.current.height = config.height;

        initContext();
        setupBufferAndImageData(config);

        const status = await invoke('initialize_viewport', { config });
        const bufferPtr = await invoke('setup_shared_memory', { config });

        setViewportStatus(status);
        sharedBufferRef.current = bufferPtr;
        
        await invoke('start_frame_updates');
        
        setViewportState(prev => ({ ...prev, isInitialized: true }));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Viewport initialization failed:', errorMsg);
        setLastError(errorMsg);
      }
    };

    initViewport();

    // Setup resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
      handleResize();
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
      if (metricsTimeoutRef.current) {
        clearTimeout(metricsTimeoutRef.current);
      }
    };
  }, [initContext, setupBufferAndImageData, handleResize]);

  // Frame update listener
  useEffect(() => {
    let unlisten: UnlistenFn;
    
    const setupFrameListener = async () => {
      unlisten = await listen('shared-memory-update', (event) => {
        if (!viewportState.isPlaying) return;
        
        const bufferPtr = event.payload as number;
        if (sharedBufferRef.current !== bufferPtr) {
          sharedBufferRef.current = bufferPtr;
        }
        
        frameDataRef.current.renderCount++;
      });
    };

    setupFrameListener();
    return () => {
      unlisten?.();
    };
  }, [viewportState.isPlaying]);

  // Frame rendering
  useEffect(() => {
    if (
      !viewportState.isInitialized ||
      !ctxRef.current ||
      !sharedBufferRef.current ||
      !viewportState.isPlaying
    ) return;

    const renderFrame = () => {
      const now = performance.now();
      const delta = now - frameDataRef.current.lastFrameTime;

      // Skip frame if we're running too fast
      if (delta < FRAME_TIME) {
        frameRequestRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      try {
        if (bufferRef.current && imageDataRef.current) {
          // Copy from shared memory to local buffer
          if (typeof window.nativeBufferToArray === 'function') {
            window.nativeBufferToArray(
              sharedBufferRef.current!,
              bufferRef.current
            );
          } else {
            throw new Error('Buffer conversion function not initialized');
          }
          
          // Update ImageData
          imageDataRef.current.data.set(bufferRef.current);
          
          // Render to canvas
          ctxRef.current.putImageData(imageDataRef.current, 0, 0);
          
          frameDataRef.current.drawCount++;
          frameDataRef.current.lastFrameTime = now;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Rendering error:', errorMsg);
        setLastError(errorMsg);
      }

      frameRequestRef.current = requestAnimationFrame(renderFrame);
    };

    frameRequestRef.current = requestAnimationFrame(renderFrame);

    // Update metrics every second
    const updateMetrics = () => {
      const now = performance.now();
      const elapsed = now - frameDataRef.current.lastMetricsUpdate;
      
      if (elapsed >= METRICS_UPDATE_INTERVAL) {
        setMetrics({
          renderRate: (frameDataRef.current.renderCount * 1000) / elapsed,
          drawRate: (frameDataRef.current.drawCount * 1000) / elapsed,
        });
        
        frameDataRef.current = {
          renderCount: 0,
          drawCount: 0,
          lastMetricsUpdate: now,
          lastFrameTime: now,
        };
      }
      
      metricsTimeoutRef.current = setTimeout(updateMetrics, METRICS_UPDATE_INTERVAL);
    };

    metricsTimeoutRef.current = setTimeout(updateMetrics, METRICS_UPDATE_INTERVAL);

    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
      if (metricsTimeoutRef.current) {
        clearTimeout(metricsTimeoutRef.current);
      }
    };
  }, [viewportState.isInitialized, viewportState.isPlaying]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      switch (event.key.toLowerCase()) {
        case 'q':
          setViewportState(prev => ({ ...prev, activeTool: TOOLS.SELECT }));
          break;
        case 'w':
          setViewportState(prev => ({ ...prev, activeTool: TOOLS.PAN }));
          break;
        case 'e':
          setViewportState(prev => ({ ...prev, activeTool: TOOLS.ORBIT }));
          break;
        case 'r':
          setViewportState(prev => ({ ...prev, activeTool: TOOLS.ZOOM }));
          break;
        case ' ':
          event.preventDefault();
          setViewportState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
          break;
        case 'g':
          setViewportState(prev => ({ ...prev, showGrid: !prev.showGrid }));
          break;
        case 'v':
          setViewportState(prev => ({ ...prev, showGizmos: !prev.showGizmos }));
          break;
        case 'd':
          setViewportState(prev => ({ ...prev, showDebug: !prev.showDebug }));
          break;
        case 'f':
          invoke('reset_viewport_camera').catch(error => {
            console.error('Failed to reset view:', error);
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Memoized handlers
  const handlers = useMemo(() => ({
    onToolChange: (tool: ViewportMode) => 
      setViewportState(prev => ({ ...prev, activeTool: tool })),
    onPlayToggle: () => 
      setViewportState(prev => ({ ...prev, isPlaying: !prev.isPlaying })),
    onToggleGrid: () => 
      setViewportState(prev => ({ ...prev, showGrid: !prev.showGrid })),
    onToggleGizmos: () => 
      setViewportState(prev => ({ ...prev, showGizmos: !prev.showGizmos })),
    onToggleDebug: () => 
      setViewportState(prev => ({ ...prev, showDebug: !prev.showDebug })),
    onResetView: () => 
      invoke('reset_viewport_camera').catch(error => {
        console.error('Failed to reset view:', error);
      }),
  }), []);

  // Error boundary fallback
  if (lastError && !viewportState.isInitialized) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-red-400">
        <div className="max-w-md p-6 bg-black/80 rounded-lg border border-red-500/20">
          <h3 className="text-lg font-medium mb-2">Viewport Initialization Failed</h3>
          <p className="text-sm text-gray-300">{lastError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full bg-gray-800"
      />
      <ViewportControls
        {...viewportState}
        {...handlers}
      />
      <DebugOverlay
        viewportStatus={viewportStatus}
        metrics={metrics}
        lastError={lastError}
        isEnabled={viewportState.showDebug}
      />
    </div>
  );
};

export default React.memo(Viewport);