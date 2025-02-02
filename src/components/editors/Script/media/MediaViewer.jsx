import React from 'react';
import { Box } from 'lucide-react';

const MediaViewer = ({ file }) => {
  if (isImageFile(file.name)) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="relative max-w-full max-h-full p-4">
          <img
            src={`data:${file.mediaType};base64,${file.content}`}
            alt={file.name}
            className="max-w-full max-h-[calc(100vh-12rem)] object-contain"
          />
        </div>
      </div>
    );
  }

  if (is3DFile(file.name)) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center p-4">
          <Box size={48} className="mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">3D viewer support coming soon...</p>
          <p className="text-sm text-gray-500 mt-2">File: {file.name}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default MediaViewer;
