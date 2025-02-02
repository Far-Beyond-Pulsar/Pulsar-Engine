import React, { 
    createContext, 
    useState, 
    useCallback, 
    useMemo, 
    ReactNode 
  } from 'react';
  import { Node, Edge } from 'reactflow';
  
  // Define the shape of the context
  interface NodeEditorContextType {
    nodes: Node[];
    edges: Edge[];
    highlightedGroups: string[][];
    addNode: (type: string, x?: number, y?: number) => void;
    deleteNode: (nodeId: string) => void;
    updateNode: (nodeId: string, newData: any) => void;
    toggleNodeHighlight: (nodeId: string) => void;
    clearAll: () => void;
  }
  
  // Create the context with a default empty implementation
  export const NodeEditorContext = createContext<NodeEditorContextType>({
    nodes: [],
    edges: [],
    highlightedGroups: [],
    addNode: () => {},
    deleteNode: () => {},
    updateNode: () => {},
    toggleNodeHighlight: () => {},
    clearAll: () => {}
  });
  
  // Provider component
  export const NodeEditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [highlightedGroups, setHighlightedGroups] = useState<string[][]>([]);
  
    // Add a new node
    const addNode = useCallback((type: string, x = 200, y = 200) => {
      const newNode: Node = {
        id: `node_${nodes.length + 1}`,
        type: 'unrealNode',
        data: { 
          label: type,
          fields: Object.keys(NODE_CONFIGS[type as keyof typeof NODE_CONFIGS].fields)
            .reduce((acc, fieldName) => ({...acc, [fieldName]: ''}), {})
        },
        position: { x: Number(x), y: Number(y) }
      };
      
      setNodes((prevNodes) => [...prevNodes, newNode]);
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
        prevGroups.map(group => group.filter(id => id !== nodeId))
          .filter(group => group.length > 0)
      );
    }, []);
  
    // Update a node's data
    const updateNode = useCallback((nodeId: string, newData: any) => {
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: newData }
            : node
        )
      );
    }, []);
  
    // Toggle node highlight in groups
    const toggleNodeHighlight = useCallback((nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
  
      // Check if this node is already in a group
      const existingGroupIndex = highlightedGroups.findIndex(group => 
        group.includes(nodeId)
      );
  
      if (existingGroupIndex !== -1) {
        // If in a group, remove it
        const newGroups = [...highlightedGroups];
        newGroups[existingGroupIndex] = newGroups[existingGroupIndex].filter(id => id !== nodeId);
        
        // Remove empty groups
        setHighlightedGroups(newGroups.filter(group => group.length > 0));
      } else {
        // If not in a group, create a new group or add to an existing one
        const newGroups = [...highlightedGroups];
        
        // If the last group is not full (or doesn't exist), add to it
        if (newGroups.length === 0 || newGroups[newGroups.length - 1].length >= 5) {
          newGroups.push([nodeId]);
        } else {
          newGroups[newGroups.length - 1].push(nodeId);
        }
        
        setHighlightedGroups(newGroups);
      }
    }, [nodes, highlightedGroups]);
  
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
      clearAll
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
    const context = React.useContext(NodeEditorContext);
    if (context === undefined) {
      throw new Error('useNodeEditor must be used within a NodeEditorProvider');
    }
    return context;
  };