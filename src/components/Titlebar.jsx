import React from 'react';

const Titlebar = ({ isMaximized, onMinimize, onMaximize, onClose }) => (
  <div className={`h-8 bg-black border-b border-blue-900/20 flex items-center justify-between relative
    ${isMaximized ? '' : 'rounded-t-lg'}`} data-tauri-drag-region>
    <div className="flex items-center gap-2 px-3 relative z-10 pointer-events-none">
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.5) 0%, transparent 80%)',
          width: '180px', 
          height: '180px', 
          top: '-90px', 
          left: '40px',
        }} 
      />
      <span className="text-blue-500 animate-pulse pointer-events-none">◆</span>
      <span className="text-blue-500 font-medium pointer-events-none">PULSAR ENGINE</span>
    </div>
    <div className="flex h-full">
      <button onClick={onMinimize}
        className="w-12 h-full flex items-center justify-center hover:bg-blue-900/10 text-gray-400 hover:text-blue-500 transition-colors">
        ─
      </button>
      <button onClick={onMaximize}
        className="w-12 h-full flex items-center justify-center hover:bg-blue-900/10 text-gray-400 hover:text-blue-500 transition-colors">
        □
      </button>
      <button onClick={onClose}
        className="w-12 h-full flex items-center justify-center hover:bg-red-900/20 hover:text-red-500 text-gray-400 transition-colors">
        ×
      </button>
    </div>
  </div>
);

export default Titlebar;