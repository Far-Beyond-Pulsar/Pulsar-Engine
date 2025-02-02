import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { NodeProps } from 'reactflow';

// Define proper types for component props
interface NodeDetailsPanelProps {
  selectedNode: any;
  onUpdateNode: (nodeId: string, newData: any) => void;
  setSelectedNode: (node: any | null) => void;
}

// Dynamic imports with proper promise resolution and type checking
const Editor = dynamic(
  () => import('./components/Editor').then((mod) => {
    if (!mod.default) throw new Error('No default export found in Editor');
    return mod.default;
  }),
  {
    loading: () => <div>Loading editor...</div>,
    ssr: false
  }
);

const UnrealNode = dynamic(
  () => import('./components/UnrealNode').then((mod) => {
    if (!mod.UnrealNode) throw new Error('No UnrealNode export found');
    return mod.UnrealNode;
  }),
  {
    loading: () => <div>Loading node...</div>,
    ssr: false
  }
);

const NodeDetailsPanel = dynamic(
  () => import('./components/NodeDetailsPanel').then((mod) => {
    if (!mod.NodeDetailsPanel) throw new Error('No NodeDetailsPanel export found');
    return mod.NodeDetailsPanel;
  }),
  {
    loading: () => <div>Loading details panel...</div>,
    ssr: false
  }
);

const NodeEditorProvider = dynamic(
  () => import('./context/NodeEditorContext').then((mod) => {
    if (!mod.NodeEditorProvider) throw new Error('No NodeEditorProvider export found');
    return mod.NodeEditorProvider;
  }),
  {
    loading: () => <div>Loading editor context...</div>,
    ssr: false
  }
);

// Export components
export {
  Editor,
  UnrealNode,
  NodeDetailsPanel,
  NodeEditorProvider
};

// Export hooks and utilities
export { useNodeEditor } from './context/NodeEditorContext';

// Export types
export type { 
  NodeEditorContextType,
  ExtendedNode,
  NodeHighlightGroup
} from './context/NodeEditorContext';

// Re-export hook from hooks directory
export { useNodeEditor as useNodeEditorHook } from './hooks/useNodeEditor';

// Export code generator
export { CodeGenerator as generateRustCode } from './utils/codeGenerator';

// Export styles and components
export { 
  Layout, 
  EditorWrapper, 
  CanvasWrapper, 
  DetailsPanel, 
  THEME, 
  GlobalStyles,
  styleMixins,
  Typography
} from './utils/styles';

// Export types
export type { NodeEditorState, NodeEditAction } from './types';
export type { Node, Edge } from 'reactflow';