import React, { useState, useRef, useEffect } from 'react';
import { Camera, Play, Pause, Save, Upload, Undo, Redo, Settings, Maximize2, Grid, Layers, ChevronRight, Plus, Trash2, Move, RotateCcw } from 'lucide-react';

const AnimationEditor = () => {
  const [timeline, setTimeline] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [skeleton, setSkeleton] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedBone, setSelectedBone] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [viewportMode, setViewportMode] = useState('perspective');
  const [layers, setLayers] = useState([]);
  const [fps, setFps] = useState(30);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [tools, setTools] = useState([
    { id: 'move', icon: Move, active: true },
    { id: 'rotate', icon: RotateCcw, active: false },
  ]);
  
  const canvasRef = useRef(null);
  const timelineRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    initializeViewport();
    const removeKeyboardShortcuts = setupKeyboardShortcuts();
    
    return () => {
      removeKeyboardShortcuts();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let lastTime = 0;
    const animate = (currentTime) => {
      if (lastTime !== 0) {
        const deltaTime = currentTime - lastTime;
        setCurrentFrame(prev => {
          const nextFrame = prev + (deltaTime * fps) / 1000;
          const maxFrame = Math.max(...timeline.map(t => t.frame), fps * 10);
          return nextFrame > maxFrame ? 0 : nextFrame;
        });
      }
      lastTime = currentTime;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, fps, timeline]);

  const initializeViewport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (showGrid) {
      setupGridSystem(ctx);
    }
  };

  const setupGridSystem = (ctx) => {
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    const gridSize = 50;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const setupKeyboardShortcuts = () => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        exportAnimation();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  };

  const handleToolSelect = (toolId) => {
    setTools(prev => prev.map(tool => ({
      ...tool,
      active: tool.id === toolId
    })));
  };

  const addKeyframe = (boneId) => {
    const newKeyframe = {
      id: Date.now(),
      frame: currentFrame,
      boneId,
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      },
      easing: 'linear'
    };
    
    pushToUndoStack('ADD_KEYFRAME', newKeyframe);
    setTimeline(prev => [...prev, newKeyframe]);
  };

  const pushToUndoStack = (type, data) => {
    setUndoStack(prev => [...prev, { type, data, timestamp: Date.now() }]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, action]);
    
    executeUndoAction(action);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, action]);
    
    executeRedoAction(action);
  };

  const executeUndoAction = (action) => {
    switch (action.type) {
      case 'ADD_KEYFRAME':
        setTimeline(prev => prev.filter(frame => frame.id !== action.data.id));
        break;
      case 'MODIFY_BONE':
        setSkeleton(action.data.previousState);
        break;
    }
  };

  const executeRedoAction = (action) => {
    switch (action.type) {
      case 'ADD_KEYFRAME':
        setTimeline(prev => [...prev, action.data]);
        break;
      case 'MODIFY_BONE':
        setSkeleton(action.data.newState);
        break;
    }
  };

  const updateBoneProperty = (property, axis, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setSkeleton(prev => {
      const newSkeleton = {...prev};
      const bone = newSkeleton.bones.find(b => b.id === selectedBone);
      if (bone) {
        const previousState = {...bone[property]};
        bone[property] = {
          ...bone[property],
          [axis]: numValue
        };
        pushToUndoStack('MODIFY_BONE', {
          boneId: selectedBone,
          property,
          previousState,
          newState: {...bone[property]}
        });
      }
      return newSkeleton;
    });
  };

  const selectKeyframe = (keyframeId) => {
    const keyframe = timeline.find(k => k.id === keyframeId);
    if (keyframe) {
      setCurrentFrame(keyframe.frame);
    }
  };

  const exportAnimation = () => {
    const animData = {
      version: '1.0.0',
      metadata: {
        created: new Date().toISOString(),
        fps,
        duration: timeline.length > 0 ? Math.max(...timeline.map(t => t.frame)) / fps : 0
      },
      skeleton,
      timeline,
      layers
    };
    
    const blob = new Blob([JSON.stringify(animData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation.anim';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-blue-400 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-blue-900">
        <div className="flex gap-2">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`p-2 rounded ${
                tool.active ? 'bg-blue-900' : 'hover:bg-gray-800'
              }`}
              onClick={() => handleToolSelect(tool.id)}
            >
              <tool.icon size={20} />
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button 
            className="p-2 hover:bg-gray-800 rounded"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button 
            className="p-2 hover:bg-gray-800 rounded"
            onClick={handleUndo}
          >
            <Undo size={20} />
          </button>
          
          <button 
            className="p-2 hover:bg-gray-800 rounded"
            onClick={handleRedo}
          >
            <Redo size={20} />
          </button>
          
          <button 
            className="p-2 hover:bg-gray-800 rounded"
            onClick={exportAnimation}
          >
            <Save size={20} />
          </button>
          
          <button 
            className="p-2 hover:bg-gray-800 rounded"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Hierarchy */}
        <div className="w-64 bg-gray-900 border-r border-blue-900 p-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Hierarchy</h2>
            <button className="p-1 hover:bg-gray-800 rounded">
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-1">
            {skeleton?.bones.map((bone, index) => (
              <div
                key={index}
                className={`flex items-center p-1 rounded cursor-pointer ${
                  selectedBone === bone.id ? 'bg-blue-900' : 'hover:bg-gray-800'
                }`}
                onClick={() => setSelectedBone(bone.id)}
              >
                <ChevronRight size={16} />
                <span className="ml-1">{bone.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Viewport */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full"
          />
          
          {/* Viewport Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              className="p-2 bg-gray-900 rounded hover:bg-gray-800"
              onClick={() => setViewportMode(
                viewportMode === 'perspective' ? 'orthographic' : 'perspective'
              )}
            >
              <Camera size={20} />
            </button>
            <button 
              className="p-2 bg-gray-900 rounded hover:bg-gray-800"
              onClick={() => setZoom(1)}
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 bg-gray-900 border-l border-blue-900 p-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Properties</h2>
            <button className="p-1 hover:bg-gray-800 rounded">
              <Settings size={16} />
            </button>
          </div>
          
          {selectedBone && (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-sm">Position</label>
                {['X', 'Y', 'Z'].map(axis => (
                  <div key={axis} className="flex items-center gap-2">
                    <span className="w-6">{axis}</span>
                    <input
                      type="number"
                      className="w-full bg-gray-800 p-1 rounded"
                      value={skeleton.bones.find(b => b.id === selectedBone).position[axis.toLowerCase()]}
                      onChange={(e) => updateBoneProperty('position', axis.toLowerCase(), e.target.value)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="space-y-1">
                <label className="text-sm">Rotation</label>
                {['X', 'Y', 'Z'].map(axis => (
                  <div key={axis} className="flex items-center gap-2">
                    <span className="w-6">{axis}</span>
                    <input
                      type="number"
                      className="w-full bg-gray-800 p-1 rounded"
                      value={skeleton.bones.find(b => b.id === selectedBone).rotation[axis.toLowerCase()]}
                      onChange={(e) => updateBoneProperty('rotation', axis.toLowerCase(), e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="h-48 bg-gray-900 border-t border-blue-900">
        <div className="flex h-full">
          {/* Layers Panel */}
          <div className="w-64 border-r border-blue-900 p-2">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Layers</h2>
              <button className="p-1 hover:bg-gray-800 rounded">
                <Layers size={16} />
              </button>
              </div>
          </div>
          
          {/* Timeline Tracks */}
          <div className="flex-1 relative p-2" ref={timelineRef}>
            {/* Time Ruler */}
            <div className="h-6 mb-2 border-b border-blue-900">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute text-xs"
                  style={{ left: `${i * 10}%` }}
                >
                  {i * fps}f
                </span>
              ))}
            </div>
            
            {/* Tracks */}
            <div className="space-y-1">
              {skeleton?.bones.map((bone, index) => (
                <div key={index} className="h-6 relative bg-gray-800 rounded">
                  {timeline
                    .filter(keyframe => keyframe.boneId === bone.id)
                    .map((keyframe, kIndex) => (
                      <div
                        key={kIndex}
                        className="absolute w-2 h-4 bg-blue-500 rounded cursor-pointer hover:bg-blue-400"
                        style={{ left: `${(keyframe.frame / (fps * 10)) * 100}%`, top: '4px' }}
                        onClick={() => selectKeyframe(keyframe.id)}
                      />
                    ))}
                </div>
              ))}
            </div>
            
            {/* Playhead */}
            <div
              className="absolute top-0 w-px h-full bg-blue-500"
              style={{ left: `${(currentFrame / (fps * 10)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationEditor;