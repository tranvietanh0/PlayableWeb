import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../stores/projectStore.js';

function getState() {
  return useProjectStore.getState();
}

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({
      projectName: 'Untitled Project',
      scenes: [],
      activeSceneId: null,
      assets: [],
    });
  });

  it('should set project name', () => {
    getState().setProjectName('My Game');
    expect(getState().projectName).toBe('My Game');
  });

  it('should add and remove scenes', () => {
    const scene = { id: 's1', name: 'Level 1', rootEntityIds: [] };
    getState().addScene(scene);
    expect(getState().scenes).toHaveLength(1);

    getState().removeScene('s1');
    expect(getState().scenes).toHaveLength(0);
  });

  it('should set active scene', () => {
    getState().setActiveScene('s1');
    expect(getState().activeSceneId).toBe('s1');
  });

  it('should add and remove assets', () => {
    const asset = { id: 'a1', name: 'hero.png', type: 'texture' as const, path: '/assets/hero.png' };
    getState().addAsset(asset);
    expect(getState().assets).toHaveLength(1);

    getState().removeAsset('a1');
    expect(getState().assets).toHaveLength(0);
  });
});
