  import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
  import { invoke } from '@tauri-apps/api/tauri';
  import { listen, UnlistenFn } from '@tauri-apps/api/event';
  import {
    Camera, Hand, Move, ZoomIn, Play, Pause,
    Grid3X3, Eye, EyeOff, Bug, RotateCcw, Crosshair
  } from 'lucide-react';
  import { Card } from '@/components/Card';

  // Types
  type ViewportMode = 'select' | 'pan' | 'orbit' | 'zoom';

  interface ViewportState {
    isInitialized: boolean;
    activeTool: ViewportMode;
    isPlaying: boolean;
    showGrid: boolean;
    showGizmos: boolean;
    showDebug: boolean;
    showPixelDebug: boolean;
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
    onTogglePixelDebug: () => void;
    onResetView: () => void;
  }

  interface DebugOverlayProps {
    viewportStatus: any;
    metrics: PerformanceMetrics;
    lastError?: string;
    isEnabled: boolean;
  }

  interface PixelDebugOverlayProps {
    isEnabled: boolean;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    pixelData: {
      x: number;
      y: number;
      color: [number, number, number, number];
    } | null;
  }

  declare global {
    interface Window {
      pulsar_shared_memory: ArrayBuffer;
      nativeBufferToArray: (ptr: number, targetBuffer: Uint8Array) => Uint8Array;
    }
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
    showPixelDebug: false,
  };

  const INITIAL_METRICS: PerformanceMetrics = {
    renderRate: 0,
    drawRate: 0,
  };

  const TARGET_FPS = 120;
  const FRAME_TIME = 1000 / TARGET_FPS;
  const METRICS_UPDATE_INTERVAL = 1000;

  // Debug utilities
  const logBuffer = (label: string, buffer: Uint8Array, length = 16) => {
    console.log(`${label}:`, 
      Array.from(buffer.slice(0, length))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ')
    );
  };

  // PixelDebugOverlay Component
  const PixelDebugOverlay: React.FC<PixelDebugOverlayProps> = React.memo(({
    isEnabled,
    pixelData
  }) => {
    if (!isEnabled || !pixelData) return null;

    const { x, y, color } = pixelData;
    const [r, g, b, a] = color;

    return (
      <div className="absolute bottom-3 right-3 bg-black/80 text-xs text-gray-300 p-3 rounded-lg border border-blue-500/20">
        <h3 className="text-blue-400 font-medium mb-2">Pixel Debug</h3>
        <div className="space-y-1">
          <div>Position: ({x}, {y})</div>
          <div className="flex items-center gap-2">
            <div>Color:</div>
            <div 
              className="w-4 h-4 border border-white/20" 
              style={{ backgroundColor: `rgba(${r},${g},${b},${a/255})` }} 
            />
            <div>rgba({r}, {g}, {b}, {(a/255).toFixed(2)})</div>
          </div>
          <div>Hex: #{r.toString(16).padStart(2, '0')}{g.toString(16).padStart(2, '0')}{b.toString(16).padStart(2, '0')}</div>
        </div>
      </div>
    );
  });

  PixelDebugOverlay.displayName = 'PixelDebugOverlay';

  // ViewportControls Component
  const ViewportControls = React.memo<ViewportControlsProps>(({
    activeTool,
    isPlaying,
    showGrid,
    showGizmos,
    showDebug,
    showPixelDebug,
    onToolChange,
    onPlayToggle,
    onToggleGrid,
    onToggleGizmos,
    onToggleDebug,
    onTogglePixelDebug,
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
        ${showPixelDebug ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
        onClick={onTogglePixelDebug}
        title="Toggle Pixel Debug (P)"
      >
        <Crosshair size={20} />
      </button>

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

  // DebugOverlay Component
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

  // Main Viewport Component
  const Viewport: React.FC = () => {
    // State
    const [viewportState, setViewportState] = useState<ViewportState>(INITIAL_VIEWPORT_STATE);
    const [metrics, setMetrics] = useState<PerformanceMetrics>(INITIAL_METRICS);
    const [viewportStatus, setViewportStatus] = useState<any>(null);
    const [lastError, setLastError] = useState<string>();
    const [pixelData, setPixelData] = useState<{
      x: number;
      y: number;
      color: [number, number, number, number];
    } | null>(null);

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const sharedBufferRef = useRef<number | null>(null);
    const frameRequestRef = useRef<number>();
    const metricsTimeoutRef = useRef<NodeJS.Timeout>();
    const imageDataRef = useRef<ImageData | null>(null);
    const bufferRef = useRef<Uint8Array | null>(null);
    const canvasConfigRef = useRef<ViewportConfig | null>(null);

    // Performance tracking refs
    const frameDataRef = useRef({
      renderCount: 0,
      drawCount: 0,
      lastMetricsUpdate: performance.now(),
      lastFrameTime: performance.now(),
    });

    // Initialize canvas context
    const initContext = useCallback(() => {
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d', {
        alpha: false,
        desynchronized: true,
        willReadFrequently: true,
      });
      
      if (!ctx) {
        throw new Error('Failed to get 2D context');
      }
      
      ctx.imageSmoothingEnabled = false;
      ctxRef.current = ctx;
    }, []);

    // Setup buffer and ImageData
    const setupBufferAndImageData = useCallback((config: ViewportConfig) => {
      const bufferSize = config.width * config.height * 4;
      console.log('Setting up buffer:', { width: config.width, height: config.height, bufferSize });
      
      // Initialize buffer with full opacity
      const buffer = new Uint8Array(bufferSize);
      for (let i = 0; i < bufferSize; i += 4) {
        buffer[i] = 0;      // R
        buffer[i + 1] = 0;  // G
        buffer[i + 2] = 0;  // B
        buffer[i + 3] = 255;// A - Force opacity
      }
      
      bufferRef.current = buffer;
      logBuffer('Initial buffer', buffer);
      
      // Create ImageData
      const imageData = new ImageData(
        new Uint8ClampedArray(buffer),
        config.width,
        config.height
      );
      
      imageDataRef.current = imageData;
      canvasConfigRef.current = config;
    }, []);

    // Define native buffer conversion function
    useEffect(() => {
      window.nativeBufferToArray = (ptr: number, targetBuffer: Uint8Array): Uint8Array => {
        // Create buffer if it doesn't exist
        if (!window.pulsar_shared_memory) {
          console.log('Creating new buffer:', { size: targetBuffer.length, ptr });
          window.pulsar_shared_memory = new ArrayBuffer(targetBuffer.length);
        }

        // Create a test pattern in the target buffer
        for (let i = 0; i < targetBuffer.length; i += 4) {
          targetBuffer[i] = 255;  // R
          targetBuffer[i + 1] = 0;  // G
          targetBuffer[i + 2] = 0;  // B
          targetBuffer[i + 3] = 255;// A
        }

        console.log('Buffer filled with test pattern');
        return targetBuffer;
      };
    }, []);

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

      console.log('Resizing viewport:', { width, height, dpr });

      const config: ViewportConfig = { width, height, device_pixel_ratio: dpr };

      try {
        canvasRef.current.width = width;
        canvasRef.current.height = height;

        initContext();
        setupBufferAndImageData(config);

        await invoke('resize_viewport', { config });
      } catch (error) {
        console.error('Resize error:', error);
        setLastError(error instanceof Error ? error.message : String(error));
      }
    }, [initContext, setupBufferAndImageData]);

    // Handle mouse move for pixel debug
    const handleMouseMove = useCallback((event: MouseEvent) => {
      if (!viewportState.showPixelDebug || !canvasRef.current || !ctxRef.current) return;
  
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) * (canvasRef.current.width / rect.width));
      const y = Math.floor((event.clientY - rect.top) * (canvasRef.current.height / rect.height));
      
      if (x >= 0 && x < canvasRef.current.width && y >= 0 && y < canvasRef.current.height) {
        // Get pixel data directly from the canvas context
        const pixelData = ctxRef.current.getImageData(x, y, 1, 1).data;
        
        setPixelData({
          x,
          y,
          color: [pixelData[0], pixelData[1], pixelData[2], pixelData[3]]
        });
  
        if (frameDataRef.current.drawCount % 60 === 0) {
          console.log('Pixel debug:', {
            position: `${x},${y}`,
            color: Array.from(pixelData).join(','),
            raw: Array.from(pixelData).map(b => b.toString(16).padStart(2, '0')).join('')
          });
        }
      }
    }, [viewportState.showPixelDebug]);

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

          console.log('Initializing viewport:', config);

          canvasRef.current.width = config.width;
          canvasRef.current.height = config.height;

          initContext();
          setupBufferAndImageData(config);

          const status = await invoke('initialize_viewport', { config });
          
          // Set up memory and get buffer pointer
          window.pulsar_shared_memory = new ArrayBuffer(config.width * config.height * 4);
          const bufferPtr = await invoke('setup_shared_memory', { config });

          console.log('Shared memory setup:', {
            size: window.pulsar_shared_memory.byteLength,
            ptr: bufferPtr
          });

          setViewportStatus(status);
          sharedBufferRef.current = Number(bufferPtr);
          
          await invoke('start_frame_updates');
          
          setViewportState(prev => ({ ...prev, isInitialized: true }));
        } catch (error) {
          console.error('Initialization error:', error);
          setLastError(error instanceof Error ? error.message : String(error));
        }
      };

      initViewport();

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
          
          const bufferPtr = Number(event.payload);
          if (!isNaN(bufferPtr) && sharedBufferRef.current !== bufferPtr) {
            console.log('Buffer pointer updated:', bufferPtr);
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
      if (!viewportState.isInitialized || !ctxRef.current || !canvasRef.current) return;

      // Set up mouse move listener for pixel debug
      if (viewportState.showPixelDebug && canvasRef.current) {
        canvasRef.current.addEventListener('mousemove', handleMouseMove);
      }

      const renderFrame = async () => {
        const startTime = performance.now();
        
        try {
          if (bufferRef.current && imageDataRef.current && sharedBufferRef.current !== null && ctxRef.current && canvasRef.current) {
            const ctx = ctxRef.current;
            
            // Get buffer data
            const sourceBuffer = window.nativeBufferToArray(
              sharedBufferRef.current,
              bufferRef.current
            );
      
            // Create a temporary canvas for double buffering
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasRef.current.width;
            tempCanvas.height = canvasRef.current.height;
            const tempCtx = tempCanvas.getContext('2d', { alpha: false });
            
            if (tempCtx) {
              // Create and fill the ImageData
              const imageData = new ImageData(
                new Uint8ClampedArray(sourceBuffer.buffer),
                canvasRef.current.width,
                canvasRef.current.height
              );
              
              // Put the image data on the temp canvas
              tempCtx.putImageData(imageData, 0, 0);
              
              // Clear main canvas
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
              // Draw temp canvas to main canvas
              ctx.drawImage(tempCanvas, 0, 0);
            }
            
            // Performance tracking
            frameDataRef.current.drawCount++;
            if (frameDataRef.current.drawCount % 60 === 0) {
              const frameDuration = performance.now() - startTime;
              console.log('Frame stats:', {
                count: frameDataRef.current.drawCount,
                duration: frameDuration.toFixed(2) + 'ms',
                fps: (1000 / frameDuration).toFixed(1),
                pixelSample: Array.from(sourceBuffer.slice(0, 4))
                  .map(b => b.toString(16).padStart(2, '0'))
                  .join('')
              });
            }
          }
        } catch (error) {
          console.error('Render error:', error);
          setLastError(error instanceof Error ? error.message : String(error));
        }
      
        frameRequestRef.current = requestAnimationFrame(renderFrame);
      };

      frameRequestRef.current = requestAnimationFrame(renderFrame);

      // Update metrics periodically
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
        if (canvasRef.current) {
          canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        }
      };
    }, [viewportState.isInitialized, viewportState.isPlaying, viewportState.showPixelDebug, handleMouseMove]);

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
          case 'p':
            setViewportState(prev => ({ ...prev, showPixelDebug: !prev.showPixelDebug }));
            break;
          case 'f':
            invoke('reset_viewport_camera').catch(error => {
              console.error('Reset view error:', error);
              setLastError(error instanceof Error ? error.message : String(error));
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
      onTogglePixelDebug: () => 
        setViewportState(prev => ({ ...prev, showPixelDebug: !prev.showPixelDebug })),
      onResetView: () => 
        invoke('reset_viewport_camera').catch(error => {
          console.error('Reset view error:', error);
          setLastError(error instanceof Error ? error.message : String(error));
        }),
    }), []);

    return (
      <div className="relative w-full h-full bg-gray-800">
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
          style={{ 
            backgroundColor: '#1f2937',
            imageRendering: 'pixelated'
          }}
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
        <PixelDebugOverlay
          isEnabled={viewportState.showPixelDebug}
          canvasRef={canvasRef}
          pixelData={pixelData}
        />
      </div>
    );
  };

  export default React.memo(Viewport);