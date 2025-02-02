"use client";

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Settings, Plus } from 'lucide-react';

const ParticleEditor = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Sidebar - Particle Systems List */}
      <div className="w-64 border-r border-neutral-800">
        <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-medium">Particle Systems</h2>
          <button className="p-1 hover:bg-neutral-800 rounded">
            <Plus size={16} />
          </button>
        </div>
        <div className="p-2">
          <div className="flex items-center p-2 bg-neutral-800 rounded cursor-pointer">
            <span className="text-sm">Fire Effect</span>
          </div>
          <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
            <span className="text-sm">Smoke Trail</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-neutral-800 flex items-center px-4 space-x-2">
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
          <button className="p-1 hover:bg-neutral-800 rounded">
            <Settings size={16} />
          </button>
        </div>

        {/* Preview and Properties */}
        <div className="flex-1 flex">
          {/* Preview Area */}
          <div className="flex-1 border-r border-neutral-800">
            <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
              <span className="text-sm text-neutral-400">Preview</span>
            </div>
            <div className="relative h-[calc(100%-2rem)]">
              {/* Grid Background */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
              {/* Particle Preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full opacity-50"></div>
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80">
            <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
              <span className="text-sm text-neutral-400">Properties</span>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Emission Rate</label>
                  <input type="range" min="0" max="100" 
                    className="w-full bg-neutral-800" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Particle Life</label>
                  <input type="number" value="2.0" 
                    className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Initial Speed</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" value="0" className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm" placeholder="X" />
                    <input type="number" value="1" className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm" placeholder="Y" />
                    <input type="number" value="0" className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm" placeholder="Z" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Color Over Life</label>
                  <div className="h-8 rounded bg-gradient-to-r from-blue-500 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleEditor;