import React, { useState } from 'react';
import { ScrollArea } from "@/components/ScrollArea";
import { Layers, Tree, Leaf, Sparkles, Plus, Minus } from 'lucide-react';

export const CharacterSetupEditor = () => {
    const [selectedBone, setSelectedBone] = useState(null);
    
    return (
      <div className="flex h-full bg-black text-gray-300">
        {/* Bone Hierarchy */}
        <div className="w-48 bg-black border-r border-zinc-950">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              <div className="flex items-center gap-1 p-1 hover:bg-zinc-950 rounded cursor-pointer">
                <Plus className="w-3 h-3" />
                <span>Root</span>
              </div>
              <div className="ml-4 flex items-center gap-1 p-1 hover:bg-zinc-950 rounded cursor-pointer">
                <Minus className="w-3 h-3" />
                <span>Spine</span>
              </div>
              <div className="ml-8 p-1 hover:bg-zinc-950 rounded cursor-pointer">
                <span>Head</span>
              </div>
            </div>
          </ScrollArea>
        </div>
  
        {/* Preview Area */}
        <div className="flex-1 bg-black">
          <div className="h-full flex items-center justify-center border border-zinc-950 m-2 rounded">
            Character Preview
          </div>
        </div>
  
        {/* Properties */}
        <ScrollArea className="w-64 border-l border-zinc-950 bg-black">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Bone Name</label>
              <input type="text" className="w-full bg-zinc-950 border border-zinc-900 rounded p-1 text-sm"/>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Transform</label>
              <div className="grid grid-cols-3 gap-1">
                <input type="number" placeholder="X" className="bg-zinc-950 border border-zinc-900 rounded p-1 text-sm"/>
                <input type="number" placeholder="Y" className="bg-zinc-950 border border-zinc-900 rounded p-1 text-sm"/>
                <input type="number" placeholder="Z" className="bg-zinc-950 border border-zinc-900 rounded p-1 text-sm"/>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  export default CharacterSetupEditor;