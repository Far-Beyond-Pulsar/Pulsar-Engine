"use client"

import React, { useState, useRef, useCallback } from 'react';
import TitleBar from './TitleBar';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import { generateRustCode } from './codeGenUtils';
import { getConnectionPoint } from './canvasUtils';
import { createPinsForNode } from './pinUtilities';
import { RUST_TYPES } from './constants';

const RustCodeDesigner = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);

  const handleAddNode = (typeKey, typeInfo) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const center = {
      x: (rect.width / 2 - pan.x) / zoom,
      y: (rect.height / 2 - pan.y) / zoom
    };
  
    // Create pins for the node
    const pins = createPinsForNode(typeKey, typeInfo.category);
  
    const newNode = {
      id: `node-${Date.now()}`,
      type: typeKey,
      name: `${typeInfo.name}-${nodes.length + 1}`,
      position: center,
      config: {
        type: typeKey,
        category: typeInfo.category,
        properties: {}
      },
      pins: pins // Add the pins here
    };
  
    setNodes(prev => [...prev, newNode]);
  };

  const handleUpdateNode = (nodeId, updates) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const handleCreateConnection = (fromNodeId, toNodeId, outputType, inputType) => {
    const fromNode = nodes.find(n => n.id === fromNodeId);
    const toNode = nodes.find(n => n.id === toNodeId);
    
    if (!fromNode || !toNode) return;

    const connectionType = outputType === 'execution' || inputType === 'execution' 
      ? 'execution' 
      : 'data';

    const newConnection = {
      id: `conn-${Date.now()}`,
      fromNode: fromNodeId,
      toNode: toNodeId,
      fromPoint: getConnectionPoint(fromNode, outputType),
      toPoint: getConnectionPoint(toNode, inputType),
      type: connectionType,
      dataType: connectionType === 'data' ? outputType : undefined
    };

    setConnections(prev => [...prev, newConnection]);
  };

  const handleConnectionsUpdate = (newConnections) => {
    setConnections(newConnections);
  };

  const handleDeleteNode = (nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.fromNode !== nodeId && conn.toNode !== nodeId
    ));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleExport = () => {
    const rustCode = generateRustCode(nodes, connections);
    const blob = new Blob([rustCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_code.rs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-neutral-900 text-neutral-100 select-none">
      <TitleBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddNode={handleAddNode}
        onExport={handleExport}
        types={RUST_TYPES}
      />

      <div className="flex-1 flex">
        <Canvas
          ref={canvasRef}
          nodes={nodes}
          connections={connections}
          selectedNode={selectedNode}
          zoom={zoom}
          pan={pan}
          onNodeSelect={setSelectedNode}
          onNodeDelete={handleDeleteNode}
          onNodeUpdate={handleUpdateNode}
          onConnectionCreate={handleCreateConnection}
          onConnectionsUpdate={handleConnectionsUpdate}
          onZoomChange={setZoom}
          onPanChange={setPan}
        />

        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          types={RUST_TYPES}
        />
      </div>
    </div>
  );
};

export default RustCodeDesigner;
