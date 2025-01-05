import React from 'react';
import { Button } from './components/ui/Button';
import { X } from 'lucide-react';
import { NODE_WIDTH, NODE_HEIGHT } from './canvasUtils';

const PinComponent = ({
  pin,
  nodeId,
  position,
  onStartConnection,
  onEndConnection
}) => {
  const isInput = pin.direction === 'input';
  const pinSize = 12;
  
  return (
    <div
      className="absolute flex items-center gap-2"
      style={{
        left: isInput ? -pinSize : NODE_WIDTH,
        top: position.y,
        flexDirection: isInput ? 'row' : 'row-reverse',
      }}
    >
      <div
        className="rounded-full cursor-pointer hover:scale-110 transition-transform"
        style={{
          width: pinSize,
          height: pinSize,
          backgroundColor: pin.color,
          border: '2px solid #1a1a1a'
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartConnection(nodeId, pin.id, pin.type);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onEndConnection(nodeId, pin.id, pin.type);
        }}
      />
      <span className="text-xs text-neutral-300 whitespace-nowrap">
        {pin.name}
      </span>
    </div>
  );
};

const Node = ({
  node,
  isSelected,
  onMouseDown,
  onMouseUp,
  onSelect,
  onDelete,
  onStartConnection,
  onEndConnection
}) => {
  // Add defensive check for pins
  const pins = node.pins || [];
  const inputPins = pins.filter(p => p?.direction === 'input');
  const outputPins = pins.filter(p => p?.direction === 'output');
  
  // Calculate height based on number of pins
  const nodeHeight = NODE_HEIGHT + Math.max(inputPins.length, outputPins.length) * 20;
  
  return (
    <div
      className={`absolute border-2 rounded-lg bg-neutral-950 cursor-move shadow-lg
                  ${isSelected ? 'border-yellow-500' : 'border-blue-700'} transition-colors`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: NODE_WIDTH,
        height: nodeHeight
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onMouseUp={onMouseUp}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
      }}
    >
      <div className="absolute top-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-red-900/50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
        >
          <X className="h-4 w-4 text-red-400" />
        </Button>
      </div>

      <div className="p-2 pb-4 text-center">
        <div className="text-sm font-medium truncate px-2 text-neutral-100">
          {node.name}
        </div>
        <div className="text-xs text-neutral-400 truncate px-2">
          {node.type}
        </div>
      </div>

      {/* Input Pins */}
      {inputPins.map((pin, index) => (
        <PinComponent
          key={`${pin.id}-input`}
          pin={pin}
          nodeId={node.id}
          position={{ x: 0, y: NODE_HEIGHT/2 + index * 20 }}
          onStartConnection={onStartConnection}
          onEndConnection={onEndConnection}
        />
      ))}

      {/* Output Pins */}
      {outputPins.map((pin, index) => (
        <PinComponent
          key={`${pin.id}-output`}
          pin={pin}
          nodeId={node.id}
          position={{ x: NODE_WIDTH, y: NODE_HEIGHT/2 + index * 20 }}
          onStartConnection={onStartConnection}
          onEndConnection={onEndConnection}
        />
      ))}
    </div>
  );
};

export default Node;