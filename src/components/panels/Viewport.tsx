import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { invoke } from '@tauri-apps/api/tauri';

interface ViewportConfig {
  width?: number;
  height?: number;
  devicePixelRatio?: number;
}

const DEFAULT_CONFIG: Required<ViewportConfig> = {
  width: 1000,
  height: 750,
  devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
};

const TauriVideoViewer: React.FC<ViewportConfig> = ({
  width = DEFAULT_CONFIG.width,
  height = DEFAULT_CONFIG.height,
  devicePixelRatio = DEFAULT_CONFIG.devicePixelRatio
}) => {
  const [isClientSide, setIsClientSide] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<Uint8Array | null>(null);
  const frameRequestRef = useRef<number>();

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeViewer = useCallback(async () => {
    if (!isClientSide || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      
      // Configure canvas
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Initialize viewport in Rust
      await invoke('initialize_viewport', {
        config: {
          width: canvas.width,
          height: canvas.height,
          device_pixel_ratio: devicePixelRatio
        }
      });

      // Draw test pattern
      await invoke('draw_test_pattern');

      // Retrieve shared memory
      const bufferData = await invoke<number[]>('get_shared_memory_info');
      
      console.log('Retrieved Shared Memory:', {
        length: bufferData.length,
        firstBytes: bufferData.slice(0, 16),
        redPixelsCount: bufferData.filter(val => val === 255).length
      });

      // Create buffer
      bufferRef.current = new Uint8Array(bufferData);

      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Viewer initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown initialization error');
    }
  }, [width, height, devicePixelRatio, isClientSide]);

  const renderFrame = useCallback(() => {
    if (!isClientSide || !canvasRef.current || !bufferRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = new ImageData(
        new Uint8ClampedArray(bufferRef.current),
        canvasRef.current.width,
        canvasRef.current.height
      );
      
      ctx.putImageData(imageData, 0, 0);
    } catch (err) {
      console.error('Render error:', err);
      setError(err instanceof Error ? err.message : 'Unknown render error');
    }

    frameRequestRef.current = requestAnimationFrame(renderFrame);
  }, [isClientSide]);

  // Client-side initialization
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Viewer initialization effect
  useEffect(() => {
    if (!isClientSide) return;
    initializeViewer();

    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [initializeViewer, isClientSide]);

  // Render loop effect
  useEffect(() => {
    if (!isClientSide || !isInitialized) return;

    frameRequestRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [isInitialized, renderFrame, isClientSide]);

  // Render component
  if (!isClientSide) {
    return <div className="w-full h-full bg-gray-900" />;
  }

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          imageRendering: 'pixelated',
          backgroundColor: '#1f2937'
        }}
      />
      {(!isInitialized || error) && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900/75 z-10">
          <div className="text-center">
            {error ? (
              <>
                <p className="text-red-400">Initialization Error</p>
                <p className="text-sm">{error}</p>
              </>
            ) : (
              <p>Initializing Viewer...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(TauriVideoViewer), {
  ssr: false
});