import { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { editor as monaco } from 'monaco-editor';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  NodeProps,
  EdgeProps,
  Connection,
  ConnectionLineType,
  NodeChange,
  EdgeChange,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from 'styled-components';
import { Menu, Item, useContextMenu, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

// Keeping your existing styled components
const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 300px;
  grid-template-areas:
    'editor canvas details';
  gap: 0.6em;
  padding: 0.6em;
  background: #000000;
  color: #ffffff;
  box-sizing: border-box;
  overflow: hidden;
  height: calc(100% - 24px);
  width: 100%;
`;

const DetailsPanel = styled.div`
  grid-area: details;
  background: #121212;
  border: 1px solid #1f1f1f;
  padding: 1em;
  overflow-y: auto;
`;

const EditorWrapper = styled.div`
  grid-area: editor;
  position: relative;
  background: #000000;
  border: 1px solid #1f1f1f;
`;

const CanvasWrapper = styled.div`
  grid-area: canvas;
  position: relative;
  background: #000000;
  border: 1px solid #1f1f1f;
`;

const StyledNode = styled.div`
  background: #121212;
  border: 2px solid #333333;
  border-radius: 8px;
  padding: 10px;
  min-width: 150px;
  max-width: 200px;
  box-shadow: 0 4px 6px rgba(255,255,255,0.05);
  color: #ffffff;
  font-family: 'Arial', sans-serif;
  
  .node-type {
    font-weight: bold;
    color: #3B82F6;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
  
  .node-details {
    font-size: 0.9em;
    color: #888888;
    word-break: break-all;
  }
`;

const FormField = styled.div`
  margin-bottom: 1em;
  
  label {
    display: block;
    margin-bottom: 0.5em;
    color: #3B82F6;
  }
  
  input {
    width: 100%;
    padding: 0.5em;
    background: #1f1f1f;
    border: 1px solid #333;
    color: #fff;
    border-radius: 4px;
  }
`;

// Node configuration for different types
const NODE_CONFIGS = {
  Variable: {
    fields: {
      name: { type: 'text', label: 'Variable Name' },
      type: { type: 'text', label: 'Type' },
      value: { type: 'text', label: 'Initial Value' }
    },
    handles: {
      inputs: [],
      outputs: ['value']
    }
  },
  Function: {
    fields: {
      name: { type: 'text', label: 'Function Name' },
      returnType: { type: 'text', label: 'Return Type' }
    },
    handles: {
      inputs: ['params'],
      outputs: ['return']
    }
  },
  'If Statement': {
    fields: {},
    handles: {
      inputs: ['condition:bool'],
      outputs: ['true', 'false']
    }
  },
  'AND Gate': {
    fields: {},
    handles: {
      inputs: ['A:bool', 'B:bool'],
      outputs: ['result:bool']
    }
  },
  'OR Gate': {
    fields: {},
    handles: {
      inputs: ['A:bool', 'B:bool'],
      outputs: ['result:bool']
    }
  },
  'NOT Gate': {
    fields: {},
    handles: {
      inputs: ['input:bool'],
      outputs: ['result:bool']
    }
  },
  'Greater Than': {
    fields: {},
    handles: {
      inputs: ['A:number', 'B:number'],
      outputs: ['result:bool']
    }
  },
  'Less Than': {
    fields: {},
    handles: {
      inputs: ['A:number', 'B:number'],
      outputs: ['result:bool']
    }
  },
  'Equals': {
    fields: {},
    handles: {
      inputs: ['A', 'B'],
      outputs: ['result:bool']
    }
  },
  'Greater Than or Equal': {
    fields: {},
    handles: {
      inputs: ['A:number', 'B:number'],
      outputs: ['result:bool']
    }
  },
  'Less Than or Equal': {
    fields: {},
    handles: {
      inputs: ['A:number', 'B:number'],
      outputs: ['result:bool']
    }
  },
  Loop: {
    fields: {
      type: { type: 'text', label: 'Loop Type' },
      condition: { type: 'text', label: 'Condition/Range' }
    },
    handles: {
      inputs: ['init'],
      outputs: ['body', 'next']
    }
  }
};

// Custom Node Component with proper handles
const UnrealNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const config = NODE_CONFIGS[data.label as keyof typeof NODE_CONFIGS];
  
  return (
    <StyledNode>
      <div className="node-type">{data.label}</div>
      
      {/* Input Handles */}
      {config.handles.inputs.map((handle, index) => (
        <Handle
          key={`input-${handle}`}
          type="target"
          position={Position.Left}
          id={handle}
          style={{ top: `${25 + (index * 20)}%` }}
        />
      ))}
      
      {/* Output Handles */}
      {config.handles.outputs.map((handle, index) => (
        <Handle
          key={`output-${handle}`}
          type="source"
          position={Position.Right}
          id={handle}
          style={{ top: `${25 + (index * 20)}%` }}
        />
      ))}
      
      <div className="node-details">
        {data.fields && Object.entries(data.fields).map(([key, value]) => (
          <div key={key}>{key}: {value as string}</div>
        ))}
      </div>
    </StyledNode>
  );
};

// Details Panel Component
interface NodeDetailsPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, newData: any) => void;
  setSelectedNode: (node: Node | null) => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ selectedNode, onUpdateNode, setSelectedNode }) => {
  console.log('Details Panel - Selected Node:', selectedNode); // Debug log
  
  if (!selectedNode) {
    return <DetailsPanel>
      <div className="p-4 text-gray-400">Select a node to view details</div>
    </DetailsPanel>;
  }

  const config = NODE_CONFIGS[selectedNode.data.label as keyof typeof NODE_CONFIGS];
  if (!config) {
    return <DetailsPanel>
      <div className="p-4 text-red-500">Invalid node type</div>
    </DetailsPanel>;
  }
  
  const handleFieldUpdate = (fieldName: string, value: string) => {
    const updatedFields = {
      ...selectedNode.data.fields,
      [fieldName]: value
    };
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        fields: updatedFields
      }
    };
    setSelectedNode(updatedNode);
    onUpdateNode(selectedNode.id, updatedNode.data);
  };

  return (
    <DetailsPanel>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-4">{selectedNode.data.label} Details</h3>
        <div className="space-y-4">
          {Object.entries(config.fields).map(([fieldName, fieldConfig]) => (
            <FormField key={fieldName}>
              <label className="block mb-2">{fieldConfig.label}</label>
              <input
                type={fieldConfig.type}
                value={selectedNode.data.fields?.[fieldName] || ''}
                onChange={(e) => handleFieldUpdate(fieldName, e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
              />
            </FormField>
          ))}
        </div>
      </div>
    </DetailsPanel>
  );
};

// Define nodeTypes outside component to prevent recreation
const nodeTypes = {
  unrealNode: UnrealNode
};

export function AMOLEDRetoolEditor() {
  const [code, setCode] = useState('// Start coding...');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { show } = useContextMenu({ id: 'node-menu' });
  const editorRef = useRef<monaco.IStandaloneCodeEditor | null>(null);
  const [editorTheme, setEditorTheme] = useState('vs-dark');

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    show({ 
      event,
      props: { 
        x: event.clientX,
        y: event.clientY
      }
    });
  }, [show]);

  const onNodeClick = useCallback((event: React.MouseEvent, clickedNode: Node) => {
    event.stopPropagation();
    console.log('Node clicked:', clickedNode); // Debug log
    setSelectedNode(clickedNode);
  }, []);

  const updateSelectedNode = useCallback((nodeId: string, newData: any) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: newData }
          : node
      )
    );
  }, []);

  // Add a new node with proper configuration
  const addNode = (type: string, x = 200, y = 200) => {
    const config = NODE_CONFIGS[type as keyof typeof NODE_CONFIGS];
    const initialFields = Object.keys(config.fields).reduce((acc, fieldName) => ({
      ...acc,
      [fieldName]: ''
    }), {});

    const newNode: Node = {
      id: `node_${nodes.length + 1}`,
      type: 'unrealNode',
      data: { 
        label: type,
        fields: initialFields
      },
      position: { x: Number(x), y: Number(y) }
    };
    
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      // Clear selected node if it was deleted
      if (changes.some(change => change.type === 'remove' && change.id === selectedNode?.id)) {
        setSelectedNode(null);
      }
    },
    [selectedNode]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `edge_${edges.length + 1}`,
        source: connection.source || '',
        target: connection.target || '',
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'unrealEdge'
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges]
  );

  // Generate Rust code based on node connections
  const generateRustCode = useCallback(() => {
    let rustCode = "// Generated Rust Code\n\n";
    
    // Create maps of nodes and their connections
    const nodeConnections = edges.reduce((acc, edge) => {
      if (!acc[edge.source]) acc[edge.source] = [];
      acc[edge.source].push(edge);
      return acc;
    }, {} as Record<string, Edge[]>);

    const incomingConnections = edges.reduce((acc, edge) => {
      if (!acc[edge.target]) acc[edge.target] = [];
      acc[edge.target].push(edge);
      return acc;
    }, {} as Record<string, Edge[]>);
    
    // Find root nodes (any node with no incoming edges or If Statement nodes)
    const rootNodes = nodes.filter(node => 
      node.data.label === 'If Statement' ||
      !edges.some(edge => edge.target === node.id)
    );
    
    // Helper function to get the input source for a node's input handle
    const getInputSource = (nodeId: string, handleId: string): string => {
      const incoming = incomingConnections[nodeId] || [];
      const connection = incoming.find(edge => edge.targetHandle === handleId);
      if (!connection) return 'false'; // Default for unconnected boolean inputs
      
      const sourceNode = nodes.find(n => n.id === connection.source);
      if (!sourceNode) return 'false';

      switch(sourceNode.data.label) {
        case 'Equals':
          const aSource = getInputSource(sourceNode.id, 'A');
          const bSource = getInputSource(sourceNode.id, 'B');
          return `(${aSource} == ${bSource})`;
        case 'Variable':
          return sourceNode.data.fields.name;
        case 'AND Gate':
          return `(${getInputSource(sourceNode.id, 'A:bool')} && ${getInputSource(sourceNode.id, 'B:bool')})`;
        case 'OR Gate':
          return `(${getInputSource(sourceNode.id, 'A:bool')} || ${getInputSource(sourceNode.id, 'B:bool')})`;
        case 'NOT Gate':
          return `!${getInputSource(sourceNode.id, 'input:bool')}`;
        case 'Greater Than':
          return `(${getInputSource(sourceNode.id, 'A:number')} > ${getInputSource(sourceNode.id, 'B:number')})`;
        case 'Less Than':
          return `(${getInputSource(sourceNode.id, 'A:number')} < ${getInputSource(sourceNode.id, 'B:number')})`;
        case 'Greater Than or Equal':
          return `(${getInputSource(sourceNode.id, 'A:number')} >= ${getInputSource(sourceNode.id, 'B:number')})`;
        case 'Less Than or Equal':
          return `(${getInputSource(sourceNode.id, 'A:number')} <= ${getInputSource(sourceNode.id, 'B:number')})`;
        default:
          return 'false';
      }
    };

    // Generate expression for a node
    const generateNodeExpression = (node: Node): string => {
      switch(node.data.label) {
        case 'Variable':
          return node.data.fields.name || 'undefined_var';
        case 'AND Gate':
          return `(${getInputSource(node.id, 'A:bool')} && ${getInputSource(node.id, 'B:bool')})`;
        case 'OR Gate':
          return `(${getInputSource(node.id, 'A:bool')} || ${getInputSource(node.id, 'B:bool')})`;
        case 'NOT Gate':
          return `!${getInputSource(node.id, 'input:bool')}`;
        case 'Greater Than':
          return `(${getInputSource(node.id, 'A:number')} > ${getInputSource(node.id, 'B:number')})`;
        case 'Less Than':
          return `(${getInputSource(node.id, 'A:number')} < ${getInputSource(node.id, 'B:number')})`;
        case 'Equals':
          return `(${getInputSource(node.id, 'A')} == ${getInputSource(node.id, 'B')})`;
        case 'Greater Than or Equal':
          return `(${getInputSource(node.id, 'A:number')} >= ${getInputSource(node.id, 'B:number')})`;
        case 'Less Than or Equal':
          return `(${getInputSource(node.id, 'A:number')} <= ${getInputSource(node.id, 'B:number')})`;
        default:
          return 'true';
      }
    };

    // Process a node and its connections
    const processNode = (node: Node, indent: string = '', processed = new Set<string>()): string => {
      if (processed.has(node.id)) return '';
      processed.add(node.id);
      
      let nodeCode = '';
      const connections = nodeConnections[node.id] || [];
      
      switch(node.data.label) {
        case 'Variable':
          nodeCode = `${indent}let mut ${node.data.fields.name}: ${node.data.fields.type} = ${node.data.fields.value};\n`;
          break;

        case 'Function':
          nodeCode = `${indent}fn ${node.data.fields.name}() -> ${node.data.fields.returnType} {\n`;
          // Process function body (connected nodes)
          connections.forEach(conn => {
            const targetNode = nodes.find(n => n.id === conn.target);
            if (targetNode) {
              nodeCode += processNode(targetNode, indent + '    ', processed);
            }
          });
          nodeCode += `${indent}}\n`;
          break;

        case 'If Statement':
          const condition = getInputSource(node.id, 'condition:bool');
          nodeCode += `${indent}if ${condition} {\n`;
          
          // Process true branch
          const trueConnections = connections.filter(conn => conn.sourceHandle === 'true');
          trueConnections.forEach(conn => {
            const targetNode = nodes.find(n => n.id === conn.target);
            if (targetNode) {
              nodeCode += processNode(targetNode, indent + '    ', processed);
            }
          });
          
          nodeCode += `${indent}} else {\n`;
          
          // Process false branch
          const falseConnections = connections.filter(conn => conn.sourceHandle === 'false');
          falseConnections.forEach(conn => {
            const targetNode = nodes.find(n => n.id === conn.target);
            if (targetNode) {
              nodeCode += processNode(targetNode, indent + '    ', processed);
            }
          });
          
          nodeCode += `${indent}}\n`;
          break;
      }
      
      return nodeCode;
    };
    
    // Process all root nodes
    rootNodes.forEach(node => {
      rustCode += processNode(node);
    });
    
    return rustCode;
  }, [nodes, edges]);

  // Update generated code when nodes or edges change
  useEffect(() => {
    const rustCode = generateRustCode();
    setCode(rustCode);
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        model.setValue(rustCode);
      }
    }
  }, [nodes, edges, generateRustCode]);

  const proOptions = { hideAttribution: true };

  return (
    <Layout>
      <NodeDetailsPanel 
        selectedNode={selectedNode}
        onUpdateNode={updateSelectedNode}
        setSelectedNode={setSelectedNode}
      />
      <EditorWrapper>
        <Editor
          height="100%"
          language="rust"
          value={code}
          theme={editorTheme}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </EditorWrapper>
      <CanvasWrapper onContextMenu={handleContextMenu}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          proOptions={proOptions}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNode(null)}
          connectionLineType={ConnectionLineType.Straight}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background color="#333" />
          <Controls />
          <MiniMap />
        </ReactFlow>
        <Menu id="node-menu">
          <Submenu label="Add Node">
            {Object.keys(NODE_CONFIGS).map((type) => (
              <Item 
                key={type} 
                onClick={({ props }) => addNode(type, props?.x, props?.y)}
              >
                {type}
              </Item>
            ))}
          </Submenu>
          <Item onClick={() => {
            setNodes([]);
            setEdges([]);
            setSelectedNode(null);
          }}>Clear All</Item>
        </Menu>
      </CanvasWrapper>
    </Layout>
  );
}

export default AMOLEDRetoolEditor;