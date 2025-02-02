import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { ExtendedNode, NodeHighlightGroup } from '../types';
import { NODE_CONFIGS } from '../utils/nodeConfigs';

export const useNodeEditor = () => {
  const [nodes, setNodes] = useState<ExtendedNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [highlightGroups, setHighlightGroups] = useState<NodeHighlightGroup[]>([]);

  // Add a new node
  const addNode = useCallback((type: string, x = 200, y = 200) => {
    const config = NODE_CONFIGS[type];
    const initialFields = Object.keys(config.fields).reduce((acc, fieldName) => ({
      ...acc,
      [fieldName]: ''
    }), {});

    const newNode: ExtendedNode = {
      id: `node_${nodes.length + 1}`,
      type: 'unrealNode',
      data: { 
        label: type,
        fields: initialFields,
        isHighlighted: false
      },
      position: { x: Number(x), y: Number(y) }
    };
    
    setNodes((prevNodes) => [...prevNodes, newNode]);
    return newNode;
  }, [nodes]);

  // Delete a node
  const deleteNode = useCallback((nodeId: string) => {
    // Remove the node
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
    
    // Remove any edges connected to this node
    setEdges(prevEdges => 
      prevEdges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      )
    );

    // Remove node from any highlight groups
    setHighlightGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        nodeIds: group.nodeIds.filter(id => id !== nodeId)
      })).filter(group => group.nodeIds.length > 0)
    );
  }, []);

  // Update a node's data
  const updateNode = useCallback((nodeId: string, updates: Partial<ExtendedNode>) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, ...updates }
          : node
      )
    );
  }, []);

  // Toggle node highlight
  const toggleNodeHighlight = useCallback((nodeId: string) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                isHighlighted: !node.data.isHighlighted 
              } 
            }
          : node
      )
    );

    // Update highlight groups
    setHighlightGroups(prevGroups => {
      const existingGroupIndex = prevGroups.findIndex(group => 
        group.nodeIds.includes(nodeId)
      );

      if (existingGroupIndex !== -1) {
        // Remove from existing group
        const newGroups = [...prevGroups];
        newGroups[existingGroupIndex] = {
          ...newGroups[existingGroupIndex],
          nodeIds: newGroups[existingGroupIndex].nodeIds.filter(id => id !== nodeId)
        };

        return newGroups.filter(group => group.nodeIds.length > 0);
      } else {
        // Add to a new or existing group
        const lastGroup = prevGroups[prevGroups.length - 1];
        
        if (lastGroup && lastGroup.nodeIds.length < 5) {
          // Add to last group if not full
          return [
            ...prevGroups.slice(0, -1),
            { 
              ...lastGroup, 
              nodeIds: [...lastGroup.nodeIds, nodeId] 
            }
          ];
        } else {
          // Create new group
          return [
            ...prevGroups,
            { 
              id: `group_${prevGroups.length + 1}`, 
              nodeIds: [nodeId] 
            }
          ];
        }
      }
    });
  }, []);

  // Clear all nodes and edges
  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setHighlightGroups([]);
  }, []);

  return {
    nodes,
    edges,
    highlightGroups,
    addNode,
    deleteNode,
    updateNode,
    toggleNodeHighlight,
    clearAll
  };
};