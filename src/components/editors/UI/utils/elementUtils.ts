import { 
    UIElement, 
    ElementTypeConfig, 
    RectangleElement, 
    TextElement, 
    NoteElement, 
    ImageElement 
  } from '../types/UIElement';
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
    BorderRadius, 
    Scaling, 
    Palette, 
    Opacity, 
    Text, 
    TextCursor, 
    StickyNote 
  } from 'lucide-react';
  
  // Utility to generate unique IDs
  export const generateId = () => `element_${Math.random().toString(36).substr(2, 9)}`;
  
  // Color palette for elements
  export const COLOR_PALETTE = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', 
    '#6C5CE7', '#A8E6CF', '#FF8ED4', '#FAD390',
    '#55E6C1', '#5F27CD', '#48DBFB', '#FF9FF3'
  ];
  
  // Default element configurations
  export const ELEMENT_TYPES: Record<UIElement['type'], ElementTypeConfig> = {
    rectangle: {
      name: 'Rectangle',
      icon: Square,
      defaultProps: {
        width: 200,
        height: 100,
        type: 'rectangle',
        backgroundColor: '#3B82F6',
        borderRadius: 4,
        opacity: 1
      }
    },
    text: {
      name: 'Text',
      icon: Type,
      defaultProps: {
        width: 200,
        height: 100,
        type: 'text',
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
        width: 200,
        height: 200,
        type: 'image',
        src: '',
        opacity: 1
      }
    },
    note: {
      name: 'Sticky Note',
      icon: StickyNote,
      defaultProps: {
        width: 250,
        height: 200,
        type: 'note',
        content: 'New Note',
        backgroundColor: '#FDCB6E',
        borderRadius: 8
      }
    }
  };
  
  // Get default props for a specific element type
  export const getDefaultElementProps = (type: UIElement['type']): Partial<UIElement> => {
    return ELEMENT_TYPES[type].defaultProps;
  };
  
  // Export functionality
  export const exportUIElements = (elements: UIElement[]) => {
    const exportData = elements.map(element => {
      // Remove any runtime-specific properties
      const { id, ...exportableProps } = element;
      return exportableProps;
    });
  
    return {
      version: '1.0.0',
      elements: exportData,
      exportedAt: new Date().toISOString()
    };
  };
  
  // Import functionality
  export const importUIElements = (importData: any): UIElement[] => {
    if (!importData.elements) {
      throw new Error('Invalid import data');
    }
  
    return importData.elements.map((element: any) => ({
      ...element,
      id: generateId() // Regenerate ID to avoid conflicts
    }));
  };
  
  // Keyboard shortcut handler
  export const handleKeyboardShortcuts = (
    event: React.KeyboardEvent, 
    onDelete: () => void, 
    onDuplicate: () => void
  ) => {
    // Delete element (Backspace or Delete)
    if ((event.key === 'Backspace' || event.key === 'Delete') && !event.metaKey) {
      event.preventDefault();
      onDelete();
    }
  
    // Duplicate element (Cmd/Ctrl + D)
    if ((event.key === 'd' || event.key === 'D') && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onDuplicate();
    }
  };
  
  // Advanced positioning utils
  export const alignElements = (
    elements: UIElement[], 
    selectedElements: string[], 
    mode: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ): UIElement[] => {
    if (selectedElements.length < 2) return elements;
  
    const selectedElementsToAlign = elements.filter(el => selectedElements.includes(el.id));
    
    let referenceElement = selectedElementsToAlign[0];
    
    return elements.map(element => {
      if (!selectedElements.includes(element.id)) return element;
  
      switch (mode) {
        case 'left':
          return { ...element, x: referenceElement.x };
        case 'center':
          return { 
            ...element, 
            x: referenceElement.x + (referenceElement.width - element.width) / 2 
          };
        case 'right':
          return { 
            ...element, 
            x: referenceElement.x + referenceElement.width - element.width 
          };
        case 'top':
          return { ...element, y: referenceElement.y };
        case 'middle':
          return { 
            ...element, 
            y: referenceElement.y + (referenceElement.height - element.height) / 2 
          };
        case 'bottom':
          return { 
            ...element, 
            y: referenceElement.y + referenceElement.height - element.height 
          };
        default:
          return element;
      }
    });
  };
  
  // Layer management
  export const reorderElements = (
    elements: UIElement[], 
    elementId: string, 
    direction: 'up' | 'down' | 'front' | 'back'
  ): UIElement[] => {
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) return elements;
  
    const newElements = [...elements];
    const element = newElements[elementIndex];
  
    switch (direction) {
      case 'up':
        if (elementIndex < newElements.length - 1) {
          [newElements[elementIndex], newElements[elementIndex + 1]] = 
          [newElements[elementIndex + 1], newElements[elementIndex]];
        }
        break;
      case 'down':
        if (elementIndex > 0) {
          [newElements[elementIndex], newElements[elementIndex - 1]] = 
          [newElements[elementIndex - 1], newElements[elementIndex]];
        }
        break;
      case 'front':
        newElements.splice(elementIndex, 1);
        newElements.push(element);
        break;
      case 'back':
        newElements.splice(elementIndex, 1);
        newElements.unshift(element);
        break;
    }
  
    return newElements;
  };
  
  // Group elements
  export const groupElements = (
    elements: UIElement[], 
    selectedElements: string[]
  ): UIElement[] => {
    if (selectedElements.length < 2) return elements;
  
    const groupedElements = elements.filter(el => selectedElements.includes(el.id));
    
    // Calculate group bounds
    const minX = Math.min(...groupedElements.map(el => el.x));
    const minY = Math.min(...groupedElements.map(el => el.y));
    const maxX = Math.max(...groupedElements.map(el => el.x + el.width));
    const maxY = Math.max(...groupedElements.map(el => el.y + el.height));
  
    // Create group element
    const groupElement: UIElement = {
      id: generateId(),
      type: 'rectangle',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: 4,
      opacity: 0.5
    };
  
    // Remove original elements and add group
    return [
      ...elements.filter(el => !selectedElements.includes(el.id)),
      groupElement,
      ...groupedElements.map(el => ({
        ...el,
        x: el.x - minX,
        y: el.y - minY
      }))
    ];
  };
  
  // Snap to grid
  export const snapToGrid = (
    position: number, 
    gridSize: number = 10
  ): number => {
    return Math.round(position / gridSize) * gridSize;
  };
  
  // Resize element maintaining aspect ratio
  export const resizeElement = (
    element: UIElement, 
    newWidth?: number, 
    newHeight?: number, 
    maintainAspectRatio: boolean = false
  ): UIElement => {
    if (!newWidth && !newHeight) return element;
  
    let width = newWidth || element.width;
    let height = newHeight || element.height;
  
    if (maintainAspectRatio && newWidth) {
      const aspectRatio = element.width / element.height;
      height = width / aspectRatio;
    } else if (maintainAspectRatio && newHeight) {
      const aspectRatio = element.width / element.height;
      width = height * aspectRatio;
    }
  
    return { 
      ...element, 
      width: Math.max(10, width), 
      height: Math.max(10, height) 
    };
  };
  
  // Advanced color utilities
  export const adjustColor = (
    color: string, 
    amount: number
  ): string => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    
    const r = Math.min(255, Math.max(0, ((num >> 16) + amount)));
    const g = Math.min(255, Math.max(0, (((num >> 8) & 0x00FF) + amount)));
    const b = Math.min(255, Math.max(0, ((num & 0x0000FF) + amount)));
  
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };
  
  // Text styling utilities
  export const getTextStyles = (element: TextElement) => ({
    fontSize: `${element.fontSize}px`,
    fontWeight: element.fontWeight,
    color: element.color,
    fontFamily: element.fontFamily || 'Inter, sans-serif',
    textAlign: element.textAlign || 'center'
  });
  
  // Export as JSON or image
  export const exportUI = (
    elements: UIElement[], 
    exportType: 'json' | 'png' = 'json', 
    canvasRef?: React.RefObject<HTMLDivElement>
  ) => {
    if (exportType === 'json') {
      const exportData = exportUIElements(elements);
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(jsonBlob);
      link.download = `ui-export-${new Date().toISOString().replace(/:/g, '-')}.json`;
      link.click();
    } else if (exportType === 'png' && canvasRef?.current) {
      // TODO: Implement canvas screenshot export
      console.warn('PNG export not implemented yet');
    }
  };