import React from 'react';
import styled from 'styled-components';
import { ExtendedNode } from '../types';
import { NODE_CONFIGS } from '../utils/nodeConfigs';

const DetailsPanel = styled.div`
  grid-area: details;
  background: #121212;
  border: 1px solid #1f1f1f;
  padding: 1em;
  overflow-y: auto;
`;

const FormField = styled.div`
  margin-bottom: 1em;
  
  label {
    display: block;
    margin-bottom: 0.5em;
    color: #3B82F6;
  }
  
  input {
    width: 100%;
    padding: 0.5em;
    background: #1f1f1f;
    border: 1px solid #333;
    color: #fff;
    border-radius: 4px;
  }
`;

interface NodeDetailsPanelProps {
  selectedNode: ExtendedNode | null;
  onUpdateNode: (nodeId: string, newData: any) => void;
  setSelectedNode: (node: ExtendedNode | null) => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ 
  selectedNode, 
  onUpdateNode, 
  setSelectedNode 
}) => {
  // If no node is selected, show placeholder
  if (!selectedNode) {
    return (
      <DetailsPanel>
        <div className="p-4 text-gray-400">Select a node to view details</div>
      </DetailsPanel>
    );
  }

  // Get node configuration based on node type
  const config = NODE_CONFIGS[selectedNode.data.label as keyof typeof NODE_CONFIGS];
  
  // If no configuration found, show error
  if (!config) {
    return (
      <DetailsPanel>
        <div className="p-4 text-red-500">Invalid node type</div>
      </DetailsPanel>
    );
  }
  
  // Handle updating a specific field of the node
  const handleFieldUpdate = (fieldName: string, value: string) => {
    // Create updated fields object
    const updatedFields = {
      ...selectedNode.data.fields,
      [fieldName]: value
    };

    // Create updated node data
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        fields: updatedFields
      }
    };

    // Update selected node in parent component
    setSelectedNode(updatedNode);

    // Trigger update callback
    onUpdateNode(selectedNode.id, updatedNode.data);
  };

  return (
    <DetailsPanel>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-4">{selectedNode.data.label} Details</h3>
        <div className="space-y-4">
          {Object.entries(config.fields).map(([fieldName, fieldConfig]) => (
            <FormField key={fieldName}>
              <label className="block mb-2">{fieldConfig.label}</label>
              <input
                type={fieldConfig.type}
                value={selectedNode.data.fields?.[fieldName] || ''}
                onChange={(e) => handleFieldUpdate(fieldName, e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                placeholder={`Enter ${fieldConfig.label}`}
              />
            </FormField>
          ))}
        </div>
      </div>
    </DetailsPanel>
  );
};