import { create } from 'zustand';

export interface ProjectAsset {
  id: string;
  name: string;
  type: 'texture' | 'mesh' | 'audio' | 'script' | 'scene';
  path: string;
}

export interface ProjectScene {
  id: string;
  name: string;
  rootEntityIds: number[];
}

export interface ProjectState {
  projectName: string;
  scenes: ProjectScene[];
  activeSceneId: string | null;
  assets: ProjectAsset[];
}

export interface ProjectActions {
  setProjectName: (name: string) => void;
  setActiveScene: (id: string) => void;
  addScene: (scene: ProjectScene) => void;
  removeScene: (id: string) => void;
  addAsset: (asset: ProjectAsset) => void;
  removeAsset: (id: string) => void;
}

export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
  projectName: 'Untitled Project',
  scenes: [],
  activeSceneId: null,
  assets: [],

  setProjectName: (name) => set({ projectName: name }),

  setActiveScene: (id) => set({ activeSceneId: id }),

  addScene: (scene) =>
    set((state) => ({
      scenes: [...state.scenes, scene],
    })),

  removeScene: (id) =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== id),
    })),

  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, asset],
    })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),
}));
