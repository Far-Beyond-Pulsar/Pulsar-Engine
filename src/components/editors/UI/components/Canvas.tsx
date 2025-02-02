import React, { 
    forwardRef, 
    useState, 
    useCallback,
    useRef
  } from 'react';
  import { useDrag, useDrop } from 'react-dnd';
  import { 
    Trash2, 
    Copy, 
    Edit 
  } from 'lucide-react';
  
  import { 
    UIElement, 
    RectangleElement, 
    TextElement, 
    NoteElement, 
    ImageElement 
  } from '../types/UIElement';
  import { ELEMENT_TYPES } from '../utils/constants';
  import { getTextStyles, snapToGrid } from '../utils/elementUtils';
  
  interface CanvasProps {
    elements: UIElement[];
    selectedElement: string | null;
    onSelectElement: (id: string | null) => void;
    onUpdateElement: (id: string, updates: Partial<UIElement>) => void;
    onDeleteElement: (id: string) => void;
  }
  
  const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({ 
    elements, 
    selectedElement, 
    onSelectElement,
    onUpdateElement,
    onDeleteElement
  }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{x: number, y: number, elementX: number, elementY: number} | null>(null);
  
    // Handle element dragging
    const handleMouseDown = (
      event: React.MouseEvent, 
      element: UIElement
    ) => {
      // Prevent text selection during drag
      event.preventDefault();
  
      // Store the initial mouse position and element position
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        elementX: element.x,
        elementY: element.y
      };
  
      onSelectElement(element.id);
      setIsDragging(true);
    };
  
    // Handle mouse move during dragging
    const handleMouseMove = useCallback((event: React.MouseEvent) => {
      if (!isDragging || !selectedElement || !dragStartRef.current) return;
  
      const rect = event.currentTarget.getBoundingClientRect();
      
      // Calculate the total mouse movement since drag started
      const deltaX = event.clientX - dragStartRef.current.x;
      const deltaY = event.clientY - dragStartRef.current.y;
  
      // Calculate new position, snapping to grid
      const newX = snapToGrid(dragStartRef.current.elementX + deltaX);
      const newY = snapToGrid(dragStartRef.current.elementY + deltaY);
  
      onUpdateElement(selectedElement, { x: newX, y: newY });
    }, [isDragging, selectedElement, onUpdateElement]);
  
    // Stop dragging
    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };
  
    // Render element content based on type
    const renderElementContent = (element: UIElement) => {
      switch (element.type) {
        case 'rectangle':
          return null;
        
        case 'text':
          const textEl = element as TextElement;
          return (
            <div 
              style={{
                ...getTextStyles(textEl),
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {textEl.content}
            </div>
          );
        
        case 'note':
          const noteEl = element as NoteElement;
          return (
            <div 
              style={{
                width: '100%',
                height: '100%',
                padding: '10px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              {noteEl.content}
            </div>
          );
        
        case 'image':
          const imageEl = element as ImageElement;
          return imageEl.src ? (
            <img 
              src={imageEl.src} 
              alt="Element" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : null;
        
        default:
          return null;
      }
    };
  
    // Render individual elements on canvas
    const renderCanvasElements = () => {
      return elements.map(element => {
        const ElementIcon = ELEMENT_TYPES[element.type].icon;
        
        // Dynamic styling based on element type
        const getElementStyle = () => {
          const baseStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
            cursor: 'move',
            border: selectedElement === element.id 
              ? '2px solid #4ECDC4' 
              : '1px solid transparent'
          };
  
          switch (element.type) {
            case 'rectangle':
              const rectEl = element as RectangleElement;
              return {
                ...baseStyle,
                backgroundColor: rectEl.backgroundColor,
                borderRadius: `${rectEl.borderRadius}px`,
                opacity: rectEl.opacity
              };
            
            case 'note':
              const noteEl = element as NoteElement;
              return {
                ...baseStyle,
                backgroundColor: noteEl.backgroundColor,
                borderRadius: `${noteEl.borderRadius}px`
              };
            
            case 'image':
              const imageEl = element as ImageElement;
              return {
                ...baseStyle,
                opacity: imageEl.opacity
              };
            
            default:
              return baseStyle;
          }
        };
  
        return (
          <div
            key={element.id}
            style={getElementStyle()}
            onMouseDown={(e) => handleMouseDown(e, element)}
            onClick={() => onSelectElement(element.id)}
            className="group"
          >
            {renderElementContent(element)}
            
            {/* Element action buttons when selected */}
            {selectedElement === element.id && (
              <div className="absolute -top-8 left-0 flex space-x-1 bg-neutral-900 p-1 rounded">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement duplicate
                  }}
                  className="p-1 hover:bg-neutral-800 rounded"
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Delete clicked:', element.id);
                    onDeleteElement(element.id);
                  }}
                  className="p-1 hover:bg-neutral-800 rounded"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        );
      });
    };
  
    return (
      <div 
        ref={ref}
        className="flex-1 relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {renderCanvasElements()}
      </div>
    );
  });
  
  export default Canvas;