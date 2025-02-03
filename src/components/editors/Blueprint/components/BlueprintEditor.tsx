// components/BlueprintEditor.tsx
import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Background,
  Controls,
  Edge,
  Connection,
  useReactFlow,
  Panel,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ConnectionMode,
  ReactFlowInstance,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import Editor from '@monaco-editor/react';
import { Input } from '@/components/shared/Input';
import { Search, X, Trash2 } from 'lucide-react';
import { useNodeStore } from '../store/nodeStore';
import PulsarNode from './PulsarNode';
import { generateRustCode } from '../lib/generateRust';
import { Label } from '@/components/shared/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/Select';

const nodeTypes = {
  pulsarNode: PulsarNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#2563eb',
  },
  style: {
    stroke: '#2563eb',
    strokeWidth: 2,
  },
};

const proOptions = {
  hideAttribution: true,
};

interface ContextMenu {
  show: boolean;
  x: number;
  y: number;
  position?: { x: number; y: number };
  type: 'pane' | 'node';
  nodeId?: string;
}

const BlueprintEditor = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState([]);
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

        for (const file of nodeFiles) {
          const response = await fetch(`/nodes/${file}`);
          if (!response.ok) throw new Error(`Failed to load ${file}`);
          const content = await response.text();
          loadDefinition(content);
        }
      } catch (error) {
        console.error('Error loading node definitions:', error);
      }
    };

    loadNodeDefinitions();
  }, [loadDefinition]);

  const onInit = useCallback((instance) => {
    setRfInstance(instance);
    instance.fitView();
  }, []);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const newNodes = applyNodeChanges(changes, nds);
      
      // Handle selection changes
      const selectionChange = changes.find(change => change.type === 'select');
      if (selectionChange) {
        const node = newNodes.find(n => n.id === selectionChange.id);
        if (selectionChange.selected) {
          setSelectedNode(node || null);
        } else if (selectedNode?.id === selectionChange.id) {
          setSelectedNode(null);
        }
      }
      
      return newNodes;
    });
  }, [selectedNode]);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      type: 'node',
      nodeId: node.id
    });
  }, []);

  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (!rfInstance) return;

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
  }, [rfInstance]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeFields = useCallback((nodeId: string, fieldName: string, value: any) => {
    setNodes(nds => {
      const updatedNodes = nds.map(node => {
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
          // Also update selected node if this is the one being edited
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      });
      return updatedNodes;
    });
  }, [selectedNode]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    setContextMenu({ show: false, x: 0, y: 0, type: 'pane' });
  }, [selectedNode]);

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

  const filteredDefinitions = Object.values(definitions).filter((def) =>
    def.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-screen bg-black" onClick={closeContextMenu}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
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
        <Background color="#333" gap={16} />
        <Controls 
          className="bg-gray-900 border border-gray-800 fill-gray-400"
          showInteractive={true}
          position="bottom-right"
        />
        <MiniMap
          className="bg-gray-900 border border-gray-800"
          nodeColor="#2563eb"
          position="bottom-left"
        />

        {/* Right Panel */}
        <Panel position="right" className="w-96 h-full bg-black border-l border-gray-800">
          <div className="flex flex-col h-full">
            {/* Code Preview */}
            <div className="h-1/2 border-b border-gray-800">
              <Editor
                height="100%"
                defaultLanguage="rust"
                theme="vs-dark"
                value={generateRustCode(nodes, edges)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Properties Panel */}
            <div className="h-1/2 overflow-y-auto">
              {selectedNode ? (
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">
                    {selectedNode.data.nodeDefinition.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {selectedNode.data.nodeDefinition.description}
                  </p>
                  <div className="space-y-4">
                    {Object.entries(selectedNode.data.nodeDefinition.fields).map(([fieldName, field]) => (
                      <div key={fieldName}>
                        <Label htmlFor={fieldName} className="text-gray-300">
                          {field.label}
                        </Label>
                        {field.type === 'select' ? (
                          <Select
                            value={selectedNode.data.fields[fieldName] || ''}
                            onValueChange={(value) => updateNodeFields(selectedNode.id, fieldName, value)}
                          >
                            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                              <SelectValue placeholder={`Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === 'multiline' ? (
                          <textarea
                            id={fieldName}
                            value={selectedNode.data.fields[fieldName] || ''}
                            onChange={(e) => updateNodeFields(selectedNode.id, fieldName, e.target.value)}
                            className="w-full h-24 bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-300"
                          />
                        ) : (
                          <Input
                            id={fieldName}
                            type={field.type}
                            value={selectedNode.data.fields[fieldName] || ''}
                            onChange={(e) => {
                              e.preventDefault();
                              const newValue = e.target.value;
                              requestAnimationFrame(() => {
                                updateNodeFields(selectedNode.id, fieldName, newValue);
                              });
                            }}
                            className="bg-gray-800 border-gray-700 text-gray-300"
                          />
                        )}
                        {field.description && (
                          <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-gray-500 text-center">
                  Select a node to view properties
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* Context Menus */}
        {contextMenu.show && contextMenu.type === 'node' && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 1000,
            }}
            className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-48"
          >
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-800 text-red-400 flex items-center gap-2"
              onClick={() => contextMenu.nodeId && deleteNode(contextMenu.nodeId)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Node
            </button>
          </div>
        )}

        {contextMenu.show && contextMenu.type === 'pane' && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 1000,
            }}
            className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-64"
          >
            <div className="p-2 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-gray-800 border-gray-700"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2.5"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredDefinitions.map((def) => (
                <button
                  key={def.name}
                  className="w-full px-4 py-2 text-left hover:bg-gray-800 text-gray-300"
                  onClick={() => addNode(def.name)}
                >
                  <div className="font-medium">{def.name}</div>
                  <div className="text-xs text-gray-500">{def.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default BlueprintEditor;