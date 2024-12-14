import { useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

export const useDraggablePanel = (initialPosition: Position = { x: 0, y: 0 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('panel-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return { position, isDragging, handleMouseDown };
};

// components/DockablePanel.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface PanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
}

export const DockablePanel: React.FC<PanelProps> = ({
  id,
  title,
  children,
  isVisible,
  onClose,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { width: 300, height: 400 }
}) => {
  const [isPopped, setIsPopped] = useState(false);
  const { position, isDragging, handleMouseDown } = useDraggablePanel(defaultPosition);
  const [size, setSize] = useState(defaultSize);

  const handlePopOut = () => {
    setIsPopped(true);
    const width = 800;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const windowFeatures = `width=${width},height=${height},left=${left},top=${top}`;
    window.open('', id, windowFeatures);
  };

  const panelContent = (
    <div
      className={`panel bg-gray-800 rounded-lg shadow-lg ${isDragging ? 'cursor-move' : ''}`}
      style={{
        position: isPopped ? 'static' : 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        display: isVisible ? 'flex' : 'none',
        flexDirection: 'column',
        minWidth: '200px',
        minHeight: '100px'
      }}
    >
      <div
        className="panel-header flex items-center justify-between p-2 bg-gray-700 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <span className="font-medium">{title}</span>
        <div className="flex gap-2">
          {!isPopped && (
            <button
              onClick={handlePopOut}
              className="p-1 hover:bg-gray-600 rounded"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-600 rounded"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = size.width;
          const startHeight = size.height;

          const handleResize = (e: MouseEvent) => {
            setSize({
              width: Math.max(200, startWidth + e.clientX - startX),
              height: Math.max(100, startHeight + e.clientY - startY)
            });
          };

          const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', handleMouseUp);
          };

          window.addEventListener('mousemove', handleResize);
          window.addEventListener('mouseup', handleMouseUp);
        }}
      />
    </div>
  );

  if (isPopped) {
    const popupWindow = window.open('', id);
    if (popupWindow) {
      return createPortal(panelContent, popupWindow.document.body);
    }
  }

  return panelContent;
};

// PanelManager.tsx
import React, { useState } from 'react';

interface PanelState {
  id: string;
  title: string;
  isVisible: boolean;
  position: { x: number; y: number };
}

export const PanelManager: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [panels, setPanels] = useState<PanelState[]>([]);

  const registerPanel = (panel: PanelState) => {
    setPanels(prev => [...prev, panel]);
  };

  const togglePanel = (id: string) => {
    setPanels(prev =>
      prev.map(panel =>
        panel.id === id
          ? { ...panel, isVisible: !panel.isVisible }
          : panel
      )
    );
  };

  return (
    <div className="relative flex-1">
      {children}
    </div>
  );
};