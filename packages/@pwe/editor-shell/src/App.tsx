import React from 'react';
import { PanelLayout } from './PanelLayout.js';
import { Toolbar } from './Toolbar.js';

export interface AppProps {
  leftPanel?: React.ReactNode;
  centerPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  bottomPanel?: React.ReactNode;
  onUndo?: (() => void) | undefined;
  onRedo?: (() => void) | undefined;
  onSave?: (() => void) | undefined;
}

export const App: React.FC<AppProps> = ({
  leftPanel,
  centerPanel,
  rightPanel,
  bottomPanel,
  onUndo,
  onRedo,
  onSave,
}) => {
  return (
    <PanelLayout
      toolbar={<Toolbar onUndo={onUndo} onRedo={onRedo} onSave={onSave} />}
      leftPanel={
        <PanelContainer title="Hierarchy">
          {leftPanel ?? <Placeholder text="Hierarchy Panel" />}
        </PanelContainer>
      }
      centerPanel={
        <PanelContainer title="Viewport">
          {centerPanel ?? <Placeholder text="Viewport Panel" />}
        </PanelContainer>
      }
      rightPanel={
        <PanelContainer title="Inspector">
          {rightPanel ?? <Placeholder text="Inspector Panel" />}
        </PanelContainer>
      }
      bottomPanel={
        bottomPanel ? (
          <PanelContainer title="Assets / Console">{bottomPanel}</PanelContainer>
        ) : undefined
      }
    />
  );
};

const PanelContainer: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#1e1e1e',
        border: '1px solid #333',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '6px 10px',
          fontSize: 12,
          fontWeight: 600,
          color: '#ccc',
          background: '#252526',
          borderBottom: '1px solid #333',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </div>
  );
};

const Placeholder: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        color: '#666',
        fontSize: 14,
      }}
    >
      {text}
    </div>
  );
};
