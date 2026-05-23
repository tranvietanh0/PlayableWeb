import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../stores/editorStore.js';

function getState() {
  return useEditorStore.getState();
}

describe('editorStore', () => {
  beforeEach(() => {
    useEditorStore.setState({
      mode: 'edit',
      selectedEntityIds: [],
      layout: { left: 20, right: 20, top: 40, bottom: 20 },
      isPlaying: false,
    });
  });

  it('should default to edit mode', () => {
    expect(getState().mode).toBe('edit');
    expect(getState().isPlaying).toBe(false);
  });

  it('should toggle play/stop', () => {
    getState().play();
    expect(getState().mode).toBe('play');
    expect(getState().isPlaying).toBe(true);

    getState().stop();
    expect(getState().mode).toBe('edit');
    expect(getState().isPlaying).toBe(false);
  });

  it('should select entity', () => {
    getState().selectEntity(1);
    expect(getState().selectedEntityIds).toEqual([1]);
  });

  it('should multi-select entities', () => {
    getState().selectEntity(1);
    getState().selectEntity(2, true);
    expect(getState().selectedEntityIds).toEqual([1, 2]);
  });

  it('should deselect entity', () => {
    getState().selectEntity(1);
    getState().selectEntity(2, true);
    getState().deselectEntity(1);
    expect(getState().selectedEntityIds).toEqual([2]);
  });

  it('should clear selection', () => {
    getState().selectEntity(1);
    getState().clearSelection();
    expect(getState().selectedEntityIds).toEqual([]);
  });

  it('should update layout', () => {
    getState().setLayout({ left: 30 });
    expect(getState().layout.left).toBe(30);
    expect(getState().layout.right).toBe(20);
  });
});
