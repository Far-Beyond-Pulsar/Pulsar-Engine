import { Node, Edge } from 'reactflow';

// Node Types
export interface PulsarPin {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
}

export interface PulsarFieldValidation {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  custom?: (value: any) => string[];
}

export interface PulsarField {
  type: string;
  label: string;
  description?: string;
  options?: string[];
  default?: any;
  required?: boolean;
  validation?: PulsarFieldValidation;
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

export interface PulsarNodeData {
  nodeDefinition: PulsarNodeDefinition;
  fields: Record<string, any>;
}

export interface PulsarNode extends Node {
  data: PulsarNodeData;
}

// Editor Types
export interface EditorState {
  nodes: PulsarNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  highlightedNodes: string[];
}

export interface EditorActions {
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, updates: Partial<PulsarNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (oldEdge: Edge, newEdge: Edge) => void;
  deleteEdge: (edgeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  toggleNodeHighlight: (nodeId: string) => void;
  clearGraph: () => void;
}

// Validation Types
export interface ValidationError {
  nodeId: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Code Generation Types
export interface CodeGenerationOptions {
  includeComments?: boolean;
  formatCode?: boolean;
  targetVersion?: string;
}

export interface CodeGenerationResult {
  code: string;
  errors: string[];
  warnings: string[];
}

// Store Types
export interface NodeStore extends EditorState, EditorActions {
  definitions: Record<string, PulsarNodeDefinition>;
  definitionsByCategory: Record<string, PulsarNodeDefinition[]>;
  validationErrors: ValidationError[];
  isLoading: boolean;
  error: string | null;
  loadDefinition: (content: string) => void;
  loadDefinitionFromFile: (file: File) => Promise<void>;
  validateGraph: () => ValidationResult;
  generateCode: (options?: CodeGenerationOptions) => CodeGenerationResult;
}

// File Types
export interface PulsarNodeFile {
  version: string;
  nodes: PulsarNodeDefinition[];
}

export interface ProjectFile {
  version: string;
  graph: {
    nodes: PulsarNode[];
    edges: Edge[];
  };
  metadata?: Record<string, any>;
}