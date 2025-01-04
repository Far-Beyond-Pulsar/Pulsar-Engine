import type { Node, Connection, Point } from './constants';

export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 80;

export interface TransformState {
  zoom: number;
  pan: Point;
}

export const transformCoordinates = (x: number, y: number, transform: TransformState): Point | null => {
  if (!transform || typeof transform.zoom !== 'number' || !transform.pan) {
    return null;
  }
  return {
    x: (x * transform.zoom) + transform.pan.x,
    y: (y * transform.zoom) + transform.pan.y
  };
};

export const inverseTransformCoordinates = (x: number, y: number, transform: TransformState): Point | null => {
  if (!transform || typeof transform.zoom !== 'number' || !transform.pan) {
    return null;
  }
  return {
    x: (x - transform.pan.x) / transform.zoom,
    y: (y - transform.pan.y) / transform.zoom
  };
};

export const getConnectionPoint = (node: Node, type: string): Point => {
  if (!node || !node.position) {
    console.warn('Invalid node or position in getConnectionPoint');
    return { x: 0, y: 0 };
  }

  if (node.inputs?.includes(type)) {
    return {
      x: node.position.x,
      y: node.position.y + NODE_HEIGHT/2
    };
  } else if (node.outputs?.includes(type)) {
    return {
      x: node.position.x + NODE_WIDTH,
      y: node.position.y + NODE_HEIGHT/2
    };
  }
  
  // Default to center point for unknown port types
  return {
    x: node.position.x + NODE_WIDTH/2,
    y: node.position.y + (type === 'parent' ? 0 : NODE_HEIGHT)
  };
};

export const wouldCreateCycle = (
  fromId: string, 
  toId: string, 
  connections: Connection[], 
  visited = new Set<string>()
): boolean => {
  if (fromId === toId) return true;
  if (visited.has(fromId)) return false;
  
  visited.add(fromId);
  const childConnections = connections.filter(conn => conn.toNode === fromId);
  
  return childConnections.some(conn => 
    wouldCreateCycle(conn.fromNode, toId, connections, new Set(visited))
  );
};

export default getConnectionPoint;