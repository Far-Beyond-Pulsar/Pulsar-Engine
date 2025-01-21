import React, { useState, useRef, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Search, X, Play, Pause, Save, Plus, Settings } from 'lucide-react';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/tooltip';

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
  // State management
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  
  const canvasRef = useRef(null);

  // Initialize blueprint in Rust backend
  useEffect(() => {
    const initBlueprint = async () => {
      try {
        await invoke('create_blueprint', { outputPath: 'src/generated/blueprint.rs' });
      } catch (err) {
        setError(`Failed to initialize blueprint: ${err}`);
      }
    };
    initBlueprint();
  }, []);

  // Track mouse position for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingNode) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - draggingNode.offsetX;
        const y = e.clientY - rect.top - draggingNode.offsetY;
        setDragPos({ x, y });
        
        setNodes(nodes.map(node =>
          node.id === draggingNode.id ? { ...node, x, y } : node
        ));
      }
    };

    const handleMouseUp = () => {
      if (draggingNode) {
        // Sync node position with backend
        const node = nodes.find(n => n.id === draggingNode.id);
        invoke('add_blueprint_node', {
          node: {
            id: node.id,
            node_type: node.node_type,
            x: node.x,
            y: node.y,
          }
        }).catch(err => setError(`Failed to update node: ${err}`));
      }
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

  // Handle node interactions
  const handleNodeMouseDown = useCallback((e, nodeId) => {
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
  }, [nodes]);

  // Handle port interactions
  const handlePortMouseDown = useCallback((e, node, port, isOutput) => {
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
  }, []);

  const handlePortMouseUp = useCallback(async (e, node, port, isOutput) => {
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
        const newConnection = {
          id: `${source.id}-${source.port}-${target.id}-${target.port}`,
          source_id: source.id,         // Changed from sourceId
          source_port: source.port,     // Changed from sourcePort
          target_id: target.id,         // Changed from targetId
          target_port: target.port      // Changed from targetPort
        };

        try {
          await invoke('add_blueprint_connection', { connection: newConnection });
          setConnections([...connections, {
            id: newConnection.id,
            sourceId: source.id,        // Keep camelCase for React state
            sourcePort: source.port,
            targetId: target.id,
            targetPort: target.port
          }]);
        } catch (err) {
          setError(`Failed to create connection: ${err}`);
        }
      }
    }
    setConnecting(null);
  }, [connecting, connections]);

  // Context menu handling
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setSearchTerm('');
  }, []);

  // Add new node
  const addNode = useCallback(async (type) => {
    const nodeType = NODE_TYPES[type];
    const newNode = {
      id: `node-${nodes.length + 1}`,
      node_type: type, // Changed from type to node_type to match Rust struct
      x: contextMenu.x,
      y: contextMenu.y,
      title: nodeType.title,
      color: nodeType.color,
      inputs: nodeType.inputs,
      outputs: nodeType.outputs,
    };

    try {
      await invoke('add_blueprint_node', { node: newNode });
      setNodes([...nodes, newNode]);
    } catch (err) {
      setError(`Failed to add node: ${err}`);
    }
    
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, [nodes, contextMenu]);

  // Blueprint execution controls
  const handleExecute = useCallback(async () => {
    try {
      if (isRunning) {
        await invoke('stop_execution');
        setIsRunning(false);
      } else {
        await invoke('start_execution');
        setIsRunning(true);
      }
    } catch (err) {
      setError(`Execution error: ${err}`);
    }
  }, [isRunning]);

  const handleSave = useCallback(async () => {
    try {
      await invoke('save_blueprint');
    } catch (err) {
      setError(`Failed to save blueprint: ${err}`);
    }
  }, []);

  // Filter nodes based on search
  const filteredNodeTypes = Object.entries(NODE_TYPES).filter(([key, node]) =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Connection line component
  const ConnectionLine = useCallback(({ source, target, dashed }) => {
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
  }, [nodes]);

  // Node component
  const Node = useCallback(({ node }) => (
    <div
      className={`absolute w-48 rounded-lg shadow-lg overflow-hidden ${
        selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{ 
        left: node.x,
        top: node.y,
        transform: `translate(0, 0)`,
        transition: draggingNode?.id === node.id ? 'none' : 'all 0.1s ease-out'
      }}
      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
      onClick={() => setSelectedNode(node)}
    >
      <div className={`px-4 py-2 text-white font-semibold ${node.color} cursor-move node-header`}>
        {node.title}
      </div>
      <div className="p-2 bg-zinc-800 border border-zinc-700">
        {node.inputs.map((input, i) => (
          <div key={`input-${i}`} className="flex items-center my-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-3 h-3 rounded-full bg-white/80 hover:bg-white"
                    onMouseDown={(e) => handlePortMouseDown(e, node, input, false)}
                    onMouseUp={(e) => handlePortMouseUp(e, node, input, false)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{input}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="ml-2 text-white text-sm">{input}</span>
          </div>
        ))}
        {node.outputs.map((output, i) => (
          <div key={`output-${i}`} className="flex items-center justify-end my-1">
            <span className="mr-2 text-white text-sm">{output}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-3 h-3 rounded-full bg-white/80 hover:bg-white"
                    onMouseDown={(e) => handlePortMouseDown(e, node, output, true)}
                    onMouseUp={(e) => handlePortMouseUp(e, node, output, true)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{output}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
    </div>
  ), [draggingNode, selectedNode, handleNodeMouseDown, handlePortMouseDown, handlePortMouseUp]);

  return (
    <div className="w-full h-screen bg-zinc-950 relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-black border-b border-zinc-800 px-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <button
            className={`p-2 rounded hover:bg-zinc-800 ${isRunning ? 'text-red-500' : 'text-green-500'}`}
            onClick={handleExecute}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            className="p-2 rounded hover:bg-zinc-800 text-blue-500"
            onClick={handleSave}
          >
            <Save className="w-5 h-5" />
          </button>
        </div>
        <div className="text-white text-lg font-semibold">Blueprint Editor</div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded hover:bg-zinc-800 text-zinc-400">
                <Settings className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Import Blueprint</DropdownMenuItem>
              <DropdownMenuItem>Export Blueprint</DropdownMenuItem>
              <DropdownMenuItem>Clear All</DropdownMenuItem>
              <DropdownMenuItem>Show Grid</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <a href="https://docs.example.com/blueprint" target="_blank" rel="noopener noreferrer">
                  Documentation
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="absolute top-14 right-4 z-50 w-96">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button
            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-300"
            onClick={() => setError(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Canvas */}
      <div className="absolute inset-0 mt-12">
        <svg
          ref={canvasRef}
          className="w-full h-full"
          onContextMenu={handleContextMenu}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedNode(null);
            }
          }}
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
          {/* Grid Pattern */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connections */}
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

        {/* Nodes */}
        {nodes.map((node) => (
          <Node key={node.id} node={node} />
        ))}

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="absolute bg-black rounded-lg shadow-xl z-50 border border-zinc-800 w-64"
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
                  autoFocus
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

      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="absolute right-0 top-12 bottom-0 w-64 bg-black border-l border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Properties</h3>
            <button
              className="text-zinc-400 hover:text-white"
              onClick={() => setSelectedNode(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-zinc-400 text-sm">ID</label>
              <input
                type="text"
                value={selectedNode.id}
                readOnly
                className="w-full bg-zinc-900 rounded px-2 py-1 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm">Type</label>
              <input
                type="text"
                value={selectedNode.title}
                readOnly
                className="w-full bg-zinc-900 rounded px-2 py-1 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm">Position</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="number"
                  value={Math.round(selectedNode.x)}
                  onChange={(e) => {
                    const x = parseInt(e.target.value);
                    setNodes(nodes.map(node =>
                      node.id === selectedNode.id ? { ...node, x } : node
                    ));
                  }}
                  className="bg-zinc-900 rounded px-2 py-1 text-white"
                />
                <input
                  type="number"
                  value={Math.round(selectedNode.y)}
                  onChange={(e) => {
                    const y = parseInt(e.target.value);
                    setNodes(nodes.map(node =>
                      node.id === selectedNode.id ? { ...node, y } : node
                    ));
                  }}
                  className="bg-zinc-900 rounded px-2 py-1 text-white"
                />
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <button
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded py-2"
              onClick={() => {
                setNodes(nodes.filter(n => n.id !== selectedNode.id));
                setConnections(connections.filter(c =>
                  c.sourceId !== selectedNode.id && c.targetId !== selectedNode.id
                ));
                setSelectedNode(null);
              }}
            >
              Delete Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlueprintEditor;