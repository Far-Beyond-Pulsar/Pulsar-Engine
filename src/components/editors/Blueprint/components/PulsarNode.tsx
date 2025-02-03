// components/PulsarNode.tsx
import React from 'react';
import { Handle, Position } from 'reactflow';

// Type color mapping
const TYPE_COLORS = {
  number:    { color: '#F59E0B', border: '#B45309' },  // Amber
  i32:       { color: '#F59E0B', border: '#B45309' },  // Amber
  i64:       { color: '#F59E0B', border: '#B45309' },  // Amber
  f32:       { color: '#F59E0B', border: '#B45309' },  // Amber
  f64:       { color: '#F59E0B', border: '#B45309' },  // Amber
  string:    { color: '#EC4899', border: '#BE185D' },  // Pink
  boolean:   { color: '#3B82F6', border: '#1D4ED8' },  // Blue
  any:       { color: '#6B7280', border: '#374151' },  // Gray
  array:     { color: '#10B981', border: '#047857' },  // Emerald
  object:    { color: '#8B5CF6', border: '#6D28D9' },  // Purple
  execution: { color: '#6366F1', border: '#4F46E5' },  // Indigo
  default:   { color: '#6B7280', border: '#374151' }   // Gray
};

const getTypeColors = (type: string) => {
  return TYPE_COLORS[type] || TYPE_COLORS.default;
};

interface PulsarNodeProps {
  data: {
    nodeDefinition: {
      name: string;
      description: string;
      pins: {
        inputs?: Array<{
          name: string;
          type: string;
          description?: string;
        }>;
        outputs?: Array<{
          name: string;
          type: string;
          description?: string;
        }>;
      };
    };
    fields: Record<string, any>;
  };
  selected?: boolean;
}

const PulsarNode = ({ data, selected }: PulsarNodeProps) => {
  const inputPins = data.nodeDefinition.pins.inputs || [];
  const outputPins = data.nodeDefinition.pins.outputs || [];
  const maxPins = Math.max(inputPins.length, outputPins.length);
  const headerHeight = 64;
  const pinSpacing = 32;
  const fieldsHeight = Object.keys(data.fields).length > 0 ? 64 : 0;
  const paddingHeight = 32;
  
  const nodeHeight = Math.max(
    headerHeight + (maxPins * pinSpacing) + fieldsHeight + paddingHeight,
    160
  );

  const pinContainerHeight = nodeHeight - headerHeight - fieldsHeight - paddingHeight;

  return (
    <div 
      className={`bg-black border rounded-lg min-w-[200px] ${
        selected ? 'border-blue-500' : 'border-gray-800'
      }`}
      style={{ height: `${nodeHeight}px` }}
    >
      {/* Node Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="text-blue-400 font-medium">{data.nodeDefinition.name}</div>
        <div className="text-gray-400 text-xs mt-1">{data.nodeDefinition.description}</div>
      </div>

      {/* Pin Container */}
      <div 
        className="relative" 
        style={{ height: `${pinContainerHeight}px` }}
      >
        {/* Input Pins */}
        <div className="absolute left-0 top-0 bottom-0 py-2">
          {inputPins.map((pin, index) => {
            const yPosition = ((index + 1) * (pinContainerHeight / (inputPins.length + 1)));
            const { color, border } = getTypeColors(pin.type);
            return (
              <div
                key={`input-${pin.name}`}
                className="absolute left-0 flex items-center group"
                style={{ top: yPosition, transform: 'translateY(-50%)' }}
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={pin.name}
                  className="!w-3 !h-3 !rounded-full !border-2 !transition-colors"
                  style={{ 
                    backgroundColor: color,
                    borderColor: border,
                    left: -6
                  }}
                />
                <div className="ml-4">
                  <span className="text-xs text-gray-300">{pin.name}</span>
                  <span className="text-xs ml-1" style={{ color }}>{pin.type}</span>
                </div>
                {/* Tooltip */}
                <div className="absolute left-0 -translate-x-full -translate-y-1/2 hidden group-hover:block pointer-events-none z-50">
                  <div className="bg-gray-900 text-xs text-white p-2 rounded shadow-lg -ml-2 whitespace-nowrap">
                    {pin.description || `${pin.name} (${pin.type})`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Output Pins */}
        <div className="absolute right-0 top-0 bottom-0 py-2">
          {outputPins.map((pin, index) => {
            const yPosition = ((index + 1) * (pinContainerHeight / (outputPins.length + 1)));
            const { color, border } = getTypeColors(pin.type);
            return (
              <div
                key={`output-${pin.name}`}
                className="absolute right-0 flex items-center group"
                style={{ top: yPosition, transform: 'translateY(-50%)' }}
              >
                <div className="mr-4 text-right">
                  <span className="text-xs text-gray-300">{pin.name}</span>
                  <span className="text-xs ml-1" style={{ color }}>{pin.type}</span>
                </div>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={pin.name}
                  className="!w-3 !h-3 !rounded-full !border-2 !transition-colors"
                  style={{ 
                    backgroundColor: color,
                    borderColor: border,
                    right: -6
                  }}
                />
                {/* Tooltip */}
                <div className="absolute right-0 translate-x-full -translate-y-1/2 hidden group-hover:block pointer-events-none z-50">
                  <div className="bg-gray-900 text-xs text-white p-2 rounded shadow-lg ml-2 whitespace-nowrap">
                    {pin.description || `${pin.name} (${pin.type})`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fields Preview */}
      {Object.entries(data.fields).length > 0 && (
        <div className="px-4 py-3 border-t border-gray-800">
          {Object.entries(data.fields).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-400">
              {key}: {String(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PulsarNode;