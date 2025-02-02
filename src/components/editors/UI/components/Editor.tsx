import React, { useState, useRef } from 'react';
import { 
  DndProvider, 
  useDrag, 
  useDrop 
} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Toolbar from './Toolbar';
import Hierarchy from './Hierarchy';
import PropertiesPanel from './PropertiesPanel';
import Canvas from './Canvas';

import { useUIElements } from '../contexts/UIEditorContext';
import { 
  handleKeyboardShortcuts, 
  exportUI 
} from '../utils/elementUtils';
import { ELEMENT_TYPES } from '../utils/constants';

const Editor: React.FC = () => {
  const {
    elements,
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    selectElement
  } = useUIElements();

  // UI State
  const [activeTab, setActiveTab] = useState<string>('select');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcut Handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!selectedElement) return;

    handleKeyboardShortcuts(
      event, 
      () => deleteElement(selectedElement),
      () => duplicateElement(selectedElement)
    );
  };

  // Export Handler
  const handleExport = (type: 'json' | 'png') => {
    exportUI(elements, type, canvasRef);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        className="flex h-screen bg-black text-white"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Left Toolbar */}
        <Toolbar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onAddElement={addElement}
          onExport={handleExport}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Hierarchy Panel */}
          <Hierarchy 
            elements={elements}
            selectedElement={selectedElement}
            onSelectElement={selectElement}
          />

          {/* Canvas */}
          <Canvas 
            ref={canvasRef}
            elements={elements}
            selectedElement={selectedElement}
            onSelectElement={selectElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
          />

          {/* Properties Panel */}
          <PropertiesPanel 
            elements={elements}
            selectedElement={selectedElement}
            onUpdateElement={updateElement}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default Editor;