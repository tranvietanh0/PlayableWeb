import { create } from 'zustand';

export type ViewportDimension = {
  width: number;
  height: number;
};

export type ViewportMode = '2d' | '3d' | 'mixed';

export interface ViewportState {
  dimension: ViewportDimension;
  mode: ViewportMode;
  cameraPosition: { x: number; y: number; z: number };
  cameraZoom: number;
}

export interface ViewportActions {
  setDimension: (dimension: ViewportDimension) => void;
  setMode: (mode: ViewportMode) => void;
  setCameraPosition: (pos: { x: number; y: number; z: number }) => void;
  setCameraZoom: (zoom: number) => void;
}

export const useViewportStore = create<ViewportState & ViewportActions>((set) => ({
  dimension: { width: 800, height: 600 },
  mode: '3d',
  cameraPosition: { x: 0, y: 0, z: 5 },
  cameraZoom: 1,

  setDimension: (dimension) => set({ dimension }),
  setMode: (mode) => set({ mode }),
  setCameraPosition: (cameraPosition) => set({ cameraPosition }),
  setCameraZoom: (cameraZoom) => set({ cameraZoom }),
}));
