import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PanelProps, Position, Size } from './types';
import { PanelButton } from './PanelButton';

export const DockablePanel: React.FC<PanelProps> = ({
  id,
  title,
  children,
  isVisible,
  onClose,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { width: 300, height: 400 },
  onMove,
  onResize,
  className = '',
  defaultDock = null
}) => {
  const [isFloating, setIsFloating] = useState(false);
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [size, setSize] = useState<Size>(defaultSize);
  const [isPopped, setIsPopped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
  
  const panelRef = useRef<HTMLDivElement>(null);
  const popupWindowRef = useRef<Window | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isFloating) {
      setIsFloating(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({ x: rect.left, y: rect.top });
      }
    }

    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
      startX: e.clientX,
      startY: e.clientY
    });
  }, [position, isFloating]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
      onMove?.({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, onMove]);

  const handlePopOut = useCallback(() => {
    const width = typeof size.width === 'number' ? size.width : 400;
    const height = typeof size.height === 'number' ? size.height : 500;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popupWindow = window.open(
      '',
      id,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes`
    );

    if (popupWindow) {
      popupWindow.document.title = title;
      setIsPopped(true);
      popupWindowRef.current = popupWindow;

      const style = popupWindow.document.createElement('style');
      style.textContent = `
        body {
          margin: 0;
          padding: 0;
          background-color: #000000;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }
      `;
      popupWindow.document.head.appendChild(style);

      popupWindow.addEventListener('beforeunload', () => {
        setIsPopped(false);
        popupWindowRef.current = null;
      });
    }
  }, [id, title, size]);

  const handleDock = () => {
    setIsFloating(false);
  };

  const getDockStyles = () => {
    if (isFloating) {
      return {
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 1000
      };
    }
  
    switch (defaultDock) {
      case 'left':
        return {
          position: 'relative',
          width: defaultSize.width,
          height: '100%',
          flexShrink: 0,
          zIndex: 1
        };
      case 'right':
        return {
          position: 'relative',
          width: defaultSize.width,
          height: '100%',
          flexShrink: 0,
          zIndex: 1
        };
      case 'bottom':
        return {
          position: 'relative',
          width: '100%',
          height: defaultSize.height,
          zIndex: 1
        };
      default:
        return {
          position: 'relative',
          width: defaultSize.width,
          height: defaultSize.height,
          flex: 1,
          zIndex: 1
        };
    }
  };

  const handleResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = typeof size.width === 'number' ? size.width : panelRef.current?.offsetWidth || 200;
    const startHeight = typeof size.height === 'number' ? size.height : panelRef.current?.offsetHeight || 100;

    const handleResizeMove = (e: MouseEvent) => {
      const width = Math.max(200, startWidth + (e.clientX - startX));
      const height = Math.max(100, startHeight + (e.clientY - startY));
      setSize({ width, height });
      onResize?.({ width, height });
    };

    const handleResizeEnd = () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  }, [size, onResize]);

  const renderContent = () => (
    <div
      ref={panelRef}
      className={`${isDragging ? 'cursor-move' : ''} ${className} ${isFloating ? 'shadow-lg rounded-lg' : ''}`}
      style={{
        ...getDockStyles(),
        display: isVisible ? 'flex' : 'none',
        flexDirection: 'column',
        minWidth: '200px',
        minHeight: '100px',
        zIndex: isDragging || isFloating ? 9999 : 1,
        backgroundColor: '#000000',
        border: isFloating ? '1px solid #333333' : 'none'
      } as React.CSSProperties}
    >
      <div 
        className="flex items-center justify-between p-2 select-none cursor-move w-full"
        style={{
          backgroundColor: '#000000',
          ...(isFloating && {
            background: 'radial-gradient(circle at 100px 20px, rgba(37, 99, 235, 0.5) -20px, transparent 90px)',
          })
        }}
        onMouseDown={handleMouseDown}
      >
        <span className="font-medium">{title}</span>
        <div className="flex items-center gap-2 ml-auto">
          {!isPopped && (
            <PanelButton
              onClick={handlePopOut}
              title="Pop out"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </PanelButton>
          )}
          {isFloating && (
            <PanelButton
              onClick={handleDock}
              title="Dock"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </PanelButton>
          )}
          <PanelButton
            onClick={onClose}
            title="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </PanelButton>
        </div>
      </div>

      <div 
        className="flex-1 overflow-auto p-4"
        style={{
          backgroundColor: '#000000'
        }}
      >
        {children}
      </div>

      {isFloating && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResize}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.1) 50%)'
          }}
        />
      )}
    </div>
  );

  if (isPopped && popupWindowRef.current) {
    return createPortal(
      renderContent(),
      popupWindowRef.current.document.body
    );
  }

  return renderContent();
};