import React, { useState } from 'react';
import { 
  Package, 
  ChevronRight, 
  Cube, 
  Settings2, 
  Copy, 
  Trash2, 
  Plus,
  ChevronDown
} from 'lucide-react';

const PrefabEditor = () => {
  const [selectedLayer, setSelectedLayer] = useState('default');
  const [isLayerSelectOpen, setIsLayerSelectOpen] = useState(false);
  
  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Panel */}
      <div className="w-64 border-r border-neutral-800">
        <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-medium">Prefab Structure</h2>
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-neutral-800 rounded">
              <Copy size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Preview Window */}
        <div className="flex-1 relative">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Package size={48} className="text-neutral-600" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="h-10 border-t border-neutral-800 flex items-center px-4 space-x-2">
          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
            Apply Changes
          </button>
          <button className="px-3 py-1 hover:bg-neutral-800 rounded text-sm text-neutral-400">
            Revert
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 border-l border-neutral-800">
        <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
          <span className="text-sm text-neutral-400">Properties</span>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Prefab Name</label>
              <input 
                type="text" 
                defaultValue="Enemy Prefab" 
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm" 
              />
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Tag</label>
              <input 
                type="text" 
                defaultValue="Enemy" 
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Layer</label>
              <select 
                value={selectedLayer}
                onChange={(e) => setSelectedLayer(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm"
              >
                <option value="default">Default</option>
                <option value="enemy">Enemy</option>
                <option value="player">Player</option>
              </select>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Components</span>
                <button className="p-1 hover:bg-neutral-800 rounded">
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {/* Transform Component */}
                <div className="rounded border border-neutral-800 bg-neutral-900 p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Transform</span>
                    <Settings2 size={16} className="text-neutral-400" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map(axis => (
                      <div key={axis}>
                        <label className="block text-xs text-neutral-500 mb-1">
                          {axis}
                        </label>
                        <input
                          type="number"
                          defaultValue="0"
                          className="w-full h-6 bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Components */}
                {['Mesh Renderer', 'Box Collider'].map(component => (
                  <div 
                    key={component}
                    className="flex items-center justify-between rounded border border-neutral-800 bg-neutral-900 p-2"
                  >
                    <span className="text-sm">{component}</span>
                    <Settings2 size={16} className="text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrefabEditor;