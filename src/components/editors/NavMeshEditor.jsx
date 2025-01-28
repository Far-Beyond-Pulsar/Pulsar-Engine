import React, { useState } from 'react';
import { Route, Box, Maximize2, Navigation, Settings2, Play } from 'lucide-react';

const NavMeshEditor = () => {
  const [activeTab, setActiveTab] = useState('edit');
  const [showDebug, setShowDebug] = useState(true);
  
  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Toolbar */}
      <div className="w-12 border-r border-neutral-800 flex flex-col">
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'edit' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          <Box size={18} />
        </button>
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'path' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('path')}
        >
          <Route size={18} />
        </button>
        <div className="flex-1" />
        <button 
          className={`p-3 hover:bg-neutral-800 ${showDebug ? 'text-blue-500' : ''}`}
          onClick={() => setShowDebug(!showDebug)}
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-neutral-800 flex items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
              <Navigation size={14} />
              <span>Generate NavMesh</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-1 hover:bg-neutral-800 rounded text-sm">
              <Play size={14} />
              <span>Test Path</span>
            </button>
          </div>
          <button className="p-2 hover:bg-neutral-800 rounded">
            <Settings2 size={16} />
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
            {/* NavMesh Preview */}
            <div className="absolute inset-0">
              <svg width="100%" height="100%">
                <path 
                  d="M100,100 L300,100 L200,300 Z" 
                  fill="rgba(59, 130, 246, 0.1)" 
                  stroke="#3B82F6" 
                  strokeWidth="2"
                />
                <path 
                  d="M300,100 L500,100 L400,300 L200,300 Z" 
                  fill="rgba(59, 130, 246, 0.1)" 
                  stroke="#3B82F6" 
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 border-l border-neutral-800">
            <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
              <span className="text-sm text-neutral-400">NavMesh Properties</span>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Agent Radius</label>
                  <input 
                    type="number" 
                    value="0.5" 
                    className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Agent Height</label>
                  <input 
                    type="number" 
                    value="2.0" 
                    className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Max Slope</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="60" 
                    defaultValue="45"
                    className="w-full bg-neutral-800" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Cell Size</label>
                  <input 
                    type="number" 
                    value="0.3" 
                    className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
                  />
                </div>
                <div className="pt-4 border-t border-neutral-800">
                  <label className="block text-sm font-medium mb-2">Debug View</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" checked className="mr-2" />
                      <span className="text-sm text-neutral-400">Show NavMesh</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-neutral-400">Show Walkable Areas</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-neutral-400">Show Obstacles</span>
                    </label>
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

export default NavMeshEditor;