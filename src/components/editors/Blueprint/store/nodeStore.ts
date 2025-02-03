import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { parse } from 'yaml';
import { generateRustCode } from '../lib/generateRust';

// Types
export interface PulsarPin {
  name: string;
  type: string;
  description?: string;
}

export interface PulsarField {
  type: string;
  label: string;
  description?: string;
  options?: string[];
  default?: any;
  required?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface PulsarNodeDefinition {
  name: string;
  category: string;
  description: string;
  fields: Record<string, PulsarField>;
  pins: {
    inputs?: PulsarPin[];
    outputs?: PulsarPin[];
  };
  template: string;
  validation?: (node: Node) => string[];
}

interface ValidationError {
  nodeId: string;
  errors: string[];
}

interface NodeStoreState {
  // Node Definitions
  definitions: Record<string, PulsarNodeDefinition>;
  definitionsByCategory: Record<string, PulsarNodeDefinition[]>;
  
  // Editor State
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  highlightedNodes: string[];
  validationErrors: ValidationError[];
  
  // Loading State
  isLoading: boolean;
  error: string | null;
}

interface NodeStoreActions {
  // Definition Management
  loadDefinition: (content: string) => void;
  loadDefinitionFromFile: (file: File) => Promise<void>;
  getNodeDefinition: (type: string) => PulsarNodeDefinition | undefined;
  
  // Node Management
  addNode: (type: string, position: { x: number; y: number }) => Node;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  
  // Edge Management
  addEdge: (edge: Edge) => void;
  updateEdge: (oldEdge: Edge, newEdge: Edge) => void;
  deleteEdge: (edgeId: string) => void;
  
  // Selection & Highlighting
  setSelectedNode: (nodeId: string | null) => void;
  toggleNodeHighlight: (nodeId: string) => void;
  
  // Validation & Code Generation
  validateGraph: () => ValidationError[];
  generateCode: () => string;
  
  // Graph Management
  clearGraph: () => void;
  importGraph: (data: { nodes: Node[]; edges: Edge[] }) => void;
  exportGraph: () => { nodes: Node[]; edges: Edge[] };
}

// Create the store
export const useNodeStore = create<NodeStoreState & NodeStoreActions>((set, get) => ({
  // Initial State
  definitions: {},
  definitionsByCategory: {},
  nodes: [],
  edges: [],
  selectedNodeId: null,
  highlightedNodes: [],
  validationErrors: [],
  isLoading: false,
  error: null,

  // Definition Management
  loadDefinition: (content: string) => {
    try {
      // Split content into documents and parse each one
      const documents = content.split('---\n');
      const newDefinitions: Record<string, PulsarNodeDefinition> = {};
      
      documents.forEach(doc => {
        if (doc.trim()) {
          const definition = parse(doc) as PulsarNodeDefinition;
          newDefinitions[definition.name] = definition;
        }
      });
      
      // Group definitions by category
      const byCategory = Object.values(newDefinitions).reduce((acc, def) => {
        if (!acc[def.category]) {
          acc[def.category] = [];
        }
        acc[def.category].push(def);
        return acc;
      }, {} as Record<string, PulsarNodeDefinition[]>);

      set({ 
        definitions: { ...get().definitions, ...newDefinitions },
        definitionsByCategory: byCategory,
        error: null
      });
    } catch (error) {
      set({ error: `Error parsing node definitions: ${error}` });
    }
  },

  loadDefinitionFromFile: async (file: File) => {
    set({ isLoading: true });
    try {
      const content = await file.text();
      get().loadDefinition(content);
    } catch (error) {
      set({ error: `Error loading file: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  getNodeDefinition: (type: string) => get().definitions[type],

  // Node Management
  addNode: (type: string, position) => {
    const definition = get().definitions[type];
    if (!definition) throw new Error(`No definition found for node type: ${type}`);

    // Initialize fields with default values
    const fields = Object.entries(definition.fields).reduce((acc, [key, field]) => {
      acc[key] = field.default ?? '';
      return acc;
    }, {} as Record<string, any>);

    const newNode: Node = {
      id: `node_${Math.random().toString(36).substr(2, 9)}`,
      type: 'pulsarNode',
      position,
      data: {
        nodeDefinition: definition,
        fields
      }
    };

    set({ nodes: [...get().nodes, newNode] });
    return newNode;
  },

  updateNode: (nodeId, updates) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    });
  },

  deleteNode: (nodeId) => {
    // Remove the node
    set({
      nodes: get().nodes.filter(node => node.id !== nodeId),
      // Remove connected edges
      edges: get().edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      ),
      // Clear selection if this was the selected node
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      // Remove from highlighted nodes
      highlightedNodes: get().highlightedNodes.filter(id => id !== nodeId)
    });
  },

  duplicateNode: (nodeId) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;

    const newNode = {
      ...node,
      id: `node_${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20
      }
    };

    set({ nodes: [...get().nodes, newNode] });
  },

  // Edge Management
  addEdge: (edge) => {
    set({ edges: [...get().edges, edge] });
  },

  updateEdge: (oldEdge, newEdge) => {
    set({
      edges: get().edges.map(edge =>
        edge.id === oldEdge.id ? newEdge : edge
      )
    });
  },

  deleteEdge: (edgeId) => {
    set({
      edges: get().edges.filter(edge => edge.id !== edgeId)
    });
  },

  // Selection & Highlighting
  setSelectedNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  toggleNodeHighlight: (nodeId) => {
    set({
      highlightedNodes: get().highlightedNodes.includes(nodeId)
        ? get().highlightedNodes.filter(id => id !== nodeId)
        : [...get().highlightedNodes, nodeId]
    });
  },

  // Validation & Code Generation
  validateGraph: () => {
    const errors: ValidationError[] = [];

    // Validate each node
    get().nodes.forEach(node => {
      const def = node.data.nodeDefinition;
      const nodeErrors: string[] = [];

      // Validate required fields
      Object.entries(def.fields).forEach(([fieldName, field]) => {
        if (field.required && !node.data.fields[fieldName]) {
          nodeErrors.push(`Field "${fieldName}" is required`);
        }
      });

      // Run custom validation if defined
      if (def.validation) {
        const customErrors = def.validation(node);
        nodeErrors.push(...customErrors);
      }

      if (nodeErrors.length > 0) {
        errors.push({ nodeId: node.id, errors: nodeErrors });
      }
    });

    set({ validationErrors: errors });
    return errors;
  },

  generateCode: () => {
    const errors = get().validateGraph();
    if (errors.length > 0) {
      return '// Fix validation errors before generating code\n\n' +
        errors.map(error => 
          `// Node ${error.nodeId}:\n` +
          error.errors.map(e => `// - ${e}`).join('\n')
        ).join('\n\n');
    }

    return generateRustCode(get().nodes, get().edges);
  },

  // Graph Management
  clearGraph: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      highlightedNodes: [],
      validationErrors: []
    });
  },

  importGraph: (data) => {
    set({
      nodes: data.nodes,
      edges: data.edges,
      selectedNodeId: null,
      highlightedNodes: [],
      validationErrors: []
    });
  },

  exportGraph: () => ({
    nodes: get().nodes,
    edges: get().edges
  })
}));

// Utility functions
export const findConnectedNodes = (nodeId: string, edges: Edge[]) => {
  const connectedNodes = new Set<string>();
  
  edges.forEach(edge => {
    if (edge.source === nodeId) connectedNodes.add(edge.target);
    if (edge.target === nodeId) connectedNodes.add(edge.source);
  });
  
  return Array.from(connectedNodes);
};

export const getNodeDependencies = (nodeId: string, edges: Edge[]) => {
  const dependencies = new Set<string>();
  const visited = new Set<string>();

  const traverse = (currentId: string) => {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    edges.forEach(edge => {
      if (edge.target === currentId) {
        dependencies.add(edge.source);
        traverse(edge.source);
      }
    });
  };

  traverse(nodeId);
  return Array.from(dependencies);
};

export const validateNodeConnections = (
  node: Node,
  edges: Edge[],
  definitions: Record<string, PulsarNodeDefinition>
) => {
  const errors: string[] = [];
  const def = node.data.nodeDefinition;

  // Check required inputs
  def.pins.inputs?.forEach(input => {
    const hasConnection = edges.some(edge => 
      edge.target === node.id && edge.targetHandle === input.name
    );
    if (!hasConnection) {
      errors.push(`Required input "${input.name}" is not connected`);
    }
  });

  // Check type compatibility
  edges.forEach(edge => {
    if (edge.source === node.id || edge.target === node.id) {
      const sourceNode = edge.source === node.id ? node : undefined;
      const targetNode = edge.target === node.id ? node : undefined;

      if (sourceNode && targetNode) {
        const sourcePin = def.pins.outputs?.find(p => p.name === edge.sourceHandle);
        const targetPin = def.pins.inputs?.find(p => p.name === edge.targetHandle);

        if (sourcePin && targetPin && sourcePin.type !== targetPin.type) {
          errors.push(
            `Type mismatch: cannot connect ${sourcePin.type} to ${targetPin.type}`
          );
        }
      }
    }
  });

  return errors;
};