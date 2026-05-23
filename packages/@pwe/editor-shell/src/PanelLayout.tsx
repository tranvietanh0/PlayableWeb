import React from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { editorTheme } from './ui/index.js';

export interface PanelLayoutProps {
  toolbar: React.ReactNode;
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  bottomPanel?: React.ReactNode;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({
  toolbar,
  leftPanel,
  centerPanel,
  rightPanel,
  bottomPanel,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        background: editorTheme.color.appBackground,
        color: editorTheme.color.text,
        fontFamily: editorTheme.typography.fontFamily,
        overflow: 'hidden',
      }}
    >
      <div style={{ flexShrink: 0 }}>{toolbar}</div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <PanelGroup direction="horizontal">
          <Panel
            defaultSize={20}
            minSize={10}
            maxSize={40}
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {leftPanel}
          </Panel>

          <PanelResizeHandle
            style={{
              width: 4,
              background: editorTheme.color.border,
              cursor: 'col-resize',
            }}
          />

          <Panel style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <PanelGroup direction="vertical">
              <Panel style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {centerPanel}
              </Panel>

              {bottomPanel && (
                <>
                  <PanelResizeHandle
                    style={{
                      height: 4,
                      background: editorTheme.color.border,
                      cursor: 'row-resize',
                    }}
                  />
                  <Panel
                    defaultSize={25}
                    minSize={10}
                    maxSize={50}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    {bottomPanel}
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          <PanelResizeHandle
            style={{
              width: 4,
              background: editorTheme.color.border,
              cursor: 'col-resize',
            }}
          />

          <Panel
            defaultSize={20}
            minSize={10}
            maxSize={40}
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {rightPanel}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};
