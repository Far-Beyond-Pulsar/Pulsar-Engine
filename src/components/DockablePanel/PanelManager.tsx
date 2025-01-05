import React, { ReactNode } from 'react';

interface PanelManagerProps {
  children: ReactNode;
  className?: string;
}

export const PanelManager: React.FC<PanelManagerProps> = ({ 
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