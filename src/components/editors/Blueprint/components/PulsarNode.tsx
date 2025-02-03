// components/PulsarNode.tsx
import React from 'react';
import { Handle, Position } from 'reactflow';

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
}

const PulsarNode = ({ data }: PulsarNodeProps) => {
  const inputPins = data.nodeDefinition.pins.inputs || [];
  const outputPins = data.nodeDefinition.pins.outputs || [];
  const hasFields = Object.entries(data.fields).length > 0;

  const maxPins = Math.max(inputPins.length, outputPins.length);
  const headerHeight = 64; // Height for title and description
  const pinSpacing = 32; // Height for each pin section
  const fieldsHeight = hasFields ? 64 : 0; // Height for fields section if it exists
  const paddingHeight = 32; // Additional padding
  
  // Calculate total node height
  const nodeHeight = Math.max(
    headerHeight + (maxPins * pinSpacing) + fieldsHeight + paddingHeight,
    160 // Minimum height
  );

  // Calculate pin container height (area where pins are placed)
  const pinContainerHeight = nodeHeight - headerHeight - fieldsHeight - paddingHeight;

  return (
    <div 
      className="bg-black border border-gray-800 rounded-lg min-w-[200px]"
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
            // Calculate position with padding at top and bottom
            const yPosition = ((index + 1) * (pinContainerHeight / (inputPins.length + 1)));
            return (
              <div
                key={`input-${pin.name}`}
                className="absolute left-0 flex items-center"
                style={{ top: yPosition, transform: 'translateY(-50%)' }}
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={pin.name}
                  className="w-3 h-3 !bg-blue-500 !border-2 !border-blue-700"
                  style={{ left: -6 }}
                />
                <div className="ml-4">
                  <span className="text-xs text-gray-300">{pin.name}</span>
                  <span className="text-xs text-gray-500 ml-1">({pin.type})</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Output Pins */}
        <div className="absolute right-0 top-0 bottom-0 py-2">
          {outputPins.map((pin, index) => {
            const yPosition = ((index + 1) * (pinContainerHeight / (outputPins.length + 1)));
            return (
              <div
                key={`output-${pin.name}`}
                className="absolute right-0 flex items-center"
                style={{ top: yPosition, transform: 'translateY(-50%)' }}
              >
                <div className="mr-4 text-right">
                  <span className="text-xs text-gray-300">{pin.name}</span>
                  <span className="text-xs text-gray-500 ml-1">({pin.type})</span>
                </div>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={pin.name}
                  className="w-3 h-3 !bg-green-500 !border-2 !border-green-700"
                  style={{ right: -6 }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Fields Section */}
      {hasFields && (
        <div className="px-4 py-3 border-t border-gray-800 mt-auto">
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