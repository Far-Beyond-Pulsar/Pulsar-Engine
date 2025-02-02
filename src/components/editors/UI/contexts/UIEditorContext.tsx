import React, { 
  createContext, 
  useState, 
  useContext, 
  ReactNode 
} from 'react';
import { 
  UIElement, 
  UIElementsContextType 
} from '../types/UIElement';
import { 
  generateId, 
  getDefaultElementProps 
} from '../utils/elementUtils';
import { ELEMENT_TYPES } from '../utils/constants';

// Create the context with a default value
const UIElementsContext = createContext<UIElementsContextType>({
  elements: [],
  selectedElement: null,
  addElement: () => {},
  updateElement: () => {},
  deleteElement: () => {},
  duplicateElement: () => {},
  selectElement: () => {}
});

// Provider component
export const UIElementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<UIElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Add a new element
  const addElement = (type: UIElement['type']) => {
    const defaultProps = ELEMENT_TYPES[type].defaultProps;
    const newElement: UIElement = {
      ...defaultProps,
      id: generateId(),
      x: 50, // Default positioning
      y: 50
    } as UIElement;

    setElements(prevElements => {
      const updatedElements = [...prevElements, newElement];
      // Update zIndex to ensure new element is on top
      return updatedElements.map((el, index) => ({
        ...el,
        zIndex: index
      }));
    });

    // Select the newly added element
    setSelectedElement(newElement.id);
  };

  // Update an existing element
  const updateElement = (id: string, updates: Partial<UIElement>) => {
    setElements(prevElements => 
      prevElements.map(element => 
        element.id === id 
          ? { ...element, ...updates } as UIElement
          : element
      )
    );
  };

  // Delete an element
  const deleteElement = (id: string) => {
    setElements(prevElements => 
      prevElements.filter(element => element.id !== id)
    );
    
    // Clear selection if deleted element was selected
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  // Duplicate an element
  const duplicateElement = (id: string) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    
    if (elementToDuplicate) {
      const { id: _, ...elementWithoutId } = elementToDuplicate;
      
      const duplicatedElement: UIElement = {
        ...elementWithoutId,
        id: generateId(),
        x: elementToDuplicate.x + 20, // Offset duplicated element
        y: elementToDuplicate.y + 20
      };

      setElements(prevElements => {
        const updatedElements = [...prevElements, duplicatedElement];
        // Update zIndex to ensure duplicated element is on top
        return updatedElements.map((el, index) => ({
          ...el,
          zIndex: index
        }));
      });

      // Select the newly duplicated element
      setSelectedElement(duplicatedElement.id);
    }
  };

  // Select an element
  const selectElement = (id: string | null) => {
    setSelectedElement(id);
  };

  return (
    <UIElementsContext.Provider 
      value={{ 
        elements, 
        selectedElement, 
        addElement, 
        updateElement, 
        deleteElement, 
        duplicateElement, 
        selectElement 
      }}
    >
      {children}
    </UIElementsContext.Provider>
  );
};

// Custom hook to use the UIElements context
export const useUIElements = () => {
  const context = useContext(UIElementsContext);
  
  if (!context) {
    throw new Error('useUIElements must be used within a UIElementsProvider');
  }
  
  return context;
};