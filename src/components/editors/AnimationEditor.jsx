import React, { useState } from 'react';
import { Play, Pause, SkipBack, ChevronRight, Plus, RotateCcw, Clock } from 'lucide-react';

const AnimationEditor = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Animation List */}
        <div className="w-64 border-r border-neutral-800">
          <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-medium">Animations</h2>
            <button className="p-1 hover:bg-neutral-800 rounded">
              <Plus size={16} />
            </button>
          </div>
          <div className="p-2">
            <div className="flex items-center p-2 bg-neutral-800 rounded cursor-pointer">
              <ChevronRight size={16} className="mr-2" />
              <span className="text-sm">Idle</span>
            </div>
            <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
              <ChevronRight size={16} className="mr-2" />
              <span className="text-sm">Walk</span>
            </div>
            <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
              <ChevronRight size={16} className="mr-2" />
              <span className="text-sm">Run</span>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* Preview Window */}
          <div className="flex-1 relative">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm text-neutral-500">Animation Preview</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-48 border-t border-neutral-800">
            {/* Timeline Controls */}
            <div className="h-10 border-b border-neutral-800 flex items-center px-4 space-x-2">
              <button 
                className="p-1 hover:bg-neutral-800 rounded"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button className="p-1 hover:bg-neutral-800 rounded">
                <SkipBack size={16} />
              </button>
              <button className="p-1 hover:bg-neutral-800 rounded">
                <RotateCcw size={16} />
              </button>
              <div className="h-4 w-px bg-neutral-800 mx-2" />
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-neutral-400" />
                <span className="text-sm text-neutral-400">Frame {currentFrame}</span>
              </div>
            </div>

            {/* Timeline Grid */}
            <div className="relative h-[calc(100%-2.5rem)] p-4">
              <div className="absolute inset-0 p-4">
                <div className="h-full" style={{
                  backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to right, #0d0d0d 1px, transparent 1px)',
                  backgroundSize: '100px 100%, 20px 100%'
                }}></div>
              </div>
              {/* Example Keyframes */}
              <div className="relative h-6 bg-neutral-800/30 rounded">
                <div className="absolute h-4 w-1 bg-blue-500 top-1" style={{ left: '20px' }}></div>
                <div className="absolute h-4 w-1 bg-blue-500 top-1" style={{ left: '100px' }}></div>
                <div className="absolute h-4 w-1 bg-blue-500 top-1" style={{ left: '180px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-neutral-800">
          <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
            <span className="text-sm text-neutral-400">Properties</span>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Duration (s)</label>
                <input 
                  type="number" 
                  value="1.0" 
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Framerate</label>
                <input 
                  type="number" 
                  value="30" 
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Loop</label>
                <select className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full">
                  <option>None</option>
                  <option>Loop</option>
                  <option>Ping Pong</option>
                </select>
              </div>
              <div className="pt-4 border-t border-neutral-800">
                <label className="block text-sm font-medium mb-2">Events</label>
                <button className="w-full px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm text-center">
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationEditor;