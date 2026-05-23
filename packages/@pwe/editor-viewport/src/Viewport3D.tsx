import React, { useRef, useEffect } from 'react';
import { Engine } from '@pwe/engine-core';
import { ThreeRenderSystem } from '@pwe/render-3d';
import { useViewportStore } from '@pwe/editor-shell';

export interface Viewport3DProps {
  engine: Engine;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderSystemRef = useRef<ThreeRenderSystem | null>(null);
  const setDimension = useViewportStore((s) => s.setDimension);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const system = new ThreeRenderSystem(canvas);
    renderSystemRef.current = system;

    engine.world.addSystem({
      name: 'ThreeRenderSystem',
      update: system.update,
      priority: 100,
    });

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        system.resize(width, height);
        setDimension({ width, height });
      }
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      engine.world.removeSystem('ThreeRenderSystem');
      system.dispose();
      renderSystemRef.current = null;
    };
  }, [engine, setDimension]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#000',
      }}
    />
  );
};
