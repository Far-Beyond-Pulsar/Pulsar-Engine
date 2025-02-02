import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import styled from 'styled-components';
import { Menu, Item, useContextMenu } from 'react-contexify';

import NODE_CONFIGS from '../utils/nodeConfigs';
import { useNodeEditor } from '../context/NodeEditorContext';

const StyledNode = styled.div`
  background: #121212;
  border: 2px solid #333333;
  border-radius: 8px;
  padding: 10px;
  min-width: 150px;
  max-width: 200px;
  box-shadow: 0 4px 6px rgba(255,255,255,0.05);
  color: #ffffff;
  font-family: 'Arial', sans-serif;
  
  &.selected {
    border-color: #3B82F6;
  }
  
  .node-type {
    font-weight: bold;
    color: #3B82F6;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
  
  .node-details {
    font-size: 0.9em;
    color: #888888;
    word-break: break-all;
  }
`;

export const UnrealNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { deleteNode, toggleNodeHighlight } = useNodeEditor();
  const { show } = useContextMenu({ id: `node-menu-${id}` });

  const config = NODE_CONFIGS[data.label as keyof typeof NODE_CONFIGS];
  
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    show({ 
      event,
      props: { 
        nodeId: id,
        x: event.clientX,
        y: event.clientY
      }
    });
  }, [show, id]);

  return (
    <>
      <StyledNode 
        className={selected ? 'selected' : ''}
        onContextMenu={handleContextMenu}
      >
        <div className="node-type">{data.label}</div>
        
        {/* Input Handles */}
        {config.handles.inputs.map((handle: string | undefined, index: number) => (
          <Handle
            key={`input-${handle}`}
            type="target"
            position={Position.Left}
            id={handle}
            style={{ 
              top: `${25 + (index * 20)}%`,
              background: '#3B82F6',
              border: 'none',
              width: '10px',
              height: '10px'
            }}
          />
        ))}
        
        {/* Output Handles */}
        {config.handles.outputs.map((handle: string | undefined, index: number) => (
          <Handle
            key={`output-${handle}`}
            type="source"
            position={Position.Right}
            id={handle}
            style={{ 
              top: `${25 + (index * 20)}%`,
              background: '#10B981',
              border: 'none',
              width: '10px',
              height: '10px'
            }}
          />
        ))}
        
        <div className="node-details">
          {data.fields && Object.entries(data.fields).map(([key, value]) => (
            <div key={key}>{key}: {value as string}</div>
          ))}
        </div>
      </StyledNode>

      {/* Node-specific Context Menu */}
      <Menu id={`node-menu-${id}`}>
        <Item onClick={() => deleteNode(id)}>Delete Node</Item>
        <Item onClick={() => toggleNodeHighlight(id)}>Toggle Highlight</Item>
      </Menu>
    </>
  );
};