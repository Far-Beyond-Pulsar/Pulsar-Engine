import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { LoaderComponent } from 'next/dynamic';

// Define proper types for dynamic imports
type DynamicImportType<T> = Promise<{ default: ComponentType<T> }>;

// Explicitly handle each dynamic import with proper types
export const Editor = dynamic<{}>(
  () => import('./components/Editor').then((mod) => mod.default),
  {
    loading: () => <div>Loading editor...</div>,
    ssr: false
  }
);

export const UnrealNode = dynamic<{}>(
  () => import('./components/UnrealNode').then((mod) => mod.default),
  {
    loading: () => <div>Loading node...</div>,
    ssr: false
  }
);

export const NodeDetailsPanel = dynamic<{}>(
  () => import('./components/NodeDetailsPanel').then((mod) => mod.default),
  {
    loading: () => <div>Loading details panel...</div>,
    ssr: false
  }
);

export const NodeEditorProvider = dynamic<{}>(
  () => import('./context/NodeEditorContext').then((mod) => mod.NodeEditorProvider),
  {
    loading: () => <div>Loading editor context...</div>,
    ssr: false
  }
);

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

// Export node configurations
export { NODE_CONFIGS } from './utils/nodeConfigs';

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