import React, { useRef, useState } from 'react';
import { DrawIoEmbed, DrawIoEmbedRef } from 'react-drawio';

const AmoledDrawioEditor = () => {
  const drawioRef = useRef(null);
  const [lastSavedXml, setLastSavedXml] = useState('');

  // Handle manual save functionality
  const handleSave = (data) => {
    // Store the XML data
    setLastSavedXml(data.xml);
    
    // Create a blob and trigger download
    const blob = new Blob([data.xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.drawio';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const config = {};

  const urlParameters = {
    dark: 1,
    ui: 'kennedy',
    spin: 'hidden',
    proto: 'json',
    math: 1,
    border: 0,
    grid: 1,
    shape: 1,
    hide: ['ruler'],
    toolbar: 'zoom layers lightbox',
    // Enable only manual save functionality
    saveAndExit: '1',
    noSaveBtn: '0',
    saveAndBack: '1'
  };

  return (
    <div className="w-full h-full">
      <DrawIoEmbed
        ref={drawioRef}
        className="w-full h-full"
        urlParameters={urlParameters}
        configuration={config}
        baseUrl="https://embed.diagrams.net"
        // Disable autosave
        autosave={false}
        // Handle only manual save events
        onSave={handleSave}
      />
    </div>
  );
};

export default AmoledDrawioEditor;