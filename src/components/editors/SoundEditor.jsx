import React from 'react';

const SoundEditor = () => {
  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Panel - Sound List */}
      <div className="w-64 border-r border-neutral-800">
        <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-medium">Sound Library</h2>
          <button className="p-1 hover:bg-neutral-800 rounded"></button>
        </div>
        <div className="pt-4 border-t border-neutral-800 mt-4">
          <label className="block text-sm font-medium mb-2">3D Sound Settings</label>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Min Distance</label>
              <input 
                type="number" 
                value="1.0" 
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Max Distance</label>
              <input 
                type="number" 
                value="50.0" 
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Rolloff</label>
              <select className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full">
                <option>Linear</option>
                <option>Logarithmic</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundEditor;