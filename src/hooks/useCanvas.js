import { useCallback, useRef } from 'react';

export const useCanvas = (sceneObjects, selectedObject) => {
  const lastFrameTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  const renderScene = useCallback((ctx, width, height) => {
    if (!ctx) return;
    
    // Clear and set background
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height)
    );
    gradient.addColorStop(0, '#0f1525');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // ... rest of rendering logic ...
  }, [sceneObjects, selectedObject]);

  return {
    lastFrameTimeRef,
    animationFrameRef,
    renderScene
  };
};

export default useCanvas;