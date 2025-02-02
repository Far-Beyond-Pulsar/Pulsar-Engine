"use client";

import React from 'react';
import { UIElementsProvider } from './contexts/UIEditorContext';
import Editor from './components/Editor';

function UIEditor() {
  return (
    <UIElementsProvider>
      <Editor />
    </UIElementsProvider>
  );
}

export default UIEditor;