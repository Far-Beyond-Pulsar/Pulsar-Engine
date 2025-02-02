import React, { 
    createContext, 
    useState, 
    useCallback, 
    useMemo, 
    ReactNode,
    useContext
  } from 'react';
  import { Node, Edge } from 'reactflow';
  import NODE_CONFIGS from '../utils/nodeConfigs';
  
  // Types
  export interface ExtendedNode extends Node {
    data: {
      label: string;
      fields?: Record<string, string>;
      isHighlighted?: boolean;
    };
  }
  
  export interface NodeHighlightGroup {
    id: string;
    nodeIds: string[];
    color?: string;
  }
  
  // Define the shape of the context
  export interface NodeEditorContextType {
    nodes: ExtendedNode[];
    edges: Edge[];
    highlightedGroups: NodeHighlightGroup[];
    addNode: (type: string, x?: number, y?: number) => ExtendedNode;
    deleteNode: (nodeId: string) => void;
    updateNode: (nodeId: string, newData: any) => void;
    toggleNodeHighlight: (nodeId: string) => void;
    clearAll: () => void;
    setNodes: React.Dispatch<React.SetStateAction<ExtendedNode[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  }
  
  // Create the context with a default empty implementation
  export const NodeEditorContext = createContext<NodeEditorContextType>({
    nodes: [],
    edges: [],
    highlightedGroups: [],
    addNode: () => ({ 
      id: '', 
      type: '', 
      position: { x: 0, y: 0 }, 
      data: { label: '', fields: {} } 
    }),
    deleteNode: () => {},
    updateNode: () => {},
    toggleNodeHighlight: () => {},
    clearAll: () => {},
    setNodes: () => {},
    setEdges: () => {}
  });
  
  // Provider component
  export const NodeEditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [nodes, setNodes] = useState<ExtendedNode[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [highlightedGroups, setHighlightedGroups] = useState<NodeHighlightGroup[]>([]);
  
    // Add a new node
    const addNode = useCallback((type: string, x = 200, y = 200): ExtendedNode => {
      const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS];
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
  
    // Delete a node and its connected edges
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
      setHighlightedGroups(prevGroups => 
        prevGroups.map(group => ({
          ...group,
          nodeIds: group.nodeIds.filter(id => id !== nodeId)
        })).filter(group => group.nodeIds.length > 0)
      );
    }, []);
  
    // Update a node's data
    const updateNode = useCallback((nodeId: string, newData: any) => {
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
    }, []);
  
    // Toggle node highlight in groups
    const toggleNodeHighlight = useCallback((nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
  
      // Update node's highlighted state
      setNodes(prevNodes => 
        prevNodes.map(n => 
          n.id === nodeId 
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  isHighlighted: !n.data.isHighlighted 
                } 
              }
            : n
        )
      );
  
      // Update highlight groups
      setHighlightedGroups(prevGroups => {
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
    }, [nodes]);
  
    // Clear all nodes, edges, and highlights
    const clearAll = useCallback(() => {
      setNodes([]);
      setEdges([]);
      setHighlightedGroups([]);
    }, []);
  
    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
      nodes,
      edges,
      highlightedGroups,
      addNode,
      deleteNode,
      updateNode,
      toggleNodeHighlight,
      clearAll,
      setNodes,
      setEdges
    }), [
      nodes, 
      edges, 
      highlightedGroups, 
      addNode, 
      deleteNode, 
      updateNode, 
      toggleNodeHighlight, 
      clearAll
    ]);
  
    return (
      <NodeEditorContext.Provider value={contextValue}>
        {children}
      </NodeEditorContext.Provider>
    );
  };
  
  // Custom hook to use the NodeEditor context
  export const useNodeEditor = () => {
    const context = useContext(NodeEditorContext);
    if (context === undefined) {
      throw new Error('useNodeEditor must be used within a NodeEditorProvider');
    }
    return context;
  };