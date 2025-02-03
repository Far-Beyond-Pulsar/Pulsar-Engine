import { 
    Layers, 
    Mouse, 
    Layout, 
    Type, 
    Image, 
    Square, 
    Plus, 
    AlignLeft, 
    Move, 
    Scale, 
    Trash2, 
    Copy, 
    Edit, 
    Scaling, 
    Palette, 
    Text, 
    TextCursor, 
    StickyNote 
  } from 'lucide-react';
  import { ElementTypeConfig } from '../types/UIElement';
  
  // Color palette for elements
  export const COLOR_PALETTE = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', 
    '#6C5CE7', '#A8E6CF', '#FF8ED4', '#FAD390',
    '#55E6C1', '#5F27CD', '#48DBFB', '#FF9FF3'
  ];
  
  // Element type configurations (moved from previous utility)
  export const ELEMENT_TYPES: Record<string, ElementTypeConfig> = {
    rectangle: {
      name: 'Rectangle',
      icon: Square,
      defaultProps: {
        type: 'rectangle',
        width: 200,
        height: 100,
        backgroundColor: '#3B82F6',
        borderRadius: 4,
        opacity: 1
      }
    },
    text: {
      name: 'Text',
      icon: Type,
      defaultProps: {
        type: 'text',
        width: 200,
        height: 100,
        content: 'Sample Text',
        fontSize: 16,
        fontWeight: 400,
        color: '#FFFFFF'
      }
    },
    image: {
      name: 'Image',
      icon: Image,
      defaultProps: {
        type: 'image',
        width: 200,
        height: 200,
        src: '',
        opacity: 1
      }
    },
    note: {
      name: 'Sticky Note',
      icon: StickyNote,
      defaultProps: {
        type: 'note',
        width: 250,
        height: 200,
        content: 'New Note',
        backgroundColor: '#FDCB6E',
        borderRadius: 8
      }
    }
  };
  
  // Grid snapping configuration
  export const GRID_SIZE = 10;
  
  // Keyboard shortcut configuration
  export const KEYBOARD_SHORTCUTS = {
    DELETE_ELEMENT: ['Backspace', 'Delete'],
    DUPLICATE_ELEMENT: ['Control+D', 'Cmd+D'],
    COPY_ELEMENT: ['Control+C', 'Cmd+C'],
    PASTE_ELEMENT: ['Control+V', 'Cmd+V']
  };