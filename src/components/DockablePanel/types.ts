import { ReactNode } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number | string;
  height: number | string;
}

export interface PanelProps {
  id: string;
  title: string;
  children: ReactNode;
  isVisible: boolean;
  onClose: () => void;
  defaultPosition?: Position;
  defaultSize?: Size;
  onMove?: (position: Position) => void;
  onResize?: (size: Size) => void;
  className?: string;
  defaultDock?: 'left' | 'right' | 'bottom' | null;
}