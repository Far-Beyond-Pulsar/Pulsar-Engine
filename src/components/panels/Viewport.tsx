import React, { useEffect, useRef, useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { 
  Camera, 
  Hand, 
  Move, 
  ZoomIn,
  Play, 
  Pause,
  Grid3X3,
  Maximize2,
  Eye,
  EyeOff,
  Bug,
  RotateCcw
} from 'lucide-react';

// Types
interface ViewportProps {
  onObjectSelect?: (objectId: string | null) => void;
  onObjectHover?: (objectId: string | null) => void;
  onViewportReady?: () => void;
  onError?: (error: Error) => void;
  initialTool?: ViewportMode;
  className?: string;
  debugMode?: boolean;
}

interface ViewportStatus {
  width: number;
  height: number;
  buffer_size: number;
  device_pixel_ratio: number;
}

interface ViewportConfig {
  width: number;
  height: number;
  device_pixel_ratio: number;
}

interface ViewportEvent {
  event_type: string;
  tool?: ViewportMode;
  position?: { x: number; y: number };
  delta?: { x: number; y: number };
  button?: number;
}

type ViewportMode = 'select' | 'pan' | 'orbit' | 'zoom';

// Constants
const TOOLS = {
  SELECT: 'select' as ViewportMode,
  PAN: 'pan' as ViewportMode,
  ORBIT: 'orbit' as ViewportMode,
  ZOOM: 'zoom' as ViewportMode,
} as const;

// Buffer Manager
class BufferManager {
  private buffer: ArrayBuffer;
  private view: Uint8Array;
  private status: ViewportStatus;

  constructor(status: ViewportStatus) {
    if (!status || status.width <= 0 || status.height <= 0 || status.buffer_size <= 0) {
      throw new Error(`Invalid viewport status: ${JSON.stringify(status)}`);
    }

    console.log('Creating BufferManager:', status);
    
    this.status = status;
    this.buffer = new ArrayBuffer(status.buffer_size);
    this.view = new Uint8Array(this.buffer);
  }

  getView(): Uint8Array {
    return this.view;
  }

  getStatus(): ViewportStatus {
    return this.status;
  }

  async update(newData: Uint8Array, status: ViewportStatus): Promise<void> {
    if (status.buffer_size !== this.status.buffer_size) {
      console.log('Buffer size changed:', {
        old: this.status,
        new: status
      });
      
      this.buffer = new ArrayBuffer(status.buffer_size);
      this.view = new Uint8Array(this.buffer);
      this.status = status;
    }

    if (newData.length !== this.view.length) {
      throw new Error(
        `Buffer size mismatch: got ${newData.length}, expected ${this.view.length} ` +
        `(${this.status.width}x${this.status.height}x4)`
      );
    }

    this.view.set(newData);
  }
}

// Components
const ViewportStats: React.FC<{fps: number; objectCount: number; selectedId: string | null}> = ({
  fps,
  objectCount,
  selectedId
}) => (
  <div className="absolute bottom-3 left-3 bg-black/80 text-xs text-gray-300 px-3 py-2 rounded-lg border border-blue-900/20">
    <div>FPS: {fps}</div>
    <div>Objects: {objectCount}</div>
    {selectedId && <div>Selected: {selectedId}</div>}
  </div>
);

const DebugOverlay: React.FC<{
  isEnabled: boolean;
  status: ViewportStatus | null;
  fps: number;
  lastError?: string;
}> = ({
  isEnabled,
  status,
  fps,
  lastError
}) => {
  if (!isEnabled) return null;

  return (
    <div className="absolute top-3 right-3 bg-black/80 text-xs text-gray-300 p-3 rounded-lg border border-red-500/20">
      <h3 className="text-red-400 font-medium mb-2">Debug Info</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify({
          status,
          fps,
          lastError
        }, null, 2)}
      </pre>
    </div>
  );
};

interface ViewportControlsProps {
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
}

const ViewportControls: React.FC<ViewportControlsProps> = ({
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

// Main Viewport Component
const Viewport: React.FC<ViewportProps> = ({
  onObjectSelect,
  onObjectHover,
  onViewportReady,
  onError,
  initialTool = TOOLS.SELECT,
  className = '',
  debugMode = true
}) => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const bufferManagerRef = useRef<BufferManager | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTool, setActiveTool] = useState<ViewportMode>(initialTool);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmos, setShowGizmos] = useState(true);
  const [showDebug, setShowDebug] = useState(debugMode);
  const [fps, setFps] = useState(0);
  const [objectCount, setObjectCount] = useState(0);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [viewportStatus, setViewportStatus] = useState<ViewportStatus | null>(null);
  const [lastError, setLastError] = useState<string>();

  // Initialize viewport
  useEffect(() => {
    const initViewport = async () => {
      if (!canvasRef.current) return;

      try {
        console.log('Starting viewport initialization');
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get 2D context');
        
        contextRef.current = ctx;

        // Calculate dimensions
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const physicalWidth = Math.floor(rect.width * dpr);
        const physicalHeight = Math.floor(rect.height * dpr);

        // Set canvas size
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;

        console.log('Initializing viewport with dimensions:', {
          width: physicalWidth,
          height: physicalHeight,
          dpr
        });

        // Initialize viewport and get status
        const status = await invoke<ViewportStatus>('initialize_viewport', {
          config: {
            width: physicalWidth,
            height: physicalHeight,
            device_pixel_ratio: dpr
          }
        });

        console.log('Received viewport status:', status);

        // Create buffer manager with status
        bufferManagerRef.current = new BufferManager(status);
        setViewportStatus(status);

        // Start the render loop
        setIsInitialized(true);
        setIsPlaying(true);
        onViewportReady?.();

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize viewport');
        console.error('Viewport initialization failed:', error);
        setLastError(error.message);
        onError?.(error);
      }
    };

    initViewport();
  }, [onViewportReady, onError]);

  // Handle viewport resize
  useEffect(() => {
    if (!canvasRef.current || !contextRef.current || !bufferManagerRef.current) return;

    const handleResize = async () => {
      try {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const physicalWidth = Math.floor(rect.width * dpr);
        const physicalHeight = Math.floor(rect.height * dpr);

        console.log('Resizing viewport:', {
          width: physicalWidth,
          height: physicalHeight,
          dpr
        });

        // Update canvas size
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;

        // Resize viewport and get new status
        const status = await invoke<ViewportStatus>('resize_viewport', {
          config: {
            width: physicalWidth,
            height: physicalHeight,
            device_pixel_ratio: dpr
          }
        });

        setViewportStatus(status);

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to resize viewport');
        console.error('Viewport resize failed:', error);
        setLastError(error.message);
        onError?.(error);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(handleResize);
    });
    
    resizeObserver.observe(canvasRef.current);
    return () => resizeObserver.disconnect();
  }, [onError]);

  // Frame update loop
  useEffect(() => {
    if (!isInitialized || !isPlaying) {
      console.log('Frame loop not running:', { isInitialized, isPlaying });
      return;
    }

    const updateFrame = async () => {
      try {
        if (!canvasRef.current || !contextRef.current || !bufferManagerRef.current) {
          console.log('Missing required refs');
          return;
        }

        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        const bufferManager = bufferManagerRef.current;

        // Update scene state
        const status = await invoke<ViewportStatus>('update_scene_state', {
          deltaTime: 1/60
        });

        // Get frame data with status
        const [frameData, newStatus] = await invoke<[Uint8Array, ViewportStatus]>('get_frame_data');
        
        // Update buffer with new data and status
        await bufferManager.update(frameData, newStatus);

        // Update status if changed
        if (JSON.stringify(newStatus) !== JSON.stringify(viewportStatus)) {
          setViewportStatus(newStatus);
        }

        // Create and render image data
        const imageData = new ImageData(
          new Uint8ClampedArray(bufferManager.getView().buffer),
          newStatus.width,
          newStatus.height
        );
        
        ctx.putImageData(imageData, 0, 0);

        // Update FPS counter
        frameCountRef.current++;
        const now = performance.now();
        const elapsed = now - lastFrameTimeRef.current;
        
        if (elapsed >= 1000) {
          const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
          setFps(currentFps);
          frameCountRef.current = 0;
          lastFrameTimeRef.current = now;

          // Update scene stats
          const stats = await invoke<{ object_count: number }>('get_scene_stats');
          setObjectCount(stats.object_count);
        }

        animationFrameRef.current = requestAnimationFrame(updateFrame);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Frame update failed');
        console.error('Frame update failed:', error);
        setLastError(error.message);
        onError?.(error);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateFrame);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, isPlaying, onError, viewportStatus]);

  // Mouse event handlers
  const handleMouseDown = useCallback(async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    try {
      const result = await invoke<{ hit: boolean; object_id?: string }>('handle_viewport_event', {
        event: {
          event_type: 'mouseDown',
          tool: activeTool,
          position: { x, y },
          button: e.button
        }
      });

      if (result.hit && result.object_id && activeTool === TOOLS.SELECT) {
        setSelectedObject(result.object_id);
        onObjectSelect?.(result.object_id);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mouse event failed');
      console.error('Mouse down event failed:', error);
      setLastError(error.message);
      onError?.(error);
    }
  }, [activeTool, onObjectSelect, onError]);

  const handleMouseMove = useCallback(async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    try {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - lastMousePosRef.current.x;
        const deltaY = e.clientY - lastMousePosRef.current.y;
        
        await invoke('handle_viewport_event', {
          event: {
            event_type: 'drag',
            tool: activeTool,
            position: { x, y },
            delta: { x: deltaX, y: deltaY }
          }
        });
      } else {
        const result = await invoke<{ hit: boolean; object_id?: string }>('handle_viewport_event', {
          event: {
            event_type: 'mouseMove',
            tool: activeTool,
            position: { x, y }
          }
        });

        if (result.hit && result.object_id) {
          setHoveredObject(result.object_id);
          onObjectHover?.(result.object_id);
        } else if (hoveredObject) {
          setHoveredObject(null);
          onObjectHover?.(null);
        }
      }

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mouse event failed');
      console.error('Mouse move event failed:', error);
      setLastError(error.message);
      onError?.(error);
    }
  }, [activeTool, hoveredObject, onObjectHover, onError]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback(async (e: WheelEvent) => {
    e.preventDefault();
    
    try {
      await invoke('handle_viewport_event', {
        event: {
          event_type: 'zoom',
          delta: Math.sign(e.deltaY) * -0.1
        }
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Wheel event failed');
      console.error('Wheel event failed:', error);
      setLastError(error.message);
      onError?.(error);
    }
  }, [onError]);

  // Handle reset view
  const handleResetView = useCallback(async () => {
    try {
      const status = await invoke<ViewportStatus>('reset_viewport_camera');
      setViewportStatus(status);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Reset view failed');
      console.error('Reset view failed:', error);
      setLastError(error.message);
      onError?.(error);
    }
  }, [onError]);

  // Handle object deletion
  const handleDeleteObject = useCallback(async (objectId: string) => {
    try {
      const status = await invoke<ViewportStatus>('delete_object', { id: objectId });
      setSelectedObject(null);
      onObjectSelect?.(null);
      setViewportStatus(status);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Delete object failed');
      console.error('Delete object failed:', error);
      setLastError(error.message);
      onError?.(error);
    }
  }, [onObjectSelect, onError]);

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
        case 'delete':
        case 'backspace':
          if (selectedObject) {
            handleDeleteObject(selectedObject);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, handleResetView, handleDeleteObject]);

  // Mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  return (
    <div className={`relative flex-1 h-full bg-gray-900 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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

      <ViewportStats
        fps={fps}
        objectCount={objectCount}
        selectedId={selectedObject}
      />

      <DebugOverlay 
        isEnabled={showDebug}
        status={viewportStatus}
        fps={fps}
        lastError={lastError}
      />

      {selectedObject && (
        <div className="absolute right-3 top-3 bg-black/80 border border-blue-900/20 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Selected Object</h3>
          <div className="space-y-1 text-xs text-gray-400">
            <div>ID: {selectedObject}</div>
            <div className="mt-2">
              <button
                className="px-2 py-1 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40"
                onClick={() => handleDeleteObject(selectedObject)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Viewport;