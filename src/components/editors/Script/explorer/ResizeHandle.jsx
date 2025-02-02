import React from 'react';

const ResizeHandle = ({ onMouseDown }) => (
  <div
    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50"
    onMouseDown={onMouseDown}
  />
);

export default ResizeHandle;
