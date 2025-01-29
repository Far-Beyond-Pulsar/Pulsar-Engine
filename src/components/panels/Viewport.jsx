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
  EyeOff
} from 'lucide-react';

// Constants for viewport modes and tools
const TOOLS = {
  SELECT: 'select',
  PAN: 'pan',
  ORBIT: 'orbit',
  ZOOM: 'zoom'
};

class BufferManager {
  constructor(size) {
    this.size = size;
    this.isSharedBufferAvailable = typeof SharedArrayBuffer !== 'undefined';
    
    if (this.isSharedBufferAvailable) {
      try {
        this.buffer = new SharedArrayBuffer(size);
        this.view = new Uint8Array(this.buffer);
      } catch (e) {
        console.warn('SharedArrayBuffer creation failed, falling back to ArrayBuffer');
        this.isSharedBufferAvailable = false;
        this.buffer = new ArrayBuffer(size);
        this.view = new Uint8Array(this.buffer);
      }
    } else {
      this.buffer = new ArrayBuffer(size);
      this.view = new Uint8Array(this.buffer);
    }
  }

  getBuffer() {
    return this.buffer;
  }

  getView() {
    return this.view;
  }

  async update(newData) {
    if (!this.isSharedBufferAvailable) {
      this.view.set(newData);
    }
  }

  isShared() {
    return this.isSharedBufferAvailable;
  }
}

const ViewportStats = ({ fps, objectCount, selectedId }) => (
  <div className="absolute bottom-3 left-3 bg-black/80 text-xs text-gray-300 px-3 py-2 rounded-lg border border-blue-900/20">
    <div>FPS: {fps}</div>
    <div>Objects: {objectCount}</div>
    {selectedId && <div>Selected: {selectedId}</div>}
  </div>
);

const ViewportControls = ({
  activeTool,
  isPlaying,
  showGrid,
  showGizmos,
  onToolChange,
  onPlayToggle,
  onToggleGrid,
  onToggleGizmos,
  onResetView
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
      className="p-2 rounded hover:bg-blue-900/10 hover:text-blue-500 text-gray-400"
      onClick={onResetView}
      title="Reset View (F)"
    >
      <Maximize2 size={20} />
    </button>
  </div>
);

const Viewport = ({ 
  onObjectSelect,
  onObjectHover,
  onViewportReady,
  initialTool = TOOLS.SELECT
}) => {
  const canvasRef = useRef(null);
  const bufferManagerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const contextRef = useRef(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTool, setActiveTool] = useState(initialTool);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmos, setShowGizmos] = useState(true);
  const [fps, setFps] = useState(0);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [objectCount, setObjectCount] = useState(0);

  // Initialize viewport and buffer
  useEffect(() => {
    const initViewport = async () => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        contextRef.current = ctx;

        // Set canvas size based on device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);

        // Create buffer manager with appropriate size
        bufferManagerRef.current = new BufferManager(canvas.width * canvas.height * 4);

        // Initialize viewport with buffer info
        await invoke('initialize_viewport', {
          width: canvas.width,
          height: canvas.height,
          devicePixelRatio: dpr,
          useSharedBuffer: bufferManagerRef.current.isShared(),
          buffer: bufferManagerRef.current.isShared() ? bufferManagerRef.current.getBuffer() : null
        });

        setIsInitialized(true);
        onViewportReady?.();
      } catch (err) {
        console.error('Failed to initialize viewport:', err);
      }
    };

    initViewport();
  }, [onViewportReady]);

  // Handle mouse interaction
  const handleMouseDown = useCallback(async (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    try {
      const result = await invoke('handle_viewport_event', {
        event: {
          event_type: 'mouseDown',
          tool: activeTool,
          position: { x, y },
          button: e.button
        }
      });

      if (result.hit && activeTool === TOOLS.SELECT) {
        setSelectedObject(result.object_id);
        onObjectSelect?.(result.object_id);
      }
    } catch (err) {
      console.error('Error handling mouse down:', err);
    }
  }, [activeTool, onObjectSelect]);

  const handleMouseMove = useCallback(async (e) => {
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
        const result = await invoke('handle_viewport_event', {
          event: {
            event_type: 'mouseMove',
            tool: activeTool,
            position: { x, y }
          }
        });

        if (result.hit) {
          setHoveredObject(result.object_id);
          onObjectHover?.(result.object_id);
        } else {
          setHoveredObject(null);
          onObjectHover?.(null);
        }
      }

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } catch (err) {
      console.error('Error handling mouse move:', err);
    }
  }, [activeTool, onObjectHover]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      await invoke('handle_viewport_event', {
        event: {
          event_type: 'zoom',
          delta: Math.sign(e.deltaY) * -0.1
        }
      });
    } catch (err) {
      console.error('Error handling wheel:', err);
    }
  }, []);

  // Handle viewport resize
  useEffect(() => {
    const handleResize = async () => {
      if (!canvasRef.current || !contextRef.current) return;

      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);

      try {
        await invoke('resize_viewport', {
          width: canvas.width,
          height: canvas.height
        });
      } catch (err) {
        console.error('Error resizing viewport:', err);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Frame update loop
  useEffect(() => {
    if (!isInitialized || !isPlaying) return;

    let animationFrameId;

    const updateFrame = async () => {
      try {
        // Update scene state
        await invoke('update_scene_state', {
          deltaTime: 1/60
        });

        // Get frame data if not using SharedArrayBuffer
        if (!bufferManagerRef.current.isShared()) {
          const frameData = await invoke('get_frame_data');
          await bufferManagerRef.current.update(frameData);
        }

        // Render the frame
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        
        const imageData = new ImageData(
          new Uint8ClampedArray(bufferManagerRef.current.getView().buffer),
          canvas.width,
          canvas.height
        );
        
        ctx.putImageData(imageData, 0, 0);

        // Update FPS counter
        frameCountRef.current++;
        const now = performance.now();
        const elapsed = now - lastFrameTimeRef.current;
        
        if (elapsed >= 1000) {
          setFps(Math.round((frameCountRef.current * 1000) / elapsed));
          frameCountRef.current = 0;
          lastFrameTimeRef.current = now;
        }

        // Get updated object count
        const stats = await invoke('get_scene_stats');
        setObjectCount(stats.objectCount);

        animationFrameId = requestAnimationFrame(updateFrame);
      } catch (err) {
        console.error('Error updating frame:', err);
      }
    };

    animationFrameId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInitialized, isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case 'q': setActiveTool(TOOLS.SELECT); break;
        case 'w': setActiveTool(TOOLS.PAN); break;
        case 'e': setActiveTool(TOOLS.ORBIT); break;
        case 'r': setActiveTool(TOOLS.ZOOM); break;
        case ' ': 
          e.preventDefault();
          setIsPlaying(prev => !prev); 
          break;
        case 'g': setShowGrid(g => !g); break;
        case 'v': setShowGizmos(g => !g); break;
        case 'f': handleResetView(); break;
        case 'delete':
          if (selectedObject) {
            handleDeleteObject(selectedObject);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject]);

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  const handleResetView = useCallback(async () => {
    try {
      await invoke('reset_viewport_camera');
    } catch (err) {
      console.error('Error resetting view:', err);
    }
  }, []);

  const handleDeleteObject = useCallback(async (objectId) => {
    try {
      await invoke('delete_object', { id: objectId });
      setSelectedObject(null);
    } catch (err) {
      console.error('Error deleting object:', err);
    }
  }, []);

  return (
    <div className="flex-1 relative h-full bg-gray-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      <ViewportControls
        activeTool={activeTool}
        isPlaying={isPlaying}
        showGrid={showGrid}
        showGizmos={showGizmos}
        onToolChange={setActiveTool}
        onPlayToggle={() => setIsPlaying(prev => !prev)}
        onToggleGrid={() => setShowGrid(prev => !prev)}
        onToggleGizmos={() => setShowGizmos(prev => !prev)}
        onResetView={handleResetView}
      />

      <ViewportStats
        fps={fps}
        objectCount={objectCount}
        selectedId={selectedObject}
      />

      {/* Selection panel */}
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