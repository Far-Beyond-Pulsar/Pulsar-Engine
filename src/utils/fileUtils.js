// @/utils/fileUtils.js

/**
 * Check if a file is an image based on its extension
 */
export const isImageFile = (filename) => /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename);

/**
 * Check if a file is a 3D model based on its extension
 */
export const is3DFile = (filename) => /\.(glb|gltf|obj|fbx|stl)$/i.test(filename);

/**
 * Get the programming language based on file extension
 */
export const getFileLanguage = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const languageMap = {
    js:      'javascript',
    jsx:     'javascript',
    ts:      'typescript',
    tsx:     'typescript',
    py:      'python',
    html:    'html',
    css:     'css',
    json:    'json',
    md:      'markdown',
    sql:     'sql',
    rs:      'rust',
    go:      'go',
    java:    'java',
    cpp:     'cpp',
    c:       'c',
    cs:      'csharp',
    php:     'php',
    rb:      'ruby',
    swift:   'swift',
    kt:      'kotlin',
    dart:    'dart',
    yaml:    'yaml',
    yml:     'yaml',
    xml:     'xml',
    sh:      'shell',
    bash:    'shell',
    zsh:     'shell',
    vue:     'vue',
    svelte:  'svelte',
    graphql: 'graphql',
    proto:   'protobuf'
  };
  return languageMap[ext] || 'plaintext';
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Get a suitable icon based on file type
 * You'll need to have these icons imported from your icon library (e.g., lucide-react)
 */
export const getFileIcon = (filename) => {
  if (isImageFile(filename)) return 'image';
  if (is3DFile(filename)) return 'box';
  return 'file-code';
};

/**
 * Get MIME type for a file
 */
export const getFileMimeType = (filename) => {
  const ext = getFileExtension(filename);
  const mimeTypes = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    // Text files
    txt: 'text/plain',
    html: 'text/html',
    css: 'text/css',
    csv: 'text/csv',
    // Application types
    json: 'application/json',
    js: 'application/javascript',
    pdf: 'application/pdf',
    // 3D files
    glb: 'model/gltf-binary',
    gltf: 'model/gltf+json',
    obj: 'model/obj',
    stl: 'model/stl',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};