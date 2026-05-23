import React from 'react';
import { editorTheme } from './theme.js';

export const ToolbarGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: editorTheme.spacing.sm,
      paddingLeft: editorTheme.spacing.md,
      marginLeft: editorTheme.spacing.md,
      borderLeft: editorTheme.border.default,
    }}
  >
    {children}
  </div>
);
