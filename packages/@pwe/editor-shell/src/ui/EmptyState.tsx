import React from 'react';
import { editorTheme } from './theme.js';

export interface EmptyStateProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ children, style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      color: editorTheme.color.textSubtle,
      fontFamily: editorTheme.typography.fontFamily,
      fontSize: editorTheme.typography.bodySize,
      ...style,
    }}
  >
    {children}
  </div>
);
