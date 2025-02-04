import ReactFlow, {
  MiniMap, Background, Controls,
  Panel, MarkerType, applyNodeChanges, applyEdgeChanges,
  addEdge, ConnectionMode, ReactFlowInstance, Node, Edge,
  EdgeChange, Position
} from 'reactflow';

import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import 'reactflow/dist/style.css';
import Editor from '@monaco-editor/react';
import { Input } from '@/components/shared/Input';
import { Search, X, Trash2 } from 'lucide-react';
import { useNodeStore } from '../store/nodeStore';
import PulsarNode from './PulsarNode';
import { generateRustCode } from '../lib/generateRust';
import { Label } from '@/components/shared/Label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/Select";

// Type definitions remain the same
interface FieldDefinition {
  label: string;
  type: 'text' | 'number' | 'select' | 'multiline';
  description?: string;
  default?: string | number;
  options?: string[];
}

interface NodeDefinition {
  name: string;
  description: string;
  fields: Record<string, FieldDefinition>;
  pins: {
    inputs?: Array<{ name: string; type: string }>;
    outputs?: Array<{ name: string; type: string }>;
  };
}

interface ContextMenu {
  show: boolean;
  x: number;
  y: number;
  position?: { x: number; y: number };
  type: 'pane' | 'node';
  nodeId?: string;
}

const nodeTypes = {
  pulsarNode: memo(PulsarNode),
};

// Optimized color types with static object
const TYPE_COLORS = {
  i32: '#F59E0B',
  i64: '#F59E0B',
  f32: '#F59E0B',
  f64: '#F59E0B',
  any: '#6B7280',
  array: '#10B981',
  object: '#8B5CF6',
  number: '#F59E0B',
  string: '#EC4899',
  boolean: '#3B82F6',
  default: '#6B7280',
  execution: '#6366F1'
} as const;

// Memoized edge options
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: TYPE_COLORS.default,
  },
  style: {
    stroke: TYPE_COLORS.default,
    strokeWidth: 2,
  },
};

// Memoized edge style generator
const getEdgeStyle = (sourceType: string) => ({
  type: 'smoothstep',
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: TYPE_COLORS[sourceType as keyof typeof TYPE_COLORS] || TYPE_COLORS.default,
    height: 20,
  },
  style: {
    stroke: TYPE_COLORS[sourceType as keyof typeof TYPE_COLORS] || TYPE_COLORS.default,
    strokeWidth: 2,
  },
});

const proOptions = { hideAttribution: true };

// Memoized Editor options
const editorOptions = {
  readOnly: true,
  minimap: { enabled: false },
  fontSize: 14,
  wordWrap: 'off' as 'off',
};

// Memoized components
const MemoizedEditor = memo(Editor);
const MemoizedBackground = memo(Background);
const MemoizedControls = memo(Controls);
const MemoizedMiniMap = memo(MiniMap);

// Memoized context menu component
const ContextMenuComponent = memo(({ 
  show, 
  x, 
  y, 
  type, 
  nodeId, 
  onDelete, 
  searchQuery, 
  setSearchQuery,
  filteredDefinitions,
  addNode
}: any) => {
  if (!show) return null;

  return type === 'node' ? (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'fixed', top: y, left: x, zIndex: 1000 }}
      className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl w-48"
    >
      <button
        className="w-full px-4 py-2 text-left hover:bg-neutral-800 text-red-400 flex items-center gap-2"
        onClick={() => nodeId && onDelete(nodeId)}
      >
        <Trash2 className="h-4 w-4" />
        Delete Node
      </button>
    </div>
  ) : (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'fixed', top: y, left: x, zIndex: 1000 }}
      className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl w-64"
    >
      <div className="p-2 border-b border-neutral-800">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-neutral-800 border-neutral-700"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2.5"
            >
              <X className="h-4 w-4 text-neutral-500" />
            </button>
          )}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredDefinitions.map((def: NodeDefinition) => (
          <button
            key={def.name}
            className="w-full px-4 py-2 text-left hover:bg-neutral-800 text-neutral-300"
            onClick={() => addNode(def.name)}
          >
            <div className="font-medium">{def.name}</div>
            <div className="text-xs text-neutral-500">{def.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
});

// Memoized property panel component
const PropertyPanel = memo(({ 
  selectedNode, 
  updateNodeFields 
}: { 
  selectedNode: Node | null;
  updateNodeFields: (nodeId: string, fieldName: string, value: any) => void;
}) => {
  if (!selectedNode) {
    return (
      <div className="p-4 text-neutral-500 text-center">
        Select a node to view properties
      </div>
    );
  }

  const { nodeDefinition, fields } = selectedNode.data;

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-blue-400 mb-2">
        {nodeDefinition.name}
      </h3>
      <p className="text-sm text-neutral-400 mb-4">
        {nodeDefinition.description}
      </p>
      {nodeDefinition.fields ? (
        <div className="space-y-4">
          {Object.entries(nodeDefinition.fields).map(([fieldName, field]) => (
            <div key={fieldName}>
              <Label className="text-neutral-300">{(field as FieldDefinition).label}</Label>
              {(field as FieldDefinition).type === 'select' ? (
                <Select
                  value={fields[fieldName] || ''}
                  onValueChange={(value) => updateNodeFields(selectedNode.id, fieldName, value)}
                >
                  <SelectTrigger className="w-full bg-neutral-800 border-neutral-700">
                    <SelectValue placeholder={`Select ${(field as FieldDefinition).label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(field as FieldDefinition).options?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (field as FieldDefinition).type === 'multiline' ? (
                <textarea
                  value={fields[fieldName] || ''}
                  onChange={(e) => updateNodeFields(selectedNode.id, fieldName, e.target.value)}
                  className="w-full h-24 bg-neutral-800 border border-neutral-700 rounded-md p-2 text-neutral-300"
                />
              ) : (
                <Input
                  type={(field as FieldDefinition).type}
                  value={fields[fieldName] || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    requestAnimationFrame(() => {
                      updateNodeFields(selectedNode.id, fieldName, newValue);
                    });
                  }}
                  className="bg-neutral-800 border-neutral-700 text-neutral-300"
                />
              )}
              {(field as FieldDefinition).description && (
                <p className="text-xs text-neutral-500 mt-1">{(field as FieldDefinition).description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">This node has no configurable fields.</p>
      )}
    </div>
  );
});

const BlueprintEditor = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    show: false,
    x: 0,
    y: 0,
    type: 'pane'
  });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const { definitions, loadDefinition } = useNodeStore();

  // Memoized filtered definitions
  const filteredDefinitions = useMemo(() => 
    Object.values(definitions).filter((def) =>
      def.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [definitions, searchQuery]
  );

  // Load node definitions
  useEffect(() => {
    const loadNodeDefinitions = async () => {
      try {
        const nodeFiles = [
          'arithmetic.yaml',
          'control_flow.yaml',
          'variables.yaml',
          'functions.yaml',
          'types.yaml'
        ];

        await Promise.all(nodeFiles.map(async (file) => {
          const response = await fetch(`/nodes/${file}`);
          if (!response.ok) throw new Error(`Failed to load ${file}`);
          const content = await response.text();
          loadDefinition(content);
        }));
      } catch (error) {
        console.error('Error loading node definitions:', error);
      }
    };

    loadNodeDefinitions();
  }, [loadDefinition]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setRfInstance(instance);
    instance.fitView();
  }, []);

  const onNodesChange = useCallback((changes: any[]) => {
    setNodes((nds) => {
      const newNodes = applyNodeChanges(changes, nds);
      const selectionChange = changes.find((change) => change.type === 'select');
      if (selectionChange) {
        const node = newNodes.find(n => n.id === selectionChange.id);
        setSelectedNode(selectionChange.selected ? node || null : null);
      }
      return newNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params: any) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const sourcePin = sourceNode?.data.nodeDefinition.pins.outputs?.find(
      (p: { name: string }) => p.name === params.sourceHandle
    );

    if (sourceNode && sourcePin) {
      const edgeStyle = getEdgeStyle(sourcePin.type);
      const connection = {
        id: `edge-${params.source}-${params.target}`,
        ...params,
        ...edgeStyle
      };
      setEdges((eds) => addEdge(connection, eds));
    }
  }, [nodes]);

  const handleContextMenu = useCallback((event: React.MouseEvent, node?: Node) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (node) {
      setContextMenu({
        show: true,
        x: event.clientX,
        y: event.clientY,
        type: 'node',
        nodeId: node.id
      });
    } else if (rfInstance) {
      const { left, top } = event.currentTarget.getBoundingClientRect();
      const position = rfInstance.project({
        x: event.clientX - left,
        y: event.clientY - top,
      });
      
      setContextMenu({
        show: true,
        x: event.clientX,
        y: event.clientY,
        position,
        type: 'pane'
      });
    }
  }, [rfInstance]);

  const updateNodeFields = useCallback((nodeId: string, fieldName: string, value: any) => {
    setNodes(nds => {
      return nds.map(node => {
        if (node.id === nodeId) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              fields: {
                ...node.data.fields,
                [fieldName]: value
              }
            }
          };
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      });
    });
  }, [selectedNode]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) =>
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode((prev) => prev?.id === nodeId ? null : prev);
    setContextMenu({ show: false, x: 0, y: 0, type: 'pane' });
  }, []);

  const addNode = useCallback((type: string) => {
    if (!contextMenu.position) return;

    const definition = definitions[type];
    if (!definition) return;

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'pulsarNode',
      position: contextMenu.position,
      data: {
        nodeDefinition: definition,
        fields: Object.fromEntries(
          Object.entries(definition.fields || {}).map(([key, field]) => [
            key,
            field.default ?? ''
          ])
        ),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setContextMenu({ show: false, x: 0, y: 0, type: 'pane' });
  }, [contextMenu.position, definitions]);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0, type: 'pane' });
  }, []);

  // Memoized Rust code generation
  const generatedRustCode = useMemo(() => generateRustCode(nodes, edges), [nodes, edges]);

  return (
    <div className="w-full h-screen bg-black" onClick={closeContextMenu}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={(_, node) => setSelectedNode(node)}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onContextMenu={(e) => handleContextMenu(e)}
        onNodeContextMenu={(e, node) => handleContextMenu(e, node)}
        connectionMode={ConnectionMode.Loose}
        minZoom={0.1}
        maxZoom={4}
        proOptions={proOptions}
        fitView
        className="bg-black"
        deleteKeyCode="Delete"
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Control"
        zoomActivationKeyCode="Control"
        panActivationKeyCode="Space"
      >
        <MemoizedBackground color="#333" gap={16} />
        <MemoizedControls
          className="bg-neutral-900 border border-neutral-800 fill-neutral-400"
          showInteractive={true}
          position="bottom-right"
        />
        <MemoizedMiniMap
          className="bg-neutral-900 border border-neutral-800"
          nodeColor="#2563eb"
          position="bottom-left"
        />

        {/* Right Panel */}
        <Panel position="top-right" className="w-96 h-full bg-black border-l border-neutral-800">
          <div className="flex flex-col h-full">
            {/* Code Preview */}
            <div className="h-1/2 border-b border-neutral-800">
              <MemoizedEditor
                height="100%"
                defaultLanguage="rust"
                theme="vs-dark"
                value={generatedRustCode}
                options={editorOptions}
              />
            </div>

            {/* Properties Panel */}
            <div className="h-1/2 overflow-y-auto">
              <PropertyPanel
                selectedNode={selectedNode}
                updateNodeFields={updateNodeFields}
              />
            </div>
          </div>
        </Panel>

        {/* Context Menu */}
        <ContextMenuComponent
          show={contextMenu.show}
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          nodeId={contextMenu.nodeId}
          onDelete={deleteNode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredDefinitions={filteredDefinitions}
          addNode={addNode}
        />
      </ReactFlow>
    </div>
  );
};

export default memo(BlueprintEditor);