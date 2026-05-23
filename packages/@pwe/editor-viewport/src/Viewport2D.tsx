import React, { useRef, useEffect } from 'react';
import { Engine } from '@pwe/engine-core';
import { PixiRenderSystem } from '@pwe/render-2d';
import { useViewportStore } from '@pwe/editor-shell';

export interface Viewport2DProps {
  engine: Engine;
}

export const Viewport2D: React.FC<Viewport2DProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderSystemRef = useRef<PixiRenderSystem | null>(null);
  const setDimension = useViewportStore((s) => s.setDimension);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const system = new PixiRenderSystem(canvas);
    renderSystemRef.current = system;

    const init = async () => {
      await system.init(canvas, canvas.clientWidth, canvas.clientHeight);

      engine.world.addSystem({
        name: 'PixiRenderSystem',
        update: system.update,
        priority: 100,
      });
    };

    init();

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
      engine.world.removeSystem('PixiRenderSystem');
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
        background: '#111',
      }}
    />
  );
};
