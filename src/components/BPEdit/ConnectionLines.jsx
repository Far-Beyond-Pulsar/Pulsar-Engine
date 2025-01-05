import React from 'react';

const ConnectionLines = ({ 
  connections, 
  tempLine, 
  zoom 
}) => {
  const generatePath = (start, end) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const controlPointOffset = Math.min(Math.abs(deltaX) * 0.5, 100);
    
    return `M ${start.x} ${start.y} 
            C ${start.x + controlPointOffset} ${start.y},
              ${end.x - controlPointOffset} ${end.y},
              ${end.x} ${end.y}`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="currentColor"
          />
        </marker>
      </defs>
      
      {connections.map(conn => (
        <path
          key={conn.id}
          d={generatePath(conn.fromPoint, conn.toPoint)}
          stroke={conn.color || '#525252'}
          strokeWidth={2 / zoom}
          fill="none"
          markerEnd={conn.type === 'execution' ? 'url(#arrowhead)' : undefined}
          style={{
            color: conn.color || '#525252'
          }}
        />
      ))}
      
      {tempLine && (
        <path
          d={generatePath(tempLine.fromPoint, tempLine.toPoint)}
          stroke={tempLine.color}
          strokeWidth={2 / zoom}
          fill="none"
          strokeDasharray="4"
          markerEnd="url(#arrowhead)"
          style={{
            color: tempLine.color
          }}
        />
      )}
    </svg>
  );
};

export default ConnectionLines;