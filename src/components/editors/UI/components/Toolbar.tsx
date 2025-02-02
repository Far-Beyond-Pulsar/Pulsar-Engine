import React from 'react';
import { 
  Mouse, 
  Move, 
  Plus, 
  FileDown, 
  FileUp, 
  FileImage 
} from 'lucide-react';
import { ELEMENT_TYPES } from '../utils/constants';
import { UIElement } from '../types/UIElement';

interface ToolbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddElement: (type: UIElement['type']) => void;
  onExport: (type: 'json' | 'png') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTab, 
  onTabChange, 
  onAddElement,
  onExport 
}) => {
  return (
    <div className="w-12 border-r border-neutral-800 flex flex-col">
      {/* Selection Tools */}
      <button 
        className={`p-3 hover:bg-neutral-800 ${activeTab === 'select' ? 'bg-neutral-800' : ''}`}
        onClick={() => onTabChange('select')}
        title="Select"
      >
        <Mouse size={18} />
      </button>
      <button 
        className={`p-3 hover:bg-neutral-800 ${activeTab === 'move' ? 'bg-neutral-800' : ''}`}
        onClick={() => onTabChange('move')}
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
            onTabChange(type);
            onAddElement(type as UIElement['type']);
          }}
          title={name}
        >
          <Icon size={18} />
        </button>
      ))}
      
      {/* Divider */}
      <div className="h-px bg-neutral-800 my-2" />
      
      {/* Export Tools */}
      <button 
        className="p-3 hover:bg-neutral-800"
        onClick={() => onExport('json')}
        title="Export JSON"
      >
        <FileDown size={18} />
      </button>
      <button 
        className="p-3 hover:bg-neutral-800"
        onClick={() => onExport('png')}
        title="Export PNG"
      >
        <FileImage size={18} />
      </button>
    </div>
  );
};

export default Toolbar;