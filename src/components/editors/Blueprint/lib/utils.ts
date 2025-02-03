import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Edge, Node, XYPosition } from 'reactflow';
import { PulsarNode, PulsarNodeDefinition, PulsarPin } from '../types';

// Styling utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Graph layout utilities
export const getNodesBounds = (nodes: Node[]) => {
  const bounds = nodes.reduce(
    (acc, node) => {
      acc.minX = Math.min(acc.minX, node.position.x);
      acc.minY = Math.min(acc.minY, node.position.y);
      acc.maxX = Math.max(acc.maxX, node.position.x);
      acc.maxY = Math.max(acc.maxY, node.position.y);
      return acc;
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  return {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  };
};

// Node positioning utilities
export const calculateNodePosition = (
  existingNodes: Node[],
  spacing: { x: number; y: number } = { x: 200, y: 100 }
): XYPosition => {
  if (existingNodes.length === 0) {
    return { x: 100, y: 100 };
  }

  const bounds = getNodesBounds(existingNodes);
  return {
    x: bounds.x + bounds.width + spacing.x,
    y: bounds.y + (bounds.height / 2),
  };
};

// Type checking and compatibility
export const isTypeCompatible = (sourceType: string, targetType: string): boolean => {
  // Handle generic types
  if (sourceType.startsWith('generic<') || targetType.startsWith('generic<')) {
    return true;
  }

  // Type compatibility mapping
  const typeCompatibility: Record<string, string[]> = {
    'number': ['i32', 'i64', 'f32', 'f64'],
    'i32': ['number', 'i64'],
    'i64': ['number', 'i32'],
    'f32': ['number', 'f64'],
    'f64': ['number', 'f32'],
    'string': ['String'],
    'String': ['string'],
    'bool': ['boolean'],
    'boolean': ['bool'],
    'execution': ['execution']
  };

  // Direct match
  if (sourceType === targetType) return true;

  // Check compatibility mapping
  return typeCompatibility[sourceType]?.includes(targetType) || false;
};

// Pin and connection utilities
export const getPinPosition = (
  node: PulsarNode,
  pinName: string,
  isInput: boolean
): XYPosition | null => {
  const def = node.data.nodeDefinition;
  const pins = isInput ? def.pins.inputs : def.pins.outputs;
  const pinIndex = pins?.findIndex(p => p.name === pinName);
  
  if (pinIndex === undefined || pinIndex === -1) return null;

  const totalPins = pins?.length || 1;
  const spacing = 1 / (totalPins + 1);
  const yPosition = (pinIndex + 1) * spacing;

  return {
    x: isInput ? 0 : node.width || 150,
    y: (node.height || 100) * yPosition,
  };
};

// Graph analysis utilities
export const findConnectedNodes = (nodeId: string, edges: Edge[], direction: 'incoming' | 'outgoing' = 'outgoing'): string[] => {
  return edges
    .filter(edge => 
      direction === 'outgoing' 
        ? edge.source === nodeId 
        : edge.target === nodeId
    )
    .map(edge => direction === 'outgoing' ? edge.target : edge.source);
};

export const getNodeDependencies = (nodeId: string, edges: Edge[]): string[] => {
  const visited = new Set<string>();
  const dependencies: string[] = [];

  const traverse = (currentId: string) => {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const incomingNodes = findConnectedNodes(currentId, edges, 'incoming');
    incomingNodes.forEach(nodeId => {
      dependencies.push(nodeId);
      traverse(nodeId);
    });
  };

  traverse(nodeId);
  return dependencies;
};

// Node creation and manipulation
export const createNode = (
  type: string,
  position: XYPosition,
  definition: PulsarNodeDefinition
): PulsarNode => {
  return {
    id: `node_${Math.random().toString(36).substr(2, 9)}`,
    type: 'pulsarNode',
    position,
    data: {
      nodeDefinition: definition,
      fields: Object.fromEntries(
        Object.entries(definition.fields).map(([key, field]) => [key, field.default ?? ''])
      )
    }
  };
};

// UI helper functions
export const getConnectionColor = (type: string): string => {
  const colors = {
    execution: '#10B981',  // Green
    boolean: '#3B82F6',    // Blue
    number: '#F59E0B',     // Yellow
    i32: '#F59E0B',
    i64: '#F59E0B',
    f32: '#F59E0B',
    f64: '#F59E0B',
    string: '#EC4899',     // Pink
    String: '#EC4899',
    default: '#6B7280'     // Gray
  };

  return colors[type] || colors.default;
};

export const getPinLabel = (pin: PulsarPin): string => {
  if (pin.type === 'execution') {
    return '►';
  }
  return `${pin.name}: ${pin.type}`;
};

// Type conversion utilities
export const convertValue = (value: any, targetType: string): any => {
  switch (targetType) {
    case 'number':
    case 'i32':
    case 'i64':
    case 'f32':
    case 'f64':
      return Number(value);
    case 'boolean':
    case 'bool':
      return Boolean(value);
    case 'string':
    case 'String':
      return String(value);
    default:
      return value;
  }
};

// File handling utilities
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Error handling utilities
export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// Layout calculation utilities
export const autoLayout = (nodes: Node[], edges: Edge[], spacing = { x: 200, y: 100 }): Node[] => {
  const levels = new Map<string, number>();
  const processed = new Set<string>();

  // Calculate node levels
  const calculateLevels = (nodeId: string, level = 0) => {
    if (processed.has(nodeId)) return;
    processed.add(nodeId);

    levels.set(nodeId, Math.max(level, levels.get(nodeId) || 0));
    const connectedNodes = findConnectedNodes(nodeId, edges);
    connectedNodes.forEach(id => calculateLevels(id, level + 1));
  };

  // Find root nodes and calculate levels
  const rootNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );
  rootNodes.forEach(node => calculateLevels(node.id));

  // Group nodes by level
  const nodesByLevel = new Map<number, string[]>();
  levels.forEach((level, nodeId) => {
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)?.push(nodeId);
  });

  // Position nodes
  return nodes.map(node => {
    const level = levels.get(node.id) || 0;
    const nodesAtLevel = nodesByLevel.get(level) || [];
    const index = nodesAtLevel.indexOf(node.id);
    
    return {
      ...node,
      position: {
        x: level * spacing.x,
        y: index * spacing.y
      }
    };
  });
};