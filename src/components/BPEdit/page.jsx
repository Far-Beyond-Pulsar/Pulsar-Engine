import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const NODE_TYPES = {
  EVENT: {
    type: 'event',
    title: 'On Begin Play',
    color: 'bg-red-900',
    inputs: [],
    outputs: ['Exec'],
  },
  BRANCH: {
    type: 'branch',
    title: 'Branch',
    color: 'bg-purple-900',
    inputs: ['Exec', 'Condition'],
    outputs: ['True', 'False'],
  },
  PRINT: {
    type: 'print',
    title: 'Print String',
    color: 'bg-blue-900',
    inputs: ['Exec', 'String'],
    outputs: ['Exec'],
  },
  VARIABLE: {
    type: 'variable',
    title: 'Get Variable',
    color: 'bg-green-900',
    inputs: [],
    outputs: ['Value'],
  },
  MATH: {
    type: 'math',
    title: 'Add',
    color: 'bg-yellow-900',
    inputs: ['A', 'B'],
    outputs: ['Result'],
  },
  DELAY: {
    type: 'delay',
    title: 'Delay',
    color: 'bg-orange-900',
    inputs: ['Exec', 'Duration'],
    outputs: ['Exec'],
  },
};

const BlueprintEditor = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const canvasRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

  // Track mouse position for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingNode) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - draggingNode.offsetX;
        const y = e.clientY - rect.top - draggingNode.offsetY;
        setDragPos({ x, y });
        
        // Update node position in real-time
        setNodes(nodes.map(node =>
          node.id === draggingNode.id ? { ...node, x, y } : node
        ));
      }
    };

    const handleMouseUp = () => {
      setDraggingNode(null);
      if (connecting && !connecting.target) {
        setConnecting(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNode, nodes, connecting]);

  // Handle node header mouse down
  const handleNodeMouseDown = (e, nodeId) => {
    if (e.target.closest('.node-header')) {
      e.stopPropagation();
      const node = nodes.find(n => n.id === nodeId);
      const rect = canvasRef.current.getBoundingClientRect();
      setDraggingNode({
        id: nodeId,
        offsetX: e.clientX - rect.left - node.x,
        offsetY: e.clientY - rect.top - node.y
      });
    }
  };

  // Handle port interactions
  const handlePortMouseDown = (e, node, port, isOutput) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const portRect = e.currentTarget.getBoundingClientRect();
    
    setConnecting({
      sourceId: node.id,
      sourcePort: port,
      isOutput,
      startX: portRect.left - rect.left + portRect.width / 2,
      startY: portRect.top - rect.top + portRect.height / 2,
      mouseX: e.clientX - rect.left,
      mouseY: e.clientY - rect.top
    });
  };

  const handlePortMouseUp = (e, node, port, isOutput) => {
    e.stopPropagation();
    
    if (connecting && connecting.isOutput !== isOutput) {
      const source = connecting.isOutput ? 
        { id: connecting.sourceId, port: connecting.sourcePort } :
        { id: node.id, port };
      const target = connecting.isOutput ?
        { id: node.id, port } :
        { id: connecting.sourceId, port: connecting.sourcePort };

      const connectionExists = connections.some(conn =>
        (conn.sourceId === source.id && conn.sourcePort === source.port &&
         conn.targetId === target.id && conn.targetPort === target.port) ||
        (conn.sourceId === target.id && conn.sourcePort === target.port &&
         conn.targetId === source.id && conn.targetPort === source.port)
      );

      if (!connectionExists) {
        setConnections([...connections, {
          id: `${source.id}-${source.port}-${target.id}-${target.port}`,
          sourceId: source.id,
          sourcePort: source.port,
          targetId: target.id,
          targetPort: target.port
        }]);
      }
    }
    setConnecting(null);
  };

  // Context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setSearchTerm('');
  };

  // Add new node
  const addNode = (type) => {
    const nodeType = NODE_TYPES[type];
    setNodes([...nodes, {
      id: `node-${nodes.length + 1}`,
      type,
      x: contextMenu.x,
      y: contextMenu.y,
      ...nodeType
    }]);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // Filter nodes based on search
  const filteredNodeTypes = Object.entries(NODE_TYPES).filter(([key, node]) =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Connection line component
  const ConnectionLine = ({ source, target, dashed }) => {
    const sourceNode = nodes.find(n => n.id === source.id);
    const targetNode = nodes.find(n => n.id === target.id);
    
    if (!sourceNode || !targetNode) return null;

    const sourceX = sourceNode.x + 200;
    const sourceY = sourceNode.y + 30 + (sourceNode.outputs.indexOf(source.port) * 24);
    const targetX = targetNode.x;
    const targetY = targetNode.y + 30 + (targetNode.inputs.indexOf(target.port) * 24);
    
    const path = `M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY}, ${targetX - 50} ${targetY}, ${targetX} ${targetY}`;
    
    return (
      <path
        d={path}
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeDasharray={dashed ? "5,5" : "none"}
        className="pointer-events-none"
      />
    );
  };

  // Node component
  const Node = ({ node }) => (
    <div
      className="absolute w-48 rounded-lg shadow-lg overflow-hidden"
      style={{ 
        left: node.x,
        top: node.y,
        transform: `translate(0, 0)`,
        transition: draggingNode?.id === node.id ? 'none' : 'all 0.1s ease-out'
      }}
      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
    >
      <div className={`px-4 py-2 text-white font-semibold ${node.color} cursor-move node-header`}>
        {node.title}
      </div>
      <div className="p-2 bg-zinc-800 border border-zinc-700">
        {node.inputs.map((input, i) => (
          <div key={`input-${i}`} className="flex items-center my-1">
            <button
              className="w-3 h-3 rounded-full bg-white/80 hover:bg-white"
              onMouseDown={(e) => handlePortMouseDown(e, node, input, false)}
              onMouseUp={(e) => handlePortMouseUp(e, node, input, false)}
            />
            <span className="ml-2 text-white text-sm">{input}</span>
          </div>
        ))}
        {node.outputs.map((output, i) => (
          <div key={`output-${i}`} className="flex items-center justify-end my-1">
            <span className="mr-2 text-white text-sm">{output}</span>
            <button
              className="w-3 h-3 rounded-full bg-white/80 hover:bg-white"
              onMouseDown={(e) => handlePortMouseDown(e, node, output, true)}
              onMouseUp={(e) => handlePortMouseUp(e, node, output, true)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <div className="absolute top-4 left-4 text-white text-lg font-semibold">
        Blueprint Editor
      </div>
      
      <svg
        ref={canvasRef}
        className="w-full h-full"
        onContextMenu={handleContextMenu}
        onMouseMove={(e) => {
          if (connecting) {
            const rect = canvasRef.current.getBoundingClientRect();
            setConnecting({
              ...connecting,
              mouseX: e.clientX - rect.left,
              mouseY: e.clientY - rect.top
            });
          }
        }}
      >
        <g>
          {connections.map((conn) => (
            <ConnectionLine
              key={conn.id}
              source={{ id: conn.sourceId, port: conn.sourcePort }}
              target={{ id: conn.targetId, port: conn.targetPort }}
            />
          ))}
          {connecting && (
            <path
              d={`M ${connecting.startX} ${connecting.startY} C ${connecting.startX + 50} ${connecting.startY}, ${connecting.mouseX - 50} ${connecting.mouseY}, ${connecting.mouseX} ${connecting.mouseY}`}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              className="pointer-events-none"
            />
          )}
        </g>
      </svg>

      {nodes.map((node) => (
        <Node key={node.id} node={node} />
      ))}

      {contextMenu.visible && (
        <div
          className="absolute bg-zinc-900 rounded-lg shadow-xl z-50 border border-zinc-800 w-64"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="p-2 border-b border-zinc-800">
            <div className="relative">
              <input
                type="text"
                placeholder="Search nodes..."
                className="w-full bg-zinc-800 rounded px-8 py-1 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <Search className="absolute left-2 top-1.5 w-4 h-4 text-zinc-400" />
              {searchTerm && (
                <button
                  className="absolute right-2 top-1.5 text-zinc-400 hover:text-white"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredNodeTypes.map(([type, node]) => (
              <button
                key={type}
                className="block w-full px-4 py-2 text-left text-white hover:bg-zinc-800 transition-colors flex items-center space-x-2"
                onClick={() => addNode(type)}
              >
                <div className={`w-3 h-3 rounded ${node.color}`} />
                <span>{node.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlueprintEditor;