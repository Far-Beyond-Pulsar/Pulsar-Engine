import React, { useState } from 'react';
import { Grid, Layers, Eye, EyeOff, Palette } from 'lucide-react';

const MaterialEditor = () => {
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Sidebar - Material List */}
      <div className="w-64 border-r border-neutral-800">
        <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-medium">Materials</h2>
          <button className="p-1 hover:bg-neutral-800 rounded">
            <Layers size={16} />
          </button>
        </div>
        <div className="p-2">
          <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
            <Eye size={16} className="mr-2 text-neutral-400" />
            <span className="text-sm">Default Material</span>
          </div>
          <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
            <Eye size={16} className="mr-2 text-neutral-400" />
            <span className="text-sm">Metal Surface</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-neutral-800 flex items-center px-4">
          <button className="p-1 hover:bg-neutral-800 rounded mr-2">
            <Grid size={16} />
          </button>
          <button className="p-1 hover:bg-neutral-800 rounded">
            <Palette size={16} />
          </button>
        </div>

        {/* Preview and Properties */}
        <div className="flex-1 flex">
          {/* Preview Area */}
          <div className="flex-1 border-r border-neutral-800">
            <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
              <span className="text-sm text-neutral-400">Preview</span>
            </div>
            <div className="p-4 flex items-center justify-center h-[calc(100%-2rem)]">
              <div className="w-48 h-48 rounded bg-neutral-800 flex items-center justify-center">
                <span className="text-sm text-neutral-500">Material Preview</span>
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
                  <label className="block text-sm text-neutral-400 mb-1">Base Color</label>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded"></div>
                    <input type="text" value="#3B82F6" 
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Metallic</label>
                  <input type="range" min="0" max="100" 
                    className="w-full bg-neutral-800" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Roughness</label>
                  <input type="range" min="0" max="100" 
                    className="w-full bg-neutral-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialEditor;