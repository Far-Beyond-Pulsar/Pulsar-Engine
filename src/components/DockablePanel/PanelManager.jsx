import React, { ReactNode } from 'react';

export const PanelManager = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`relative flex flex-col ${className}`}>
      <div className="flex flex-1">
        {children}
      </div>
    </div>
  );
};