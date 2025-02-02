import React from 'react';
import { 
  UIElement, 
  RectangleElement, 
  TextElement, 
  NoteElement, 
  ImageElement 
} from '../types/UIElement';
import { COLOR_PALETTE } from '../utils/constants';
import { getTextStyles } from '../utils/elementUtils';

interface PropertiesPanelProps {
  elements: UIElement[];
  selectedElement: string | null;
  onUpdateElement: (id: string, updates: Partial<UIElement>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  elements, 
  selectedElement, 
  onUpdateElement 
}) => {
  // Find the selected element
  const element = selectedElement 
    ? elements.find(el => el.id === selectedElement) 
    : null;

  // No element selected
  if (!element) {
    return (
      <div className="w-80 border-l border-neutral-800 flex items-center justify-center">
        <p className="text-neutral-500">Select an element to edit</p>
      </div>
    );
  }

  // Update element wrapper to avoid repetition
  const updateElement = (updates: Partial<UIElement>) => {
    onUpdateElement(element.id, updates);
  };

  // Render position and size controls
  const renderPositionControls = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-neutral-400 mb-1">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">X</label>
            <input 
              type="number" 
              value={element.x} 
              onChange={(e) => updateElement({ x: parseInt(e.target.value) })}
              className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Y</label>
            <input 
              type="number" 
              value={element.y} 
              onChange={(e) => updateElement({ y: parseInt(e.target.value) })}
              className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Size</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Width</label>
            <input 
              type="number" 
              value={element.width} 
              onChange={(e) => updateElement({ width: parseInt(e.target.value) })}
              className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Height</label>
            <input 
              type="number" 
              value={element.height} 
              onChange={(e) => updateElement({ height: parseInt(e.target.value) })}
              className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render color palette selection
  const renderColorPalette = (
    currentColor: string, 
    onColorChange: (color: string) => void
  ) => (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <div 
          className="w-8 h-8 rounded" 
          style={{ backgroundColor: currentColor }}
        ></div>
        <input 
          type="text" 
          value={currentColor} 
          onChange={(e) => onColorChange(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm flex-1" 
        />
      </div>
      <div className="flex space-x-1">
        {COLOR_PALETTE.map(color => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className="w-6 h-6 rounded"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );

  // Render type-specific properties
  const renderTypeSpecificProperties = () => {
    switch (element.type) {
      case 'rectangle':
        const rectangleElement = element as RectangleElement;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Background Color</label>
              {renderColorPalette(
                rectangleElement.backgroundColor, 
                (color) => updateElement({ backgroundColor: color })
              )}
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Border Radius</label>
              <input 
                type="number" 
                value={rectangleElement.borderRadius} 
                onChange={(e) => updateElement({ borderRadius: parseInt(e.target.value) })}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Opacity</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={rectangleElement.opacity}
                onChange={(e) => updateElement({ opacity: parseFloat(e.target.value) })}
                className="w-full bg-neutral-800" 
              />
            </div>
          </div>
        );

      case 'text':
        const textElement = element as TextElement;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Content</label>
              <input 
                type="text" 
                value={textElement.content} 
                onChange={(e) => updateElement({ content: e.target.value })}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Font Size</label>
                <input 
                  type="number" 
                  value={textElement.fontSize} 
                  onChange={(e) => updateElement({ fontSize: parseInt(e.target.value) })}
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Font Weight</label>
                <select 
                  value={textElement.fontWeight}
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
              <label className="block text-sm text-neutral-400 mb-1">Text Color</label>
              {renderColorPalette(
                textElement.color, 
                (color) => updateElement({ color: color })
              )}
            </div>
          </div>
        );

      case 'note':
        const noteElement = element as NoteElement;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Content</label>
              <textarea 
                value={noteElement.content} 
                onChange={(e) => updateElement({ content: e.target.value })}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full h-24" 
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Background Color</label>
              {renderColorPalette(
                noteElement.backgroundColor, 
                (color) => updateElement({ backgroundColor: color })
              )}
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Border Radius</label>
              <input 
                type="number" 
                value={noteElement.borderRadius} 
                onChange={(e) => updateElement({ borderRadius: parseInt(e.target.value) })}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
              />
            </div>
          </div>
        );

      case 'image':
        const imageElement = element as ImageElement;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Image URL</label>
              <input 
                type="text" 
                value={imageElement.src} 
                onChange={(e) => updateElement({ src: e.target.value })}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full" 
                placeholder="Paste image URL"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Opacity</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={imageElement.opacity}
                onChange={(e) => updateElement({ opacity: parseFloat(e.target.value) })}
                className="w-full bg-neutral-800" 
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 border-l border-neutral-800">
      <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
        <span className="text-sm text-neutral-400">
          {`${element.type.charAt(0).toUpperCase() + element.type.slice(1)} Properties`}
        </span>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100vh-2rem)] space-y-6">
        {renderPositionControls()}
        {renderTypeSpecificProperties()}
      </div>
    </div>
  );
};

export default PropertiesPanel;