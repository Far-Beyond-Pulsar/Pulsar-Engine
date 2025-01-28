import React, { useState } from 'react';
import { Layers, Mouse, Layout, Type, Image, Square, Plus, AlignLeft, Move, Scale } from 'lucide-react';

const UIEditor = () => {
  const [activeTab, setActiveTab] = useState('select');
  const [selectedElement, setSelectedElement] = useState(null);
  
  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Toolbar */}
      <div className="w-12 border-r border-neutral-800 flex flex-col">
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'select' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('select')}
        >
          <Mouse size={18} />
        </button>
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'move' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('move')}
        >
          <Move size={18} />
        </button>
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'scale' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('scale')}
        >
          <Scale size={18} />
        </button>
        <div className="h-px bg-neutral-800 my-2" />
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'rect' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('rect')}
        >
          <Square size={18} />
        </button>
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'text' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <Type size={18} />
        </button>
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'image' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          <Image size={18} />
        </button>
      </div>

      {/* Hierarchy and Viewport */}
      <div className="flex-1 flex">
        {/* Left Panel - Hierarchy */}
        <div className="w-64 border-r border-neutral-800">
          <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-medium">Hierarchy</h2>
            <button className="p-1 hover:bg-neutral-800 rounded">
              <Plus size={16} />
            </button>
          </div>
          <div className="p-2">
            <div className="space-y-1">
              <div className="flex items-center p-2 bg-neutral-800 rounded cursor-pointer">
                <Layout size={14} className="mr-2 text-neutral-400" />
                <span className="text-sm">Canvas</span>
              </div>
              <div className="ml-4">
                <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
                  <Square size={14} className="mr-2 text-neutral-400" />
                  <span className="text-sm">Background Panel</span>
                </div>
                <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
                  <Type size={14} className="mr-2 text-neutral-400" />
                  <span className="text-sm">Title Text</span>
                </div>
                <div className="flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer">
                  <Image size={14} className="mr-2 text-neutral-400" />
                  <span className="text-sm">Logo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Viewport */}
        <div className="flex-1 relative">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
            {/* Example UI Elements */}
            <div className="absolute inset-20 bg-neutral-800/30 rounded flex items-center justify-center">
              <div className="bg-neutral-900 rounded p-8 flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-blue-500 rounded"></div>
                <div className="w-32 h-4 bg-neutral-700 rounded"></div>
                <div className="w-24 h-8 bg-blue-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-neutral-800">
          <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
            <span className="text-sm text-neutral-400">Element Properties</span>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">X</label>
                    <input 
                      type="number" 
                      value="0" 
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Y</label>
                    <input 
                      type="number" 
                      value="0" 
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Width</label>
                    <input 
                      type="number" 
                      value="200" 
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Height</label>
                    <input 
                      type="number" 
                      value="100" 
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Anchors</label>
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm">
                    <option>Top</option>
                    <option>Middle</option>
                    <option>Bottom</option>
                  </select>
                  <select className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm">
                    <option>Left</option>
                    <option>Center</option>
                    <option>Right</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-800">
                <label className="block text-sm font-medium mb-2">Style</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Background Color</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded"></div>
                      <input 
                        type="text" 
                        value="#3B82F6" 
                        className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm flex-1" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Border Radius</label>
                    <input 
                      type="number" 
                      value="4" 
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Opacity</label>
                    <input type="range" className="w-full bg-neutral-800" />
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

export default UIEditor;