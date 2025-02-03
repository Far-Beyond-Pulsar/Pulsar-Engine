import React from 'react';
import { Box } from 'lucide-react';
import { isImageFile, is3DFile } from '@/utils/fileUtils';

/**
 * MediaViewer Component
 * 
 * Handles rendering of media files (images and 3D files)
 * with appropriate viewers and placeholders.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.file - File object to display
 * @param {string} props.file.name - File name
 * @param {string} props.file.content - File content (base64 for images)
 * @param {string} props.file.mediaType - Media MIME type
 * 
 * @example
 * <MediaViewer
 *   file={{
 *     name: 'image.png',
 *     content: 'base64content...',
 *     mediaType: 'image/png'
 *   }}
 * />
 */
const MediaViewer = ({ file }) => {
  // Image viewer
  if (isImageFile(file.name)) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="relative max-w-full max-h-full p-4">
          <img
            src={`data:${file.mediaType};base64,${file.content}`}
            alt={file.name}
            className="max-w-full max-h-[calc(100vh-12rem)] object-contain"
            loading="lazy"
            title={file.name}
          />
        </div>
      </div>
    );
  }

  // 3D file placeholder
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

/**
 * Component Maintenance Notes:
 * 
 * 1. Supported Media:
 *    - Images (png, jpg, jpeg, gif, webp)
 *    - 3D files (placeholder)
 * 
 * 2. Features:
 *    - Centered display
 *    - Aspect ratio preservation
 *    - Responsive sizing
 *    - Lazy loading
 * 
 * 3. Performance:
 *    - Lazy image loading
 *    - Conditional rendering
 *    - Size constraints
 * 
 * 4. Accessibility:
 *    - Alt text for images
 *    - Title attributes
 *    - Screen reader considerations
 * 
 * 5. Future Improvements:
 *    - Add zoom controls
 *    - Add image rotation
 *    - Add 3D viewer integration
 *    - Add image editing tools
 *    - Add slideshow mode
 *    - Add file information panel
 * 
 * 6. Dependencies:
 *    - lucide-react
 *    - @/utils/fileUtils
 */
