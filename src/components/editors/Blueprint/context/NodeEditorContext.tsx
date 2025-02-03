import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, Connection, addEdge } from 'reactflow';
import { useNodeStore } from '../store/nodeStore';
import type { PulsarNode, PulsarNodeData, ValidationError } from '../types';
import { calculateNodePosition, findConnectedNodes } from '../lib/utils';

interface NodeEditorContextType {
  // State
  nodes: Node[];
  edges: Edge[];
  selectedNode: PulsarNode | null;
  validationErrors: ValidationError[];
  
  // Node operations
  addNode: (type: string, position?: { x: number; y: number }) => void;
  updateNode: (nodeId: string, updates: Partial<PulsarNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  
  // Selection
  setSelectedNode: (node: PulsarNode | null) => void;
  
  // Edge operations
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  
  // Graph operations
  clearGraph: () => void;
  validateGraph: () => void;
  generateCode: () => string;
  
  // UI state
  isValidating: boolean;
  isGeneratingCode: boolean;
}

const NodeEditorContext = createContext<NodeEditorContextType | undefined>(undefined);

export const NodeEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Node and edge state management using ReactFlow's hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Local state management
  const [selectedNode, setSelectedNode] = React.useState<PulsarNode | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = React.useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = React.useState(false);

  // Access to node definitions and validation from store
  const {
    definitions,
    validateGraph: validateGraphFromStore,
    generateCode: generateCodeFromStore,
  } = useNodeStore();

  // Node operations
  const addNode = useCallback((type: string, position?: { x: number; y: number }) => {
    const definition = definitions[type];
    if (!definition) return;

    const nodePosition = position || calculateNodePosition(nodes);
    
    const newNode: PulsarNode = {
      id: `node_${Date.now()}`,
      type: 'pulsarNode',
      position: nodePosition,
      data: {
        nodeDefinition: definition,
        fields: Object.fromEntries(
          Object.entries(definition.fields).map(([key, field]) => [
            key,
            field.default ?? ''
          ])
        ),
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes, definitions]);

  const updateNode = useCallback((nodeId: string, updates: Partial<PulsarNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    // Remove connected edges first
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    
    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    
    // Clear selection if this was the selected node
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode, setEdges, setNodes]);

  const duplicateNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newNode: PulsarNode = {
      ...node,
      id: `node_${Date.now()}`,
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
      data: {
        ...node.data,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes]);

  // Edge operations
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  // Graph operations
  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setValidationErrors([]);
  }, []);

  const validateGraph = useCallback(() => {
    setIsValidating(true);
    try {
      const result = validateGraphFromStore();
      //TODO: Fix this setValidationErrors(result);
    } finally {
      setIsValidating(false);
    }
  }, [validateGraphFromStore]);

  const generateCode = useCallback(() => {
    setIsGeneratingCode(true);
    try {
      return generateCodeFromStore();
    } finally {
      setIsGeneratingCode(false);
    }
  }, [generateCodeFromStore]);

  // Context value memoization
  const contextValue = useMemo(
    () => ({
      // State
      nodes,
      edges,
      selectedNode,
      validationErrors,
      
      // Node operations
      addNode,
      updateNode,
      deleteNode,
      duplicateNode,
      
      // Selection
      setSelectedNode,
      
      // Edge operations
      onNodesChange,
      onEdgesChange,
      onConnect,
      
      // Graph operations
      clearGraph,
      validateGraph,
      generateCode,
      
      // UI state
      isValidating,
      isGeneratingCode,
    }),
    [
      nodes,
      edges,
      selectedNode,
      validationErrors,
      addNode,
      updateNode,
      deleteNode,
      duplicateNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      clearGraph,
      validateGraph,
      generateCode,
      isValidating,
      isGeneratingCode,
    ]
  );

  return (
    <NodeEditorContext.Provider value={contextValue}>
      {children}
    </NodeEditorContext.Provider>
  );
};

// Custom hook for using the Node Editor context
export const useNodeEditor = () => {
  const context = useContext(NodeEditorContext);
  if (context === undefined) {
    throw new Error('useNodeEditor must be used within a NodeEditorProvider');
  }
  return context;
};

export default NodeEditorProvider;