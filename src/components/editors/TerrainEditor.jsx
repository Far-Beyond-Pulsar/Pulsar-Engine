import React, { useState } from 'react';
import { Mountain, Brush, Eraser, Layers, ChevronDown } from 'lucide-react';

const TerrainEditor = () => {
  const [activeTool, setActiveTool] = useState('sculpt');
  const [brushSize, setBrushSize] = useState(50);
  
  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Toolbar */}
      <div className="w-12 border-r border-neutral-800 flex flex-col">
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTool === 'sculpt' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTool('sculpt')}
        >
          <Mountain size={18} />
        </button>
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTool === 'paint' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTool('paint')}
        >
          <Brush size={18} />
        </button>
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTool === 'smooth' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTool('smooth')}
        >
          <Eraser size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-neutral-800 flex items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-neutral-400">Brush Size:</label>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-32 bg-neutral-800" 
              />
              <span className="text-sm w-8">{brushSize}</span>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-neutral-400">Strength:</label>
              <input 
                type="range" 
                min="1" 
                max="100" 
                className="w-32 bg-neutral-800" 
              />
            </div>
          </div>
          <button className="flex items-center space-x-1 px-2 py-1 hover:bg-neutral-800 rounded text-sm">
            <span>Height Map</span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Main Viewport */}
        <div className="flex-1 flex">
          <div className="flex-1 relative">
            {/* Grid Background */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            {/* Terrain Preview */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm text-neutral-500">Terrain Viewport</div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 border-l border-neutral-800">
            <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
              <span className="text-sm text-neutral-400">Terrain Layers</span>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 bg-green-900 rounded"></div>
                    <div className="space-y-2">
                      <input type="range" className="w-full bg-neutral-800" />
                      <input type="range" className="w-full bg-neutral-800" />
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Rock</span>
                    <Layers size={14} className="text-neutral-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 bg-stone-700 rounded"></div>
                    <div className="space-y-2">
                      <input type="range" className="w-full bg-neutral-800" />
                      <input type="range" className="w-full bg-neutral-800" />
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Sand</span>
                    <Layers size={14} className="text-neutral-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 bg-yellow-700 rounded"></div>
                    <div className="space-y-2">
                      <input type="range" className="w-full bg-neutral-800" />
                      <input type="range" className="w-full bg-neutral-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerrainEditor;