import React, { useRef, useState, useEffect } from 'react';

const DiagramEditor = () => {
  const iframeRef = useRef(null);
  const [lastSavedXml, setLastSavedXml] = useState('');

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.event === 'save') {
        const xml = event.data.xml;
        setLastSavedXml(xml);
        
        // Create download
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.drawio';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const editorUrl = new URL('/diagram-editor/index.html', window.location.origin);
  editorUrl.searchParams.set('dark', '1');
  editorUrl.searchParams.set('ui', 'kennedy');
  editorUrl.searchParams.set('spin', 'hidden');
  editorUrl.searchParams.set('proto', 'json');
  editorUrl.searchParams.set('math', '1');
  editorUrl.searchParams.set('border', '0');
  editorUrl.searchParams.set('grid', '1');
  editorUrl.searchParams.set('shape', '1');
  editorUrl.searchParams.set('toolbar', 'zoom layers lightbox');
  editorUrl.searchParams.set('saveAndExit', '1');
  editorUrl.searchParams.set('noSaveBtn', '0');
  editorUrl.searchParams.set('saveAndBack', '1');

  return (
    <div className="w-full h-full">
      <iframe
        ref={iframeRef}
        src={editorUrl.toString()}
        className="w-full h-full border-0"
        title="Diagram Editor"
      />
    </div>
  );
};

export default DiagramEditor;