import { Node, Edge } from 'reactflow';

export interface NodeEditorState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
}

export interface NodeEditAction {
  type: 'ADD_NODE' | 'UPDATE_NODE' | 'DELETE_NODE' | 'CLEAR_ALL';
  payload?: any;
}