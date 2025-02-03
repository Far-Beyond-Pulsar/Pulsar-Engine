import React, { useEffect, useState } from 'react';

let appWindow;

// Only import Tauri in browser environment
if (typeof window !== 'undefined') {
  import('@tauri-apps/api/window').then(({ appWindow: aw }) => {
    appWindow = aw;
  });
}

const Titlebar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    const initializeTauri = async () => {
      try {
        if (appWindow) {
          setIsTauri(true);
          const maximized = await appWindow.isMaximized();
          setIsMaximized(maximized);

          // Listen for window resize events
          const unlisten = await appWindow.listen('tauri://resize', async () => {
            const maximized = await appWindow.isMaximized();
            setIsMaximized(maximized);
          });

          return () => {
            unlisten();
          };
        }
      } catch (error) {
        console.log('Not in Tauri environment:', error);
      }
    };

    initializeTauri();
  }, []);

  const handleMinimize = async () => {
    try {
      if (appWindow) {
        await appWindow.minimize();
      }
    } catch (error) {
      console.log('Minimize action not available:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      if (appWindow) {
        const maximized = await appWindow.isMaximized();
        if (maximized) {
          await appWindow.unmaximize();
          setIsMaximized(false);
        } else {
          await appWindow.maximize();
          setIsMaximized(true);
        }
      }
    } catch (error) {
      console.log('Maximize action not available:', error);
    }
  };

  const handleClose = async () => {
    try {
      if (appWindow) {
        await appWindow.close();
      }
    } catch (error) {
      console.log('Close action not available:', error);
    }
  };

  return (
    <div 
      className={`h-8 bg-black border-b border-blue-900/20 flex items-center justify-between relative
        ${isMaximized ? '' : 'rounded-t-lg'}`} 
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2 px-3 relative z-10 pointer-events-none">
        <div 
          className="absolute pointer-events-none"
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
        <button
          onClick={handleMinimize}
          className="w-12 h-full flex items-center justify-center hover:bg-blue-900/10 text-gray-400 hover:text-blue-500 transition-colors"
        >
          ─
        </button>
        <button
          onClick={handleMaximize}
          className="w-12 h-full flex items-center justify-center hover:bg-blue-900/10 text-gray-400 hover:text-blue-500 transition-colors"
        >
          {isMaximized ? '❐' : '□'}
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-full flex items-center justify-center hover:bg-red-900/20 hover:text-red-500 text-gray-400 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Titlebar;