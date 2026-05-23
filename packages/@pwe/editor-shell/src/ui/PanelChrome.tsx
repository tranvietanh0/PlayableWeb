import React from 'react';
import { editorTheme } from './theme.js';

export interface PanelChromeProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

export const PanelChrome: React.FC<PanelChromeProps> = ({
  title,
  children,
  style,
  bodyStyle,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: editorTheme.color.surface,
      border: editorTheme.border.default,
      overflow: 'hidden',
      ...style,
    }}
  >
    {title && <PanelHeader title={title} />}
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', ...bodyStyle }}>{children}</div>
  </div>
);

export interface PanelHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: editorTheme.spacing.md,
      padding: `${editorTheme.spacing.sm}px ${editorTheme.spacing.lg}px`,
      fontSize: editorTheme.typography.panelTitleSize,
      fontWeight: 700,
      color: editorTheme.color.textMuted,
      background: editorTheme.color.surfaceRaised,
      borderBottom: editorTheme.border.default,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    }}
  >
    <span>{title}</span>
    {children}
  </div>
);
