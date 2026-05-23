import { create } from 'zustand';

export type EditorMode = 'edit' | 'play';

export interface PanelLayout {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface EditorState {
  mode: EditorMode;
  selectedEntityIds: number[];
  layout: PanelLayout;
  isPlaying: boolean;
}

export interface EditorActions {
  setMode: (mode: EditorMode) => void;
  selectEntity: (id: number, multi?: boolean) => void;
  deselectEntity: (id: number) => void;
  clearSelection: () => void;
  setLayout: (layout: Partial<PanelLayout>) => void;
  play: () => void;
  stop: () => void;
}

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  mode: 'edit',
  selectedEntityIds: [],
  layout: { left: 20, right: 20, top: 40, bottom: 20 },
  isPlaying: false,

  setMode: (mode) => set({ mode }),

  selectEntity: (id, multi = false) =>
    set((state) => {
      if (multi) {
        if (state.selectedEntityIds.includes(id)) {
          return { selectedEntityIds: state.selectedEntityIds.filter((e) => e !== id) };
        }
        return { selectedEntityIds: [...state.selectedEntityIds, id] };
      }
      return { selectedEntityIds: [id] };
    }),

  deselectEntity: (id) =>
    set((state) => ({
      selectedEntityIds: state.selectedEntityIds.filter((e) => e !== id),
    })),

  clearSelection: () => set({ selectedEntityIds: [] }),

  setLayout: (layout) =>
    set((state) => ({
      layout: { ...state.layout, ...layout },
    })),

  play: () => set({ mode: 'play', isPlaying: true }),

  stop: () => set({ mode: 'edit', isPlaying: false }),
}));
