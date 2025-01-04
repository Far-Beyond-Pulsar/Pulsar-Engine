import React, { useState } from 'react';
import Node from './Node';
import ConnectionLines from './ConnectionLines';
import NavigationControls from './NavigationControls';
import { 
  transformCoordinates, 
  inverseTransformCoordinates, 
  getConnectionPoint,
  wouldCreateCycle
} from './canvasUtils';
import type { Node as NodeType, Connection, Point } from './constants';

interface CanvasProps {
  nodes: NodeType[];
  connections: Connection[];
  selectedNode: NodeType | null;
  zoom: number;
  pan: Point;
  onNodeSelect: (node: NodeType) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<NodeType>) => void;
  onConnectionCreate: (fromNode: string, toNode: string) => void;
  onConnectionsUpdate: (connections: Connection[]) => void;
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: Point) => void;
}

const Canvas = React.forwardRef<HTMLDivElement, CanvasProps>(({
  nodes,
  connections,
  selectedNode,
  zoom,
  pan,
  onNodeSelect,
  onNodeDelete,
  onNodeUpdate,
  onConnectionCreate,
  onConnectionsUpdate,
  onZoomChange,
  onPanChange
}, forwardedRef) => {
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{
    nodeId: string;
    point: Point;
    type: 'parent' | 'child';
  } | null>(null);
  const [tempLine, setTempLine] = useState<{
    fromPoint: Point;
    toPoint: Point;
  } | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === forwardedRef.current) {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      onPanChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    if (isDrawing && tempLine && forwardedRef.current) {
      const rect = forwardedRef.current.getBoundingClientRect();
      const coords = inverseTransformCoordinates(
        e.clientX - rect.left,
        e.clientY - rect.top,
        { zoom, pan }
      );
      
      if (coords) {
        setTempLine(prev => ({
          ...prev,
          toPoint: coords
        }));
      }
    }

    // Handle node dragging
    if (draggedNode && forwardedRef.current) {
      const rect = forwardedRef.current.getBoundingClientRect();
      const coords = inverseTransformCoordinates(
        e.clientX - rect.left,
        e.clientY - rect.top,
        { zoom, pan }
      );

      if (coords) {
        const newPosition = {
          x: coords.x - dragOffset.x,
          y: coords.y - dragOffset.y
        };

        onNodeUpdate(draggedNode, { position: newPosition });

        // Update all connection positions
        const updatedConnections = connections.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.fromNode);
          const toNode = nodes.find(n => n.id === conn.toNode);

          if (!fromNode || !toNode) return conn;

          const newFromPos = fromNode.id === draggedNode ? newPosition : fromNode.position;
          const newToPos = toNode.id === draggedNode ? newPosition : toNode.position;

          return {
            ...conn,
            fromPoint: getConnectionPoint({ ...fromNode, position: newFromPos }, 'child'),
            toPoint: getConnectionPoint({ ...toNode, position: newToPos }, 'parent')
          };
        });

        onConnectionsUpdate(updatedConnections);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNode(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (!forwardedRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const coords = inverseTransformCoordinates(
      e.clientX - rect.left,
      e.clientY - rect.top,
      { zoom, pan }
    );

    if (coords) {
      setDraggedNode(nodeId);
      setDragOffset(coords);
    }
  };

  const startConnection = (nodeId: string, point: Point, type: 'parent' | 'child') => {
    setIsDrawing(true);
    setDrawingStart({
      nodeId,
      point,
      type
    });
    setTempLine({
      fromPoint: point,
      toPoint: point
    });
  };

  const endConnection = (nodeId: string, type: 'parent' | 'child') => {
    if (isDrawing && drawingStart && drawingStart.nodeId !== nodeId) {
      if (drawingStart.type === 'child' && type === 'parent') {
        if (!wouldCreateCycle(drawingStart.nodeId, nodeId, connections)) {
          onConnectionCreate(drawingStart.nodeId, nodeId);
        }
      }
    }
    setIsDrawing(false);
    setDrawingStart(null);
    setTempLine(null);
  };

  return (
    <div 
      ref={forwardedRef}
      className={`flex-1 relative overflow-hidden bg-neutral-900 ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    >
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        <ConnectionLines
          connections={connections}
          tempLine={tempLine}
          zoom={zoom}
        />

        {nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            isDrawing={isDrawing}
            onStartConnection={startConnection}
            onEndConnection={endConnection}
            onMouseDown={handleNodeMouseDown}
            onSelect={onNodeSelect}
            onDelete={onNodeDelete}
          />
        ))}
      </div>

      <NavigationControls 
        onZoomIn={() => onZoomChange(Math.min(2, zoom * 1.2))}
        onZoomOut={() => onZoomChange(Math.max(0.1, zoom * 0.8))}
        onResetZoom={() => onZoomChange(1)}
        onResetPan={() => onPanChange({ x: 0, y: 0 })}
        zoom={zoom}
      />
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;