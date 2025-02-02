import React, { useState, useRef, useReducer, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Layers, Mouse, Layout, Type, Image, Square, Plus, AlignLeft, 
  Move, Scale, Trash2, Copy, Edit, BorderRadius, Scaling, 
  Palette, Opacity, Text, TextCursor, StickyNote, Columns
} from 'lucide-react';

// Utility function to generate unique IDs
const generateId = () => `element_${Math.random().toString(36).substr(2, 9)}`;

// Predefined color palette
const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', 
  '#6C5CE7', '#A8E6CF', '#FF8ED4', '#FAD390',
  '#55E6C1', '#5F27CD', '#48DBFB', '#FF9FF3'
];

// Element type configurations
const ELEMENT_TYPES = {
  rectangle: {
    name: 'Rectangle',
    icon: Square,
    defaultProps: {
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
      src: '',
      width: 200,
      height: 200,
      opacity: 1
    }
  },
  note: {
    name: 'Sticky Note',
    icon: StickyNote,
    defaultProps: {
      content: 'New Note',
      backgroundColor: '#FDCB6E',
      width: 250,
      height: 200,
      borderRadius: 8
    }
  }
};

// Reducer for managing UI elements
function uiElementsReducer(state, action) {
  switch (action.type) {
    case 'ADD_ELEMENT':
      return [...state, {
        id: generateId(),
        type: action.elementType,
        x: 100,
        y: 100,
        ...ELEMENT_TYPES[action.elementType].defaultProps
      }];
    case 'UPDATE_ELEMENT':
      return state.map(element => 
        element.id === action.id 
          ? { ...element, ...action.updates }
          : element
      );
    case 'DELETE_ELEMENT':
      return state.filter(element => element.id !== action.id);
    case 'DUPLICATE_ELEMENT':
      const elementToDuplicate = state.find(el => el.id === action.id);
      if (elementToDuplicate) {
        return [...state, {
          ...elementToDuplicate,
          id: generateId(),
          x: elementToDuplicate.x + 20,
          y: elementToDuplicate.y + 20
        }];
      }
      return state;
    default:
      return state;
  }
}

const UIEditor = () => {
  const [activeTab, setActiveTab] = useState('select');
  const [selectedElement, setSelectedElement] = useState(null);
  const [uiElements, dispatch] = useReducer(uiElementsReducer, []);
  const canvasRef = useRef(null);

  // Handle element creation
  const handleAddElement = (elementType) => {
    dispatch({ type: 'ADD_ELEMENT', elementType });
  };

  // Handle element selection
  const handleElementSelect = (elementId) => {
    setSelectedElement(elementId);
    setActiveTab('properties');
  };

  // Render different property inputs based on element type
  const renderElementProperties = () => {
    if (!selectedElement) return null;

    const element = uiElements.find(el => el.id === selectedElement);
    if (!element) return null;

    const updateElement = (updates) => {
      dispatch({
        type: 'UPDATE_ELEMENT',
        id: selectedElement,
        updates
      });
    };

    return (
      <div className="space-y-4">
        {/* Positioning */}
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">X</label>
              <input 
                type="number" 
                value={element.x || 0} 
                onChange={(e) => updateElement({ x: parseInt(e.target.value) })}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Y</label>
              <input 
                type="number" 
                value={element.y || 0} 
                onChange={(e) => updateElement({ y: parseInt(e.target.value) })}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Width</label>
              <input 
                type="number" 
                value={element.width || 0} 
                onChange={(e) => updateElement({ width: parseInt(e.target.value) })}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Height</label>
              <input 
                type="number" 
                value={element.height || 0} 
                onChange={(e) => updateElement({ height: parseInt(e.target.value) })}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
              />
            </div>
          </div>
        </div>

        {/* Type-specific properties */}
        {element.type === 'rectangle' && (
          <>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Style</label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Background Color</label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded" 
                      style={{ backgroundColor: element.backgroundColor }}
                    ></div>
                    <input 
                      type="text" 
                      value={element.backgroundColor || '#3B82F6'} 
                      onChange={(e) => updateElement({ backgroundColor: e.target.value })}
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm flex-1" 
                    />
                  </div>
                  <div className="flex space-x-1 mt-2">
                    {COLOR_PALETTE.map(color => (
                      <button
                        key={color}
                        onClick={() => updateElement({ backgroundColor: color })}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Border Radius</label>
                  <input 
                    type="number" 
                    value={element.borderRadius || 0} 
                    onChange={(e) => updateElement({ borderRadius: parseInt(e.target.value) })}
                    className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Opacity</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={element.opacity || 1}
                    onChange={(e) => updateElement({ opacity: parseFloat(e.target.value) })}
                    className="w-full bg-neutral-800" 
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {element.type === 'text' && (
          <>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Text Properties</label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Content</label>
                  <input 
                    type="text" 
                    value={element.content || ''} 
                    onChange={(e) => updateElement({ content: e.target.value })}
                    className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Font Size</label>
                    <input 
                      type="number" 
                      value={element.fontSize || 16} 
                      onChange={(e) => updateElement({ fontSize: parseInt(e.target.value) })}
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Font Weight</label>
                    <select 
                      value={element.fontWeight || 400}
                      onChange={(e) => updateElement({ fontWeight: parseInt(e.target.value) })}
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full"
                    >
                      <option value="300">Light</option>
                      <option value="400">Regular</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Text Color</label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded" 
                      style={{ backgroundColor: element.color }}
                    ></div>
                    <input 
                      type="text" 
                      value={element.color || '#FFFFFF'} 
                      onChange={(e) => updateElement({ color: e.target.value })}
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm flex-1" 
                    />
                  </div>
                  <div className="flex space-x-1 mt-2">
                    {COLOR_PALETTE.map(color => (
                      <button
                        key={color}
                        onClick={() => updateElement({ color: color })}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render UI elements on canvas
  const renderCanvasElements = () => {
    return uiElements.map(element => {
      const ElementIcon = ELEMENT_TYPES[element.type].icon;
      
      const elementStyle = {
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        backgroundColor: element.backgroundColor,
        borderRadius: `${element.borderRadius}px`,
        opacity: element.opacity,
        cursor: 'move',
        border: selectedElement === element.id 
          ? '2px solid #4ECDC4' 
          : '1px solid transparent'
      };

      const renderElementContent = () => {
        switch (element.type) {
          case 'rectangle':
            return null;
          case 'text':
            return (
              <div 
                style={{
                  fontSize: `${element.fontSize}px`,
                  fontWeight: element.fontWeight,
                  color: element.color,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {element.content}
              </div>
            );
          case 'note':
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
                {element.content}
              </div>
            );
          default:
            return null;
        }
      };

      return (
        <div
          key={element.id}
          style={elementStyle}
          onClick={() => handleElementSelect(element.id)}
          className="group"
        >
          {renderElementContent()}
          {selectedElement === element.id && (
            <div className="absolute -top-8 left-0 flex space-x-1 bg-neutral-900 p-1 rounded">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'DUPLICATE_ELEMENT', id: element.id });
                }}
                className="p-1 hover:bg-neutral-800 rounded"
                title="Duplicate"
              >
                <Copy size={14} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'DELETE_ELEMENT', id: element.id });
                  setSelectedElement(null);
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
    <div className="flex h-screen bg-black text-white">
      {/* Left Toolbar */}
      <div className="w-12 border-r border-neutral-800 flex flex-col">
        {/* Selection Tools */}
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'select' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('select')}
          title="Select"
        >
          <Mouse size={18} />
        </button>
        <button 
          className={`p-3 hover:bg-neutral-800 ${activeTab === 'move' ? 'bg-neutral-800' : ''}`}
          onClick={() => setActiveTab('move')}
          title="Move"
        >
          <Move size={18} />
        </button>
        
        {/* Divider */}
        <div className="h-px bg-neutral-800 my-2" />
        
        {/* Element Creation Tools */}
        {Object.entries(ELEMENT_TYPES).map(([type, { icon: Icon, name }]) => (
          <button 
            key={type}
            className={`p-3 hover:bg-neutral-800 ${activeTab === type ? 'bg-neutral-800' : ''}`}
            onClick={() => {
              setActiveTab(type);
              handleAddElement(type);
            }}
            title={name}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Hierarchy and Viewport */}
      <div className="flex-1 flex">
        {/* Left Panel - Hierarchy */}
        <div className="w-64 border-r border-neutral-800">
          <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-medium">Hierarchy</h2>
            <button 
              className="p-1 hover:bg-neutral-800 rounded"
              onClick={() => {
                const elementTypes = Object.keys(ELEMENT_TYPES);
                const randomType = elementTypes[Math.floor(Math.random() * elementTypes.length)];
                handleAddElement(randomType);
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="p-2">
            <div className="space-y-1">
              {uiElements.length > 0 ? (
                uiElements.map(element => {
                  const ElementIcon = ELEMENT_TYPES[element.type].icon;
                  return (
                    <div 
                      key={element.id}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        selectedElement === element.id 
                          ? 'bg-neutral-800' 
                          : 'hover:bg-neutral-800'
                      }`}
                      onClick={() => handleElementSelect(element.id)}
                    >
                      <ElementIcon size={14} className="mr-2 text-neutral-400" />
                      <span className="text-sm">{ELEMENT_TYPES[element.type].name} {element.id.slice(-4)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-neutral-500 text-center py-4">
                  No elements yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Viewport */}
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {renderCanvasElements()}
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-neutral-800">
          <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
            <span className="text-sm text-neutral-400">
              {selectedElement 
                ? `${ELEMENT_TYPES[uiElements.find(el => el.id === selectedElement)?.type].name} Properties` 
                : 'Element Properties'}
            </span>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-2rem)]">
            {selectedElement ? (
              renderElementProperties()
            ) : (
              <div className="text-sm text-neutral-500 text-center py-4">
                Select an element to edit its properties
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIEditor;