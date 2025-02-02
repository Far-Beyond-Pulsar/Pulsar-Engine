import React, { useState } from 'react';
import { ScrollArea } from "@/components/shared/ScrollArea";
import { Layers, Tree, Leaf, Sparkles, Plus, Minus } from 'lucide-react';

export const NatureScatterEditor = () => {
    return (
      <div className="flex h-full bg-black text-gray-300">
        {/* Asset Library */}
        <div className="w-48 bg-black border-r border-zinc-950">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              <div className="text-sm font-semibold">Assets</div>
              <div className="grid grid-cols-2 gap-1">
                <div className="aspect-square bg-zinc-950 rounded cursor-pointer hover:bg-zinc-900"></div>
                <div className="aspect-square bg-zinc-950 rounded cursor-pointer hover:bg-zinc-900"></div>
                <div className="aspect-square bg-zinc-950 rounded cursor-pointer hover:bg-zinc-900"></div>
                <div className="aspect-square bg-zinc-950 rounded cursor-pointer hover:bg-zinc-900"></div>
              </div>
            </div>
          </ScrollArea>
        </div>
  
        {/* Scene View */}
        <div className="flex-1 bg-black">
          <div className="h-full flex items-center justify-center border border-zinc-950 m-2 rounded">
            Terrain View
          </div>
        </div>
  
        {/* Scatter Properties */}
        <ScrollArea className="w-64 border-l border-zinc-950 bg-black">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Density</label>
              <input type="range" className="w-full accent-zinc-700"/>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Scale Variation</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" className="w-full bg-zinc-950 border border-zinc-900 rounded p-1 text-sm"/>
                <input type="number" placeholder="Max" className="w-full bg-zinc-950 border border-zinc-900 rounded p-1 text-sm"/>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

    export default NatureScatterEditor;