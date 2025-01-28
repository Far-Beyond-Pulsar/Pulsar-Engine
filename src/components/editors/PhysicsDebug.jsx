import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Box, Crosshair, Eye, EyeOff, Settings2 } from 'lucide-react';

const PhysicsDebug = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showColliders, setShowColliders] = useState(true);
  const [showForces, setShowForces] = useState(true);
  
  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Panel - Objects */}
      <div className="w-64 border-r border-neutral-800">
        <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-medium">Physics Objects</h2>
          <button className="p-1 hover:bg-neutral-800 rounded">
            <Settings2 size={16} />
          </button>
        </div>
        <div className="p-2">
          <div className="space-y-1">
            <div className="flex items-center p-2 bg-neutral-800 rounded cursor-pointer">
              <Box size={14} className="mr-2 text-neutral-400" />
              <span className="text-sm">Player</span>
            </div>
            <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
              <Box size={14} className="mr-2 text-neutral-400" />
              <span className="text-sm">Platform</span>
            </div>
            <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
              <Box size={14} className="mr-2 text-neutral-400" />
              <span className="text-sm">Trigger Zone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-neutral-800 flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 hover:bg-neutral-800 rounded"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className="p-1 hover:bg-neutral-800 rounded">
              <RotateCcw size={16} />
            </button>
            <div className="h-4 w-px bg-neutral-800 mx-2" />
            <button 
              className={`px-2 py-1 rounded text-sm flex items-center space-x-1 ${showColliders ? 'bg-blue-500' : 'hover:bg-neutral-800'}`}
              onClick={() => setShowColliders(!showColliders)}
            >
              {showColliders ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>Colliders</span>
            </button>
            <button 
              className={`px-2 py-1 rounded text-sm flex items-center space-x-1 ${showForces ? 'bg-blue-500' : 'hover:bg-neutral-800'}`}
              onClick={() => setShowForces(!showForces)}
            >
              <Crosshair size={14} />
              <span>Forces</span>
            </button>
          </div>
        </div>

        {/* Debug Viewport */}
        <div className="flex-1 relative">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
            {/* Example Physics Debug Visualization */}
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Ground Collider */}
              <rect 
                x="100" 
                y="400" 
                width="600" 
                height="20" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2" 
                strokeDasharray="4 4"
              />
              {/* Player Collider */}
              <rect 
                x="200" 
                y="300" 
                width="40" 
                height="80" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2" 
              />
              {/* Force Arrow */}
              <path 
                d="M220,340 L220,380" 
                stroke="#EF4444" 
                strokeWidth="2" 
                markerEnd="url(#arrowhead)" 
              />
              {/* Arrow Marker Definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#EF4444"
                  />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 border-l border-neutral-800">
        <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
          <span className="text-sm text-neutral-400">Physics Properties</span>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Body Type</label>
              <select className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full">
                <option>Dynamic</option>
                <option>Static</option>
                <option>Kinematic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Mass</label>
              <input 
                type="number" 
                value="1.0" 
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Linear Drag</label>
              <input type="range" className="w-full bg-neutral-800" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Angular Drag</label>
              <input type="range" className="w-full bg-neutral-800" />
            </div>
            <div className="pt-4 border-t border-neutral-800">
              <label className="block text-sm font-medium mb-2">Collision</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" checked className="mr-2" />
                  <span className="text-sm text-neutral-400">Use Gravity</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked className="mr-2" />
                  <span className="text-sm text-neutral-400">Is Trigger</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked className="mr-2" />
                  <span className="text-sm text-neutral-400">Continuous Detection</span>
                </label>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-800">
              <label className="block text-sm font-medium mb-2">Layer Collision Matrix</label>
              <div className="grid grid-cols-4 gap-1">
                {[...Array(16)].map((_, i) => (
                  <label key={i} className="flex items-center">
                    <input type="checkbox" className="mr-1" />
                    <span className="text-xs text-neutral-400">{i}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsDebug;