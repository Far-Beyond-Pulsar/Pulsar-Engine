

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
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from 'styled-components';
import { Menu, Item, useContextMenu, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-rows: 3fr 2fr;
  grid-template-areas:
    'editor canvas'
    'output canvas';
  gap: 0.6em;
  padding: 0.6em;
  background: #000000;
  color: #ffffff;
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
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

const OutputWrapper = styled.div`
  grid-area: output;
  background: #000000;
  border: 1px solid #1f1f1f;
  padding: 10px;
  overflow-y: auto;
  color: #00ff00;  // Hacker-style green for output
`;

// AMOLED-inspired node styling
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
    color: #3B82F6;  // Hacker green
    margin-bottom: 5px;
    text-transform: uppercase;
  }
  
  .node-details {
    font-size: 0.9em;
    color: #888888;
    word-break: break-all;
  }

  .node-handles {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    color: #3B82F6;  // Hacker green
  }
`;

// AMOLED-style edge
const StyledEdge = styled.path`
  stroke: #3B82F6;  // Hacker green
  stroke-width: 2;
  fill: none;
`;

// Custom Unreal-style node component
const UnrealNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <StyledNode>
      <div className="node-type">{data.label}</div>
      <div className="node-details">{data.details || 'No details'}</div>
      <div className="node-handles">
        <div>In</div>
        <div>Out</div>
      </div>
    </StyledNode>
  );
};

// Custom edge component
const UnrealEdge: React.FC<EdgeProps> = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition,
  style = {}
}) => {
  const edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  return (
    <StyledEdge
      d={edgePath}
      style={{ ...style }}
    />
  );
};

// Rust code generation utility
function generateRustCode(nodes: Node[], edges: Edge[]) {
  let rustCode = "// Generated Rust Code\n\n";
  
  // Create a map of nodes for easy reference
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  // Sort nodes by their position to create a logical flow
  const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
  
  sortedNodes.forEach(node => {
    switch(node.data.label) {
      case 'Variable':
        rustCode += `let mut ${node.id}_${node.data.details || 'variable_name'}: ${node.data.type || 'i32'} = ${node.data.value || '0'};\n`;
        break;
      case 'Function':
        rustCode += `fn ${node.id}_${node.data.details || 'function_name'}() {\n  // Function body\n}\n\n`;
        break;
      case 'If Statement':
        rustCode += `if ${node.data.condition || 'true'} {\n  // If block\n} else {\n  // Else block\n}\n\n`;
        break;
      case 'Loop':
        rustCode += `for _ in 0..${node.data.iterations || '10'} {\n  // Loop body\n}\n\n`;
        break;
      case 'Print':
        rustCode += `println!("${node.data.message || 'Hello, World!'}}");\n`;
        break;
    }
  });

  return rustCode;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const nodeTypes: NodeTypes = {
  unrealNode: UnrealNode
};

const edgeTypes: EdgeTypes = {
  unrealEdge: UnrealEdge
};

const initialNodeTypes = ['Variable', 'Function', 'If Statement', 'Loop', 'Print'];

export function AMOLEDRetoolEditor() {
  const [code, setCode] = useState('// Start coding...');
  const [rustCode, setRustCode] = useState('// Generated Rust Code');
  const debouncedCode = useDebounce(code, 500);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { show } = useContextMenu({ id: 'node-menu' });
  const canvasRef = useRef(null);
  const editorRef = useRef<monaco.IStandaloneCodeEditor | null>(null);

  // Regenerate Rust code whenever nodes or edges change
  useEffect(() => {
    const generatedRustCode = generateRustCode(nodes, edges);
    setRustCode(generatedRustCode);

    // Update Monaco Editor with generated Rust code
    if (editorRef.current) {
      const monaco = editorRef.current.getModel();
      if (monaco) {
        monaco.setValue(generatedRustCode);
      }
    }
  }, [nodes, edges]);

  const handleContextMenu = (event: { preventDefault: () => void; clientX: any; clientY: any; }) => {
    event.preventDefault();
    show({ event: event as React.MouseEvent, props: { x: event.clientX, y: event.clientY } });
  };

  const addNode = (type: string, x = 200, y = 200) => {
    const newNode: Node = {
      id: `node_${nodes.length + 1}`,
      type: 'unrealNode',
      data: { 
        label: type,
        details: `${type} details`,
        type: type === 'Variable' ? 'i32' : undefined,
        value: type === 'Variable' ? '0' : undefined
      },
      position: { x: Number(x) || 200, y: Number(y) || 200 }
    };
    
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  // Node change handler
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Edge change handler
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Connection handler
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `edge_${edges.length + 1}`,
        source: connection.source || '',
        target: connection.target || '',
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'unrealEdge',
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );
  
  const options = {
    theme: 'vs-dark',
    minimap: { enabled: true },
    padding: { top: 5, bottom: 0, left: 5, right: 5 }
  };

  return (
    <Layout>
      <EditorWrapper>
        <Editor
          language="rust"
          value={rustCode}
          onChange={(value) => setCode(value || '')}
          options={options}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </EditorWrapper>
      <OutputWrapper>
        <h3>Nodes and Connections Debug:</h3>
        <pre>
          Nodes: {JSON.stringify(nodes, null, 2)}
          Edges: {JSON.stringify(edges, null, 2)}
        </pre>
      </OutputWrapper>
      <CanvasWrapper ref={canvasRef} onContextMenu={handleContextMenu}>
        <ReactFlow 
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionLineType={ConnectionLineType.Straight}
        >
          <Background color="#333" variant="dots" />
          <Controls />
          <MiniMap />
        </ReactFlow>
        <Menu id="node-menu">
          <Submenu label="Add Node">
            {initialNodeTypes.map((type) => (
              <Item 
                key={type} 
                onClick={(e) => addNode(type, e.props?.x ?? 200, e.props?.y ?? 200)}
              >
                {type}
              </Item>
            ))}
          </Submenu>
          <Item onClick={() => {
            setNodes([]);
            setEdges([]);
          }}>Clear All</Item>
        </Menu>
      </CanvasWrapper>
    </Layout>
  );
}

export default AMOLEDRetoolEditor;