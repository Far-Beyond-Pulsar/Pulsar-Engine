import React from 'react';
import { Plus } from 'lucide-react';
import { UIElement } from '../types/UIElement';
import { ELEMENT_TYPES } from '../utils/constants';
import { useUIElements } from '../contexts/UIEditorContext';
import { reorderElements } from '../utils/elementUtils';

interface HierarchyProps {
  elements: UIElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
}

const Hierarchy: React.FC<HierarchyProps> = ({ 
  elements, 
  selectedElement, 
  onSelectElement 
}) => {
  const { addElement, updateElement } = useUIElements();

  // Random element creation for quick testing
  const handleRandomElementAdd = () => {
    const elementTypes = Object.keys(ELEMENT_TYPES) as UIElement['type'][];
    const randomType = elementTypes[Math.floor(Math.random() * elementTypes.length)];
    addElement(randomType);
  };

  // Layer management handlers
  const handleLayerChange = (elementId: string, direction: 'up' | 'down' | 'front' | 'back') => {
    const reorderedElements = reorderElements(elements, elementId, direction);
    
    // Update elements with new z-index or order
    reorderedElements.forEach((el, index) => {
      updateElement(el.id, { zIndex: index });
    });
  };

  return (
    <div className="w-64 border-r border-neutral-800">
      <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="text-sm font-medium">Hierarchy</h2>
        <button 
          className="p-1 hover:bg-neutral-800 rounded"
          onClick={handleRandomElementAdd}
          title="Add Random Element"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="p-2">
        <div className="space-y-1">
          {elements.length > 0 ? (
            elements.map(element => {
              const ElementIcon = ELEMENT_TYPES[element.type].icon;
              return (
                <div 
                  key={element.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer group ${
                    selectedElement === element.id 
                      ? 'bg-neutral-800' 
                      : 'hover:bg-neutral-800'
                  }`}
                >
                  <div 
                    className="flex items-center flex-1"
                    onClick={() => onSelectElement(element.id)}
                  >
                    <ElementIcon size={14} className="mr-2 text-neutral-400" />
                    <span className="text-sm">
                      {ELEMENT_TYPES[element.type].name} {element.id.slice(-4)}
                    </span>
                  </div>
                  
                  {/* Layer Management Buttons */}
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleLayerChange(element.id, 'up')}
                      className="text-neutral-500 hover:text-white"
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button 
                      onClick={() => handleLayerChange(element.id, 'down')}
                      className="text-neutral-500 hover:text-white"
                      title="Move Down"
                    >
                      ↓
                    </button>
                  </div>
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
  );
};

export default Hierarchy;