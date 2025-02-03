// page.tsx
import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { NodeEditorProvider } from './context/NodeEditorContext';
import BlueprintEditor from './components/BlueprintEditor';

const Page = () => {
  return (
    <ReactFlowProvider>
      <NodeEditorProvider>
        <BlueprintEditor />
      </NodeEditorProvider>
    </ReactFlowProvider>
  );
};

export default Page;