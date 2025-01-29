import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "../ScrollArea";
import { X, Save, Plus, Link } from 'lucide-react';

type NodeType = 'sequence' | 'selector' | 'condition' | 'action';

interface Node {
  id: string;
  type: NodeType;
  name: string;
  position: { x: number; y: number };
  children: string[];
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const AIFlowEditor = () => {
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Track mouse position for the temporary connection line
  const handleMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Node creation
  const addNode = (type: NodeType) => {
    const id = `node-${Date.now()}`;
    const rect = canvasRef.current?.getBoundingClientRect();
    const defaultX = rect ? (rect.width / 2) - 70 : 100;
    const defaultY = rect ? (rect.height / 2) - 20 : 100;
    
    const newNode: Node = {
      id,
      type,
      name: `${type} ${Object.keys(nodes).length + 1}`,
      position: { x: defaultX, y: defaultY },
      children: []
    };

    setNodes(prev => ({ ...prev, [id]: newNode }));
    return id;
  };

  // Node dragging
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeStartPos, setNodeStartPos] = useState({ x: 0, y: 0 });

  const startDragging = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes[nodeId];
    setDraggedNode(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setNodeStartPos({ ...node.position });
  };

  useEffect(() => {
    const handleDrag = (e: MouseEvent) => {
      if (draggedNode && canvasRef.current) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        const newX = nodeStartPos.x + dx;
        const newY = nodeStartPos.y + dy;
        
        setNodes(prev => ({
          ...prev,
          [draggedNode]: {
            ...prev[draggedNode],
            position: { x: newX, y: newY }
          }
        }));
      }
    };

    const stopDragging = () => {
      setDraggedNode(null);
    };

    if (draggedNode) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', stopDragging);
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', stopDragging);
    };
  }, [draggedNode, dragStart, nodeStartPos]);

  // Handle node connection
  const handleNodeClick = (nodeId: string) => {
    if (connectingFrom) {
      // If we're already connecting and clicked a different node, create the connection
      if (connectingFrom !== nodeId) {
        const newConnection = {
          id: `conn-${Date.now()}`,
          from: connectingFrom,
          to: nodeId
        };
        
        // Only add if connection doesn't already exist
        if (!connections.some(c => c.from === connectingFrom && c.to === nodeId)) {
          setConnections(prev => [...prev, newConnection]);
          setNodes(prev => ({
            ...prev,
            [connectingFrom]: {
              ...prev[connectingFrom],
              children: [...prev[connectingFrom].children, nodeId]
            }
          }));
        }
      }
      setConnectingFrom(null);
    } else {
      setSelectedNode(nodeId);
    }
  };

  return (
    <div className="flex h-full bg-black text-gray-300">
      {/* Node Types Panel */}
      <div className="w-48 bg-black border-r border-zinc-950">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            <div className="text-sm font-semibold px-2">Add Node</div>
            {(['sequence', 'selector', 'condition', 'action'] as NodeType[]).map(type => (
              <button
                key={type}
                className="w-full p-2 bg-zinc-950 rounded flex items-center gap-2 hover:bg-zinc-900 capitalize"
                onClick={() => addNode(type)}
              >
                <Plus className="w-4 h-4" />
                {type}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 bg-black relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Background Grid */}
        <div className="absolute inset-0" style={{
          backgroundSize: '20px 20px',
          backgroundImage: 'radial-gradient(circle, #27272a 1px, transparent 1px)',
          opacity: 0.2
        }} />

        {/* Connection Lines */}
        <svg className="absolute inset-0 pointer-events-none">
          {connections.map(conn => {
            const fromNode = nodes[conn.from];
            const toNode = nodes[conn.to];
            if (!fromNode || !toNode) return null;

            const fromX = fromNode.position.x + 160;
            const fromY = fromNode.position.y + 25;
            const toX = toNode.position.x;
            const toY = toNode.position.y + 25;

            return (
              <g key={conn.id}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#27272a"
                  strokeWidth="2"
                />
                <polygon
                  points={`${toX},${toY} ${toX-8},${toY-4} ${toX-8},${toY+4}`}
                  fill="#27272a"
                />
              </g>
            );
          })}
          
          {/* Temporary connection line */}
          {connectingFrom && nodes[connectingFrom] && (
            <line
              x1={nodes[connectingFrom].position.x + 160}
              y1={nodes[connectingFrom].position.y + 25}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#27272a"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {/* Nodes */}
        {Object.values(nodes).map(node => (
          <div
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            className={`absolute p-2 rounded-lg w-40 ${
              selectedNode === node.id ? 'ring-1 ring-zinc-700' : ''
            } ${connectingFrom === node.id ? 'ring-1 ring-blue-500' : ''}
              ${connectingFrom && connectingFrom !== node.id ? 'ring-1 ring-green-500 cursor-pointer' : ''}
            `}
            style={{
              left: node.position.x,
              top: node.position.y,
              backgroundColor: '#18181b'
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium capitalize">{node.name}</span>
              <div className="flex gap-1">
                <button 
                  className={`p-1 rounded ${
                    connectingFrom === node.id 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'hover:bg-zinc-800 text-blue-400'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (connectingFrom === node.id) {
                      setConnectingFrom(null);
                    } else {
                      setConnectingFrom(node.id);
                    }
                  }}
                >
                  <Link className="w-4 h-4" />
                </button>
                <button 
                  className="p-1 hover:bg-zinc-800 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Remove all connections involving this node
                    setConnections(prev => prev.filter(conn => 
                      conn.from !== node.id && conn.to !== node.id
                    ));
                    // Remove the node
                    const newNodes = { ...nodes };
                    delete newNodes[node.id];
                    setNodes(newNodes);
                    if (selectedNode === node.id) setSelectedNode(null);
                    if (connectingFrom === node.id) setConnectingFrom(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">{node.type}</div>
            {/* Draggable handle */}
            <div 
              className="absolute inset-0 cursor-move"
              onMouseDown={(e) => startDragging(e, node.id)}
            />
          </div>
        ))}

        {/* Connection Mode Indicator */}
        {connectingFrom && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full">
            Click another node to connect
          </div>
        )}
      </div>

      {/* Properties Panel */}
      <div className="w-64 border-l border-zinc-950 bg-black">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {selectedNode && nodes[selectedNode] ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Node Name</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-900 rounded p-1 text-sm"
                    value={nodes[selectedNode].name}
                    onChange={(e) => {
                      setNodes(prev => ({
                        ...prev,
                        [selectedNode]: {
                          ...prev[selectedNode],
                          name: e.target.value
                        }
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Node Type</label>
                  <div className="text-sm bg-zinc-950 border border-zinc-900 rounded p-1 capitalize">
                    {nodes[selectedNode].type}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Connections</label>
                  <div className="text-sm">
                    Children: {nodes[selectedNode].children.length}
                    <button 
                      className="ml-2 px-2 py-1 bg-zinc-900 rounded text-xs hover:bg-zinc-800"
                      onClick={() => setConnectingFrom(selectedNode)}
                    >
                      Add Connection
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                Select a node to edit its properties
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AIFlowEditor;