import React from 'react';

const PropertiesPanel = ({ selectedObject, onPropertyChange }) => (
  <div className="w-72 border-l border-blue-900/20 flex flex-col">
    <div className="p-2 border-b border-blue-900/20 text-blue-500">
      ⚙ Properties
    </div>
    <div className="flex-1 overflow-y-auto p-3">
      {selectedObject ? (
        <div className="border border-blue-900/20 rounded">
          <div className="p-2 bg-blue-900/5 border-b border-blue-900/20 text-blue-500">
            Transform
          </div>
          <div className="p-2 space-y-2">
            {['position', 'rotation', 'scale'].map(prop => (
              ['x', 'y', 'z'].map(axis => (
                <div key={`${prop}-${axis}`} className="flex items-center">
                  <span className="flex-1 text-gray-400">{`${prop} ${axis.toUpperCase()}`}</span>
                  <input
                    type="number"
                    value={selectedObject[prop][axis]}
                    onChange={(e) => onPropertyChange(selectedObject, prop, axis, e.target.value)}
                    className="w-20 bg-black border border-blue-900/20 rounded px-2 py-1 text-white"
                    step={prop === 'scale' ? 0.1 : 1}
                  />
                </div>
              ))
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No object selected</div>
      )}
    </div>
  </div>
);

export default PropertiesPanel;