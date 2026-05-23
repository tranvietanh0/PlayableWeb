import React from 'react';
import { PanelLayout } from './PanelLayout.js';
import { Toolbar } from './Toolbar.js';
import { EmptyState, PanelChrome } from './ui/index.js';

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
}) => <PanelChrome title={title}>{children}</PanelChrome>;

const Placeholder: React.FC<{ text: string }> = ({ text }) => (
  <EmptyState>{text}</EmptyState>
);
