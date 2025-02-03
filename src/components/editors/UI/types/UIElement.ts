import { LucideIcon } from 'lucide-react';

// Base properties for all UI elements
export interface BaseUIElement {
  id: string;
  type: 'rectangle' | 'text' | 'note' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  locked?: boolean;
}

// Rectangle-specific properties
export interface RectangleElement extends BaseUIElement {
  type: 'rectangle';
  backgroundColor: string;
  borderRadius: number;
  opacity: number;
}

// Text-specific properties
export interface TextElement extends BaseUIElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

// Sticky Note properties
export interface NoteElement extends BaseUIElement {
  type: 'note';
  content: string;
  backgroundColor: string;
  borderRadius: number;
}

// Image-specific properties
export interface ImageElement extends BaseUIElement {
  type: 'image';
  src: string;
  opacity: number;
}

// Union type for all possible UI elements
export type UIElement = 
  | RectangleElement 
  | TextElement 
  | NoteElement 
  | ImageElement;

// Element Type Configuration
export interface ElementTypeConfig {
  name: string;
  icon: LucideIcon;
  defaultProps: Partial<UIElement>;
}

// Type for the UI Elements Context
export interface UIElementsContextType {
  elements: UIElement[];
  selectedElement: string | null;
  addElement: (type: UIElement['type']) => void;
  updateElement: (id: string, updates: Partial<UIElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string | null) => void;
}