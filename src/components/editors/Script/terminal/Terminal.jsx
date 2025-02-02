import React from 'react';
import { X, AlertCircle, Check, Terminal as TerminalIcon } from 'lucide-react';

const Terminal = ({ isVisible, onClose, output }) => {
  if (!isVisible) return null;

  return (
    <div className="h-48 border-t border-gray-800 bg-black">
      <div className="flex items-center justify-between p-2 text-sm font-medium border-b border-gray-800">
        <span>TERMINAL</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-900 rounded"
        >
          <X size={14} />
        </button>
      </div>
      <div className="h-[calc(100%-2.5rem)] overflow-auto p-2 font-mono">
        {output.map((output, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 mb-1 text-sm ${
              output.type === 'error' ? 'text-red-400' :
              output.type === 'success' ? 'text-green-400' :
              'text-blue-400'
            }`}
          >
            <span className="text-gray-500 text-xs">
              {new Date(output.timestamp).toLocaleTimeString()}
            </span>
            {output.type === 'error' ? <AlertCircle size={14} /> :
              output.type === 'success' ? <Check size={14} /> :
              <TerminalIcon size={14} />}
            <span className="flex-1 break-all">{output.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
