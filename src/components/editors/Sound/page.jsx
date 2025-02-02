import React, { useState, useRef, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as Tabs from '@radix-ui/react-tabs';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  Save,
  Download,
  Share2,
  Mic,
  Music,
  Volume2,
  Plus,
  FolderOpen,
  ChevronRight,
  RefreshCw,
  Library,
  Workflow,
  Clock,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Lock,
  Eye,
  Trash,
} from 'lucide-react';

// Sample waveform data generator
const generateWaveformData = (length = 100) => {
  return Array.from({ length }, (_, i) => {
    const t = i / length;
    return Math.sin(2 * Math.PI * t * 3) * 0.3 + 
           Math.sin(2 * Math.PI * t * 5) * 0.2 +
           Math.random() * 0.1;
  });
};

// Waveform Component
const Waveform = ({ data, height = 80, color = "#4299e1" }) => {
  const width = 2000; // Full width of waveform
  const points = data.map((value, i) => ({
    x: (i / (data.length - 1)) * width,
    y: (value * height / 2) + (height / 2)
  }));

  const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <svg width={width} height={height} className="min-w-full">
      <path
        d={path}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        className="opacity-80"
      />
    </svg>
  );
};

// Track Component
const Track = ({ 
  track, 
  onRemove, 
  onSelect, 
  isSelected, 
  isPlaying,
  onPlayPause 
}) => {
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className={`group flex h-32 border-b border-[#1a1a1a] ${
      isSelected ? 'bg-[#1a1a1a]/30' : 'hover:bg-[#1a1a1a]/20'
    }`}>
      {/* Track Controls */}
      <div className="flex flex-col w-48 shrink-0 border-r border-[#1a1a1a] p-2 bg-black">
        <div className="flex items-center gap-2 mb-2">
          <Switch.Root 
            className="w-8 h-4 bg-[#333] rounded-full relative data-[state=checked]:bg-blue-600"
            onCheckedChange={() => setIsMuted(!isMuted)}
          >
            <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[18px]" />
          </Switch.Root>
          <input 
            type="text"
            defaultValue={track.name}
            className="bg-transparent text-sm font-medium text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
          />
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <Slider.Root 
            className="relative flex items-center select-none w-full h-4" 
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0])}
          >
            <Slider.Track className="bg-[#252525] relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb 
              className="block w-3 h-3 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Volume"
            />
          </Slider.Root>
        </div>

        <div className="flex items-center gap-1 mt-auto opacity-60 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-[#252525] rounded">
            <Lock className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-[#252525] rounded">
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-[#252525] rounded text-red-400">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Waveform Area */}
      <div className="flex-1 relative overflow-hidden" onClick={() => onSelect(track.id)}>
        <div className="absolute inset-0">
          {/* Time Grid */}
          <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-l border-[#1a1a1a]/50 h-full">
                {i > 0 && (
                  <span className="absolute -left-3 -top-4 text-[10px] text-gray-600">
                    {i}:00
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Waveform */}
          <div className="absolute inset-0 flex items-center px-4">
            <Waveform 
              data={generateWaveformData(200)} 
              height={80}
              color={isSelected ? "#60a5fa" : "#4299e1"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Timeline Ruler Component
const TimelineRuler = () => {
  return (
    <div className="h-8 border-b border-[#1a1a1a] flex items-end">
      <div className="w-48 shrink-0 border-r border-[#1a1a1a] bg-black" />
      <div className="flex-1 relative">
        <div className="absolute inset-0 grid grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-l border-[#1a1a1a] relative">
              <span className="absolute -left-3 top-1 text-[10px] text-gray-600">
                {i}:00
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Audio Editor Component
const AudioEditor = () => {
  const [tracks, setTracks] = useState([
    { id: 1, name: 'Vocals', waveform: generateWaveformData() },
    { id: 2, name: 'Guitar', waveform: generateWaveformData() },
    { id: 3, name: 'Drums', waveform: generateWaveformData() },
    { id: 4, name: 'Bass', waveform: generateWaveformData() },
  ]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="flex h-screen bg-black text-gray-300">
      {/* Library/Effects Sidebar */}
      <div className="w-64 border-r border-[#1a1a1a] flex flex-col bg-black">
        <div className="p-4 border-b border-[#1a1a1a]">
          <h1 className="text-xl font-bold mb-4 text-blue-400">Library</h1>
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium">
              <Music className="w-4 h-4 mr-1.5" />
              Browse
            </button>
            <button className="flex-1 border border-[#333] hover:bg-[#1a1a1a] px-3 py-1.5 rounded-md text-sm font-medium">
              <FolderOpen className="w-4 h-4 mr-1.5" />
              Import
            </button>
          </div>
        </div>
        
        <Tabs.Root defaultValue="library" className="flex-1">
          <Tabs.List className="flex border-b border-[#1a1a1a]">
            <Tabs.Trigger 
              value="library"
              className="flex-1 px-4 py-2 text-sm text-gray-400 data-[state=active]:text-blue-400 data-[state=active]:border-b data-[state=active]:border-blue-400"
            >
              Library
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="effects"
              className="flex-1 px-4 py-2 text-sm text-gray-400 data-[state=active]:text-blue-400 data-[state=active]:border-b data-[state=active]:border-blue-400"
            >
              Effects
            </Tabs.Trigger>
          </Tabs.List>
          
          <ScrollArea.Root className="flex-1">
            <ScrollArea.Viewport className="h-full">
              <Tabs.Content value="library" className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-gray-400">Recent Files</h3>
                    {['Acoustic Guitar.wav', 'Drums Loop.wav', 'Bass Line.wav'].map(file => (
                      <div 
                        key={file} 
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer text-sm group"
                      >
                        <Music className="w-4 h-4 text-gray-500" />
                        <span className="flex-1">{file}</span>
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#252525] rounded">
                          <Plus className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-gray-400">Sound Packs</h3>
                    {['Drums & Percussion', 'Bass Instruments', 'Synth Leads', 'Guitar Riffs'].map(pack => (
                      <div 
                        key={pack} 
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer text-sm"
                      >
                        <Library className="w-4 h-4 text-gray-500" />
                        <span>{pack}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="effects" className="p-4">
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-md p-2">
                    <input
                      type="text"
                      placeholder="Search effects..."
                      className="w-full bg-[#252525] text-sm px-3 py-1.5 rounded border border-[#333] focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-gray-400">Dynamics</h3>
                    {['Compressor', 'Limiter', 'Gate'].map(effect => (
                      <div 
                        key={effect} 
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer text-sm group"
                        draggable
                      >
                        <Workflow className="w-4 h-4 text-gray-500" />
                        <span>{effect}</span>
                        <span className="ml-auto text-xs text-gray-500 opacity-0 group-hover:opacity-100">
                          Drag
                        </span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-gray-400">EQ & Filters</h3>
                    {['Parametric EQ', 'High Pass', 'Low Pass'].map(effect => (
                      <div 
                        key={effect} 
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer text-sm group"
                        draggable
                      >
                        <Workflow className="w-4 h-4 text-gray-500" />
                        <span>{effect}</span>
                        <span className="ml-auto text-xs text-gray-500 opacity-0 group-hover:opacity-100">
                          Drag
                        </span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-gray-400">Time-Based</h3>
                    {['Reverb', 'Delay', 'Chorus'].map(effect => (
                      <div 
                        key={effect} 
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer text-sm group"
                        draggable
                      >
                        <Workflow className="w-4 h-4 text-gray-500" />
                        <span>{effect}</span>
                        <span className="ml-auto text-xs text-gray-500 opacity-0 group-hover:opacity-100">
                          Drag
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Tabs.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar 
              orientation="vertical"
              className="flex select-none touch-none p-0.5 bg-[#1a1a1a] transition-colors duration-150 ease-out w-2"
            >
              <ScrollArea.Thumb className="flex-1 bg-[#333] rounded-lg relative" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Tabs.Root>
      </div>

      {/* Left Sidebar */}
      <div className="w-48 border-r border-[#1a1a1a] flex flex-col bg-black">
        <div className="p-3 border-b border-[#1a1a1a]">
          <h1 className="text-lg font-bold mb-3 text-blue-400">Tracks</h1>
          <button className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center justify-center">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Track
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-12 border-b border-[#1a1a1a] bg-black flex items-center px-4 gap-4">
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-[#1a1a1a] rounded-md">
              <Undo className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-[#1a1a1a] rounded-md">
              <Redo className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-[#1a1a1a]" />
          
          <div className="flex items-center gap-2">
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? 
                <Pause className="w-4 h-4" /> : 
                <Play className="w-4 h-4" />
              }
            </button>
            <button className="p-1.5 hover:bg-[#1a1a1a] rounded-md">
              <SkipBack className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-[#1a1a1a] rounded-md">
              <SkipForward className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-sm font-medium text-gray-400 ml-2">
              00:00:00
            </span>
          </div>

          <div className="flex-1" />

          <span className="text-xs text-gray-500 px-2 py-1 rounded border border-[#333]">
            120 BPM
          </span>
          <span className="text-xs text-gray-500 px-2 py-1 rounded border border-[#333]">
            4/4
          </span>
        </div>

        {/* Timeline */}
        <TimelineRuler />

        {/* Tracks */}
        <ScrollArea.Root className="flex-1">
          <ScrollArea.Viewport className="w-full h-full">
            <div className="min-h-full">
              {tracks.map(track => (
                <Track
                  key={track.id}
                  track={track}
                  onSelect={() => setSelectedTrack(track.id)}
                  isSelected={selectedTrack === track.id}
                  isPlaying={isPlaying}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                />
              ))}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar 
            orientation="vertical"
            className="flex select-none touch-none p-0.5 bg-[#1a1a1a] transition-colors duration-150 ease-out w-2"
          >
            <ScrollArea.Thumb className="flex-1 bg-[#333] rounded-lg relative" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </div>
  );
};

export default AudioEditor;