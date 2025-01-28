import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search, X, Play, Pause, Save, Copy, 
  Trash2, Settings, ClipboardCopy, Redo, Undo 
} from 'lucide-react';
import { 
  Alert, AlertDescription, AlertTitle 
} from '../alert';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';

const PIN_TYPES = {
  EXEC: {
    name: 'Exec',
    color: 'bg-white',
    isExec: true
  },
  BOOLEAN: {
    name: 'Boolean',
    color: 'bg-red-500',
    isData: true
  },
  NUMBER: {
    name: 'Number',
    color: 'bg-blue-500',
    isData: true
  },
  STRING: {
    name: 'String',
    color: 'bg-green-500',
    isData: true
  },
  STRUCT: {
    name: 'Struct',
    color: 'bg-purple-500',
    isData: true
  }
};

const NODE_TYPES = {
  EVENT: {
    type: 'event',
    title: 'On Begin Play',
    color: 'bg-red-900',
    inputs: [],
    outputs: [{ name: 'Exec', type: 'EXEC' }],
    category: 'Events'
  },
  BRANCH: {
    type: 'branch',
    title: 'Branch',
    color: 'bg-purple-900',
    inputs: [
      { name: 'Exec', type: 'EXEC' },
      { name: 'Condition', type: 'BOOLEAN' }
    ],
    outputs: [
      { name: 'True', type: 'EXEC' },
      { name: 'False', type: 'EXEC' }
    ],
    category: 'Flow Control'
  },
  PRINT: {
    type: 'print',
    title: 'Print String',
    color: 'bg-blue-900',
    inputs: [
      { name: 'Exec', type: 'EXEC' },
      { name: 'Message', type: 'STRING' }
    ],
    outputs: [
      { name: 'Exec', type: 'EXEC' }
    ],
    category: 'Utilities'
  },
  MATH: {
    type: 'math',
    title: 'Add Numbers',
    color: 'bg-green-900',
    inputs: [
      { name: 'A', type: 'NUMBER' },
      { name: 'B', type: 'NUMBER' }
    ],
    outputs: [
      { name: 'Result', type: 'NUMBER' }
    ],
    category: 'Math'
  }
};

const createHistoryManager = () => {
  const history = [];
  let currentIndex = -1;

  const push = (state) => {
    currentIndex++;
    history.splice(currentIndex);
    history.push(JSON.stringify(state));
  };

  const canUndo = () => currentIndex > 0;
  const canRedo = () => currentIndex < history.length - 1;

  const undo = () => {
    if (canUndo()) {
      currentIndex--;
      return JSON.parse(history[currentIndex]);
    }
    return null;
  };

  const redo = () => {
    if (canRedo()) {
      currentIndex++;
      return JSON.parse(history[currentIndex]);
    }
    return null;
  };

  return { push, undo, redo, canUndo, canRedo };
};

const BlueprintEditor = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggingNode, setDraggingNode] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [canvasContextMenu, setCanvasContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const historyManager = useRef(createHistoryManager());

  useEffect(() => {
    // Load saved state from localStorage on mount
    const savedState = localStorage.getItem('blueprintState');
    if (savedState) {
      try {
        const { nodes: savedNodes, connections: savedConnections } = JSON.parse(savedState);
        setNodes(savedNodes);
        setConnections(savedConnections);
        historyManager.current.push({ nodes: savedNodes, connections: savedConnections });
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Auto-save state to localStorage
  useEffect(() => {
    if (nodes.length > 0 || connections.length > 0) {
      localStorage.setItem('blueprintState', JSON.stringify({ nodes, connections }));
    }
  }, [nodes, connections]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - pan.x;
    const y = (e.clientY - rect.top) / scale - pan.y;

    setCanvasContextMenu({
      visible: true,
      x,
      y
    });
    setSearchTerm('');
  }, [scale, pan]);

  const handleNodeDrag = useCallback((e) => {
    if (!draggingNode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - draggingNode.offsetX;
    const y = (e.clientY - rect.top) / scale - draggingNode.offsetY;

    setNodes(prev => prev.map(node => 
      node.id === draggingNode.id ? { ...node, x, y } : node
    ));
  }, [draggingNode, scale]);

  const handleNodeMouseDown = useCallback((e, nodeId) => {
    if (e.button === 0 && e.target.closest('.node-header')) {
      e.stopPropagation();
      const node = nodes.find(n => n.id === nodeId);
      const rect = canvasRef.current.getBoundingClientRect();
      setDraggingNode({
        id: nodeId,
        offsetX: (e.clientX - rect.left) / scale - node.x,
        offsetY: (e.clientY - rect.top) / scale - node.y
      });
    }
  }, [nodes, scale]);

  const handlePortMouseDown = useCallback((e, nodeId, portName, isOutput) => {
    e.stopPropagation();
    setConnecting({
      sourceId: nodeId,
      sourcePort: portName,
      isOutput
    });
  }, []);

  const handlePortMouseUp = useCallback((e, nodeId, portName, isOutput) => {
    e.stopPropagation();
    if (!connecting) return;

    // Don't connect to self
    if (connecting.sourceId === nodeId) {
      setConnecting(null);
      return;
    }

    // Only connect output to input
    if (connecting.isOutput === isOutput) {
      setConnecting(null);
      return;
    }

    const sourceId = connecting.isOutput ? connecting.sourceId : nodeId;
    const sourcePort = connecting.isOutput ? connecting.sourcePort : portName;
    const targetId = connecting.isOutput ? nodeId : connecting.sourceId;
    const targetPort = connecting.isOutput ? portName : connecting.sourcePort;

    // Check if connection already exists
    const connectionExists = connections.some(conn =>
      conn.sourceId === sourceId &&
      conn.sourcePort === sourcePort &&
      conn.targetId === targetId &&
      conn.targetPort === targetPort
    );

    if (!connectionExists) {
      const newConnection = {
        id: `conn-${Date.now()}`,
        sourceId,
        sourcePort,
        targetId,
        targetPort
      };
      setConnections(prev => [...prev, newConnection]);
      historyManager.current.push({ nodes, connections: [...connections, newConnection] });
    }

    setConnecting(null);
  }, [connecting, connections, nodes]);

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem('blueprintState', JSON.stringify({ nodes, connections }));
      setError({ type: 'success', message: 'Blueprint saved successfully' });
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      setError({ type: 'error', message: `Failed to save blueprint: ${err.message}` });
    }
  }, [nodes, connections]);

  const handleDelete = useCallback((nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => 
      c.sourceId !== nodeId && c.targetId !== nodeId
    ));
    setSelectedNode(null);
    historyManager.current.push({
      nodes: nodes.filter(n => n.id !== nodeId),
      connections: connections.filter(c => 
        c.sourceId !== nodeId && c.targetId !== nodeId
      )
    });
  }, [nodes, connections]);

  const handleUndo = useCallback(() => {
    const previousState = historyManager.current.undo();
    if (previousState) {
      setNodes(previousState.nodes);
      setConnections(previousState.connections);
    }
  }, []);

  const handleRedo = useCallback(() => {
    const nextState = historyManager.current.redo();
    if (nextState) {
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
    }
  }, []);

  const ConnectionLine = useCallback(({ source, target, dashed = false }) => {
    const sourceNode = nodes.find(n => n.id === source.id);
    const targetNode = nodes.find(n => n.id === target.id);
    
    if (!sourceNode || !targetNode) return null;

    const sourcePort = sourceNode.outputs?.find(p => p.name === source.port);
    const targetPort = targetNode.inputs?.find(p => p.name === target.port);
    
    if (!sourcePort || !targetPort) return null;

    const sourceIndex = sourceNode.outputs.indexOf(sourcePort);
    const targetIndex = targetNode.inputs.indexOf(targetPort);
    
    const sourceX = sourceNode.x + 200; // Node width
    const sourceY = sourceNode.y + 40 + (sourceIndex * 20);
    const targetX = targetNode.x;
    const targetY = targetNode.y + 40 + (targetIndex * 20);

    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const curvature = Math.min(Math.abs(dx) * 0.5, 100);
    
    const path = `M ${sourceX} ${sourceY} C ${sourceX + curvature} ${sourceY}, ${targetX - curvature} ${targetY}, ${targetX} ${targetY}`;
    
    return (
      <path
        d={path}
        stroke={PIN_TYPES[sourcePort.type].color.replace('bg-', 'text-')}
        strokeWidth="2"
        fill="none"
        strokeDasharray={dashed ? "5,5" : "none"}
        className="pointer-events-none"
      />
    );
  }, [nodes]);

  const Node = useCallback(({ node }) => (
    <div
      className={`absolute w-48 rounded-lg shadow-lg overflow-hidden ${
        selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
      } ${node.color}`}
      style={{ 
        left: node.x,
        top: node.y,
        transform: `translate(0, 0)`,
        transition: draggingNode?.id === node.id ? 'none' : 'all 0.1s ease-out'
      }}
      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
      onClick={() => setSelectedNode(node)}
    >
      <div className="node-header px-4 py-2 cursor-move bg-black bg-opacity-50">
        <div className="text-white font-medium">{node.title}</div>
      </div>
      <div className="p-2 bg-black bg-opacity-25">
        {/* Input Pins */}
        <div className="space-y-1">
          {node.inputs?.map((input, i) => (
            <div
              key={input.name}
              className="flex items-center space-x-2"
              onMouseUp={(e) => handlePortMouseUp(e, node.id, input.name, false)}
            >
              <div
                className={`w-3 h-3 rounded-full ${PIN_TYPES[input.type].color} cursor-pointer`}
                onMouseDown={(e) => handlePortMouseDown(e, node.id, input.name, false)}
              />
              <span className="text-sm text-white">{input.name}</span>
            </div>
          ))}
        </div>
        {/* Output Pins */}
        <div className="space-y-1 mt-2">
          {node.outputs?.map((output, i) => (
            <div
              key={output.name}
              className="flex items-center justify-end space-x-2"
              onMouseUp={(e) => handlePortMouseUp(e, node.id, output.name, true)}
            >
              <span className="text-sm text-white">{output.name}</span>
              <div
                className={`w-3 h-3 rounded-full ${PIN_TYPES[output.type].color} cursor-pointer`}
                onMouseDown={(e) => handlePortMouseDown(e, node.id, output.name, true)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  ), [selectedNode, draggingNode, handleNodeMouseDown, handlePortMouseDown, handlePortMouseUp]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingNode) {
        handleNodeDrag(e);
      }
    };
    
    const handleMouseUp = () => {
      if (draggingNode) {
        historyManager.current.push({ nodes, connections });
        setDraggingNode(null);
      }
      setConnecting(null);
    };

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
        }
      } else if (e.key === 'Delete' && selectedNode) {
        handleDelete(selectedNode.id);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [draggingNode, handleNodeDrag, nodes, connections, selectedNode, handleSave, handleUndo, handleRedo, handleDelete]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.context-menu')) {
        setCanvasContextMenu({ visible: false });
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-black border-b border-zinc-800 px-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <button
            className={`p-2 rounded hover:bg-zinc-800 ${
              historyManager.current.canUndo() ? 'text-white' : 'text-zinc-600'}`}
            onClick={handleUndo}
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded hover:bg-zinc-800 ${
              historyManager.current.canRedo() ? 'text-white' : 'text-zinc-600'}`}
            onClick={handleRedo}
          >
            <Redo className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-zinc-800 mx-2" />
          <button
            className={`p-2 rounded hover:bg-zinc-800 ${isRunning ? 'text-red-500' : 'text-green-500'}`}
            onClick={() => setIsRunning(!isRunning)}
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
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsGridVisible(!isGridVisible)}>
                {isGridVisible ? 'Hide Grid' : 'Show Grid'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setScale(1);
                setPan({ x: 0, y: 0 });
              }}>
                Reset View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert 
          variant={error.type === 'error' ? 'destructive' : 'default'} 
          className="absolute top-14 right-4 z-50 w-96"
        >
          <AlertTitle>{error.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <button
            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-300"
            onClick={() => setError(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Canvas */}
      <div className="absolute inset-0 mt-12 overflow-hidden">
        <svg
          ref={canvasRef}
          className="w-full h-full cursor-grab"
          style={{
            transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
          }}
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const delta = e.deltaY > 0 ? 0.9 : 1.1;
              setScale(s => Math.min(Math.max(0.1, s * delta), 2));
            }
          }}
          onMouseDown={(e) => {
            if (e.button === 1 || (e.button === 0 && e.target === e.currentTarget)) {
              e.preventDefault();
              const startX = e.clientX - pan.x;
              const startY = e.clientY - pan.y;
              
              const handlePanMove = (e) => {
                setPan({
                  x: e.clientX - startX,
                  y: e.clientY - startY
                });
              };
              
              const handlePanEnd = () => {
                window.removeEventListener('mousemove', handlePanMove);
                window.removeEventListener('mouseup', handlePanEnd);
              };
              
              window.addEventListener('mousemove', handlePanMove);
              window.addEventListener('mouseup', handlePanEnd);
            }
          }}
          onContextMenu={handleContextMenu}
        >
          {/* Grid */}
          {isGridVisible && (
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
          )}
          <rect width="100%" height="100%" fill={isGridVisible ? "url(#grid)" : "none"} />

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
              <ConnectionLine
                source={connecting.isOutput ? 
                  { id: connecting.sourceId, port: connecting.sourcePort } :
                  { id: 'temp', port: 'temp' }
                }
                target={connecting.isOutput ?
                  { id: 'temp', port: 'temp' } :
                  { id: connecting.sourceId, port: connecting.sourcePort }
                }
                dashed
              />
            )}
          </g>
        </svg>

        {/* Nodes Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="relative w-full h-full"
            style={{
              transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            {nodes.map((node) => (
              <div key={node.id} className="pointer-events-auto">
                <Node node={node} />
              </div>
            ))}
          </div>
        </div>

        {/* Context Menu */}
        {canvasContextMenu.visible && (
          <div
            className="absolute bg-black rounded-lg shadow-xl z-50 border border-zinc-800 w-64"
            style={{ 
              left: canvasContextMenu.x * scale + pan.x, 
              top: canvasContextMenu.y * scale + pan.y 
            }}
          >
            <div className="p-2">
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
              {Object.entries(NODE_TYPES)
                .filter(([key, node]) =>
                  node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  node.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .reduce((acc, [key, node]) => {
                  const category = acc.find(g => g.category === node.category);
                  if (category) {
                    category.nodes.push({ key, ...node });
                  } else {
                    acc.push({
                      category: node.category,
                      nodes: [{ key, ...node }]
                    });
                  }
                  return acc;
                }, [])
                .map(group => (
                  <div key={group.category}>
                    <div className="px-2 py-1 text-xs text-zinc-500 bg-black/50">
                      {group.category}
                    </div>
                    {group.nodes.map(node => (
                      <button
                        key={node.key}
                        className="block w-full px-4 py-2 text-left text-white hover:bg-zinc-800 transition-colors flex items-center space-x-2"
                        onClick={() => {
                          const newNode = {
                            id: `node-${Date.now()}`,
                            type: node.key,
                            x: canvasContextMenu.x,
                            y: canvasContextMenu.y,
                            title: node.title,
                            color: node.color,
                            inputs: node.inputs,
                            outputs: node.outputs
                          };
                          setNodes(prev => [...prev, newNode]);
                          setCanvasContextMenu({ visible: false });
                          historyManager.current.push({ 
                            nodes: [...nodes, newNode], 
                            connections 
                          });
                        }}
                      >
                        <div className={`w-3 h-3 rounded ${node.color}`} />
                        <span>{node.title}</span>
                      </button>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlueprintEditor;