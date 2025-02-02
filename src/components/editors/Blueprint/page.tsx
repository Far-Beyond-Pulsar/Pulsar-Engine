// Main Editor Export
export { Editor } from './components/Editor';

// Components
export { UnrealNode } from './components/UnrealNode';
export { NodeDetailsPanel } from './components/NodeDetailsPanel';
import { NodeEditorContext } from './components/Editor';

// Context
/**
 * @module NodeEditor
 * @description Exports core functionality for the Node Editor component
 * 
 * @exports NodeEditorContext - Context object for the Node Editor
 * @exports NodeEditorProvider - Provider component that wraps the Node Editor functionality
 * @exports useNodeEditor - Custom hook to access Node Editor context
 * @exports NodeEditorContextType - Type definition for the Node Editor context
 * @exports ExtendedNode - Type definition for nodes with additional properties
 * @exports NodeHighlightGroup - Type definition for node highlighting groups
 * 
 * @example
 * import { NodeEditorProvider, useNodeEditor } from './context/NodeEditorContext';
 * 
 * // Wrap your component with the provider
 * <NodeEditorProvider>
 *   <YourComponent />
 * </NodeEditorProvider>
 * 
 * // Use the context in your components
 * const { nodes, edges } = useNodeEditor();
 */
export { 
  NodeEditorContext, 
  NodeEditorProvider,
  useNodeEditor,
  type NodeEditorContextType,
  type ExtendedNode,
  type NodeHighlightGroup
} from './context/NodeEditorContext';

// Hooks
export { useNodeEditor as useNodeEditorHook } from './hooks/useNodeEditor';

// Utilities
export { NODE_CONFIGS } from './utils/nodeConfigs';
export { generateRustCode } from './utils/codeGenerator';

// Styles
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

// Types
export type { 
  NodeEditorState,
  NodeEditAction,
  Node,
  Edge
} from './types';