import React from 'react';
import { createRoot } from 'react-dom/client';
import { EditorApp } from './EditorApp.js';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

createRoot(container).render(
  React.createElement(EditorApp, {})
);
