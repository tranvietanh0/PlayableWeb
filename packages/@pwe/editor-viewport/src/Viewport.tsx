import React from 'react';
import { Engine } from '@pwe/engine-core';
import { useViewportStore } from '@pwe/editor-shell';
import { Viewport3D } from './Viewport3D.js';
import { Viewport2D } from './Viewport2D.js';
import { CameraControls } from './CameraControls.js';

export interface ViewportProps {
  engine: Engine;
}

export const Viewport: React.FC<ViewportProps> = ({ engine }) => {
  const mode = useViewportStore((s) => s.mode);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <CameraControls />

      {mode === '3d' && <Viewport3D engine={engine} />}
      {mode === '2d' && <Viewport2D engine={engine} />}
      {mode === 'mixed' && (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <div style={{ flex: 1 }}>
            <Viewport3D engine={engine} />
          </div>
          <div style={{ flex: 1 }}>
            <Viewport2D engine={engine} />
          </div>
        </div>
      )}
    </div>
  );
};
