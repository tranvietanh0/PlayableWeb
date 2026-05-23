import { describe, it, expect, beforeEach } from 'vitest';
import { useViewportStore } from '@pwe/editor-shell';

function getState() {
  return useViewportStore.getState();
}

describe('viewportStore', () => {
  beforeEach(() => {
    useViewportStore.setState({
      dimension: { width: 800, height: 600 },
      mode: '3d',
      cameraPosition: { x: 0, y: 0, z: 5 },
      cameraZoom: 1,
    });
  });

  it('should default to 3d mode', () => {
    expect(getState().mode).toBe('3d');
  });

  it('should switch viewport mode', () => {
    getState().setMode('2d');
    expect(getState().mode).toBe('2d');
  });

  it('should update dimension', () => {
    getState().setDimension({ width: 1024, height: 768 });
    expect(getState().dimension.width).toBe(1024);
    expect(getState().dimension.height).toBe(768);
  });

  it('should update camera position', () => {
    getState().setCameraPosition({ x: 1, y: 2, z: 3 });
    expect(getState().cameraPosition).toEqual({ x: 1, y: 2, z: 3 });
  });

  it('should update camera zoom', () => {
    getState().setCameraZoom(2);
    expect(getState().cameraZoom).toBe(2);
  });
});
