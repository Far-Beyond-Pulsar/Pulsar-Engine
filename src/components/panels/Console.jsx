import React from 'react';

const Console = ({ isVisible, messages, onClear, onHide }) => {
  if (!isVisible) return null;
  
  return (
    <div className="h-48 border-t border-blue-900/20 flex flex-col">
      <div className="p-2 border-b border-blue-900/20 flex items-center justify-between">
        <span className="text-blue-500">▤ Console</span>
        <div className="flex gap-2">
          <button 
            onClick={onClear}
            className="px-2 py-1 text-sm rounded hover:bg-blue-900/10 text-gray-400 hover:text-blue-500 transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={onHide}
            className="px-2 py-1 text-sm rounded hover:bg-blue-900/10 text-gray-400 hover:text-blue-500 transition-colors"
          >
            Hide
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-center gap-2 hover:bg-blue-900/5 p-1 rounded">
            <span className={`text-xs ${
              msg.type === 'info' ? 'text-blue-500' :
              msg.type === 'success' ? 'text-green-500' :
              msg.type === 'warning' ? 'text-yellow-500' :
              'text-red-500'
            }`}>●</span>
            <span className="text-gray-300">{msg.message}</span>
            <span className="text-gray-500 text-xs ml-auto">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Console;