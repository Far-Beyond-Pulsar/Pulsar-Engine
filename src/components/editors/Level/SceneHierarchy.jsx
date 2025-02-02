import React from 'react';

const SceneHierarchy = ({ sceneObjects, selectedObject, onSelectObject }) => (
  <div className="w-72 border-r border-blue-900/20 flex flex-col">
    <div className="p-2 border-b border-blue-900/20 text-blue-500">
      ⬦ Scene Hierarchy
    </div>
    <div className="flex-1 overflow-y-auto p-2">
      {sceneObjects.map(obj => (
        <div 
          key={obj.id}
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-900/10
            ${selectedObject?.id === obj.id ? 'bg-blue-900/10 text-blue-500' : 'text-gray-300'}`}
          onClick={() => onSelectObject(obj)}
        >
          <span className="opacity-60">👁</span>
          <span>{obj.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default SceneHierarchy;