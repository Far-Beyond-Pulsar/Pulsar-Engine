import React, { useState, ReactNode } from 'react';


export const PanelButton = ({ onClick, title, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className="p-1 rounded"
      title={title}
      style={{
        backgroundColor: isHovered ? '#333333' : 'transparent',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};