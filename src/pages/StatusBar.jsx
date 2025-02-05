import React, { useState, useEffect } from 'react';
import { AlertCircle, Cpu, HardDrive, Activity, Clock, GitBranch } from 'lucide-react';

const StatusBar = ({ 
  tabs, 
  showNewTabMenu, 
  fps, 
  memoryUsage,
  rustAnalyzer = {
    status: 'running',
    diagnostics: 0,
    inlayHints: true,
    version: '0.4.0',
    details: {
      parseErrors: 0,
      typeErrors: 0,
      warnings: 0
    }
  },
  engineMetrics = {
    drawCalls: 0,
    entityCount: 0,
    physicsObjects: 0,
    cpuUsage: 0,
    gpuUsage: 0,
    frameTime: 0,
    gcStats: {
      collections: 0,
      pauseTime: 0
    }
  },
  gitInfo = {
    branch: 'main',
    modified: false,
    lastCommit: '',
    uncommittedFiles: []
  },
  memoryDetails = {
    total: 0,
    used: 0,
    peak: 0,
    allocations: 0
  }
}) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [activePopover, setActivePopover] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getAnalyzerStatusColor = (status) => {
    switch (status) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  // Tooltip/Popover Components
  const RustAnalyzerPopover = () => (
    <div className="absolute bottom-8 left-0 bg-black border border-neutral-800 rounded p-3 min-w-64 shadow-lg">
      <h3 className="text-neutral-200 font-medium mb-2">Rust Analyzer Status</h3>
      <div className="grid gap-2 text-neutral-400">
        <div className="flex justify-between">
          <span>Version:</span>
          <span>{rustAnalyzer.version}</span>
        </div>
        <div className="flex justify-between">
          <span>Parse Errors:</span>
          <span>{rustAnalyzer.details.parseErrors}</span>
        </div>
        <div className="flex justify-between">
          <span>Type Errors:</span>
          <span>{rustAnalyzer.details.typeErrors}</span>
        </div>
        <div className="flex justify-between">
          <span>Warnings:</span>
          <span>{rustAnalyzer.details.warnings}</span>
        </div>
        <div className="flex justify-between">
          <span>Inlay Hints:</span>
          <span>{rustAnalyzer.inlayHints ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
    </div>
  );

  const GitPopover = () => (
    <div className="absolute bottom-8 left-0 bg-black border border-neutral-800 rounded p-3 min-w-64 shadow-lg">
      <h3 className="text-neutral-200 font-medium mb-2">Git Status</h3>
      <div className="grid gap-2 text-neutral-400">
        <div className="flex justify-between">
          <span>Branch:</span>
          <span>{gitInfo.branch}</span>
        </div>
        <div className="flex justify-between">
          <span>Modified:</span>
          <span className={gitInfo.modified ? 'text-yellow-500' : 'text-green-500'}>
            {gitInfo.modified ? 'Yes' : 'No'}
          </span>
        </div>
        {gitInfo.lastCommit && (
          <div className="flex justify-between">
            <span>Last Commit:</span>
            <span>{gitInfo.lastCommit.substring(0, 7)}</span>
          </div>
        )}
        {gitInfo.uncommittedFiles.length > 0 && (
          <div className="mt-2">
            <div className="text-neutral-200 mb-1">Uncommitted Files:</div>
            <div className="text-xs max-h-32 overflow-y-auto">
              {gitInfo.uncommittedFiles.map((file, i) => (
                <div key={i} className="text-yellow-500">{file}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const PerformancePopover = () => (
    <div className="absolute bottom-8 right-0 bg-black border border-neutral-800 rounded p-3 min-w-64 shadow-lg">
      <h3 className="text-neutral-200 font-medium mb-2">Performance Metrics</h3>
      <div className="grid gap-2 text-neutral-400">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={fps < 30 ? 'text-red-500' : 'text-green-500'}>{fps}</span>
        </div>
        <div className="flex justify-between">
          <span>Frame Time:</span>
          <span>{engineMetrics.frameTime.toFixed(2)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>Draw Calls:</span>
          <span>{engineMetrics.drawCalls}</span>
        </div>
        <div className="flex justify-between">
          <span>Entities:</span>
          <span>{engineMetrics.entityCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Physics Objects:</span>
          <span>{engineMetrics.physicsObjects}</span>
        </div>
        <div className="flex justify-between">
          <span>CPU Usage:</span>
          <span>{engineMetrics.cpuUsage}%</span>
        </div>
        <div className="flex justify-between">
          <span>GPU Usage:</span>
          <span>{engineMetrics.gpuUsage}%</span>
        </div>
      </div>
    </div>
  );

  const MemoryPopover = () => (
    <div className="absolute bottom-8 right-0 bg-black border border-neutral-800 rounded p-3 min-w-64 shadow-lg">
      <h3 className="text-neutral-200 font-medium mb-2">Memory Usage</h3>
      <div className="grid gap-2 text-neutral-400">
        <div className="flex justify-between">
          <span>Current:</span>
          <span>{memoryUsage} MB</span>
        </div>
        <div className="flex justify-between">
          <span>Peak:</span>
          <span>{memoryDetails.peak} MB</span>
        </div>
        <div className="flex justify-between">
          <span>Total Allocated:</span>
          <span>{memoryDetails.total} MB</span>
        </div>
        <div className="flex justify-between">
          <span>Allocations:</span>
          <span>{memoryDetails.allocations}</span>
        </div>
        <div className="flex justify-between">
          <span>GC Collections:</span>
          <span>{engineMetrics.gcStats.collections}</span>
        </div>
        <div className="flex justify-between">
          <span>GC Pause Time:</span>
          <span>{engineMetrics.gcStats.pauseTime}ms</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-6 bg-black border-t border-neutral-800 px-2 flex items-center text-xs">
      {/* Left section */}
      <div className="flex items-center space-x-4 flex-1">
        <div 
          className="relative flex items-center gap-1 text-neutral-400 cursor-pointer hover:text-neutral-200"
          onClick={() => setActivePopover(activePopover === 'rustAnalyzer' ? null : 'rustAnalyzer')}
        >
          <AlertCircle size={14} className={getAnalyzerStatusColor(rustAnalyzer.status)} />
          <span>Rust Analyzer: {rustAnalyzer.diagnostics} issues</span>
          {activePopover === 'rustAnalyzer' && <RustAnalyzerPopover />}
        </div>
        
        <div 
          className="relative flex items-center gap-1 text-neutral-400 cursor-pointer hover:text-neutral-200"
          onClick={() => setActivePopover(activePopover === 'git' ? null : 'git')}
        >
          <GitBranch size={14} />
          <span className={gitInfo.modified ? 'text-yellow-500' : ''}>
            {gitInfo.branch}
          </span>
          {activePopover === 'git' && <GitPopover />}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <div 
          className="relative flex items-center gap-1 text-neutral-400 cursor-pointer hover:text-neutral-200"
          onClick={() => setActivePopover(activePopover === 'performance' ? null : 'performance')}
        >
          <Activity size={14} />
          <span>FPS: {fps}</span>
          {activePopover === 'performance' && <PerformancePopover />}
        </div>

        <div 
          className="relative flex items-center gap-1 text-neutral-400 cursor-pointer hover:text-neutral-200"
          onClick={() => setActivePopover(activePopover === 'memory' ? null : 'memory')}
        >
          <HardDrive size={14} />
          <span>{memoryUsage} MB</span>
          {activePopover === 'memory' && <MemoryPopover />}
        </div>

        <div className="flex items-center gap-1 text-neutral-400">
          <Clock size={14} />
          <span>{currentTime}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;