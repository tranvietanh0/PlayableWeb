import React, { useMemo, useCallback } from 'react';
import { App } from '@pwe/editor-shell';
import { Viewport } from '@pwe/editor-viewport';
import {
  HierarchyPanel,
  InspectorPanel,
  AssetBrowserPanel,
  ScriptEditorPanel,
} from '@pwe/editor-panels';
import { EngineProvider, useEngine, PlayModeController } from '@pwe/editor-engine-bridge';
import { useEditorStore } from '@pwe/editor-shell';
import type { HierarchyNode } from '@pwe/editor-panels';

export const EditorApp: React.FC = () => {
  return (
    <EngineProvider>
      <EditorLayout />
    </EngineProvider>
  );
};

const EditorLayout: React.FC = () => {
  const { engine, history } = useEngine();
  const playController = useMemo(() => new PlayModeController(engine), [engine]);

  const selectedIds = useEditorStore((s) => s.selectedEntityIds);

  // Build hierarchy nodes from ECS world
  const nodes: HierarchyNode[] = useMemo(() => {
    const alive = engine.world.entityManager.getAllEntities();
    return alive.map((id) => ({
      id,
      name: `Entity ${id}`,
      children: [],
    }));
  }, [engine]);

  const handleCreateEntity = useCallback(() => {
    engine.world.createEntity();
  }, [engine]);

  const handleDeleteEntity = useCallback(
    (id: number) => {
      engine.world.destroyEntity(id);
      useEditorStore.getState().deselectEntity(id);
    },
    [engine]
  );

  const handleUndo = useCallback(() => {
    history.undo();
  }, [history]);

  const handleRedo = useCallback(() => {
    history.redo();
  }, [history]);

  const handleSave = useCallback(() => {
    // TODO: serialize scene to JSON and trigger download / API save
    const json = engine.serializer.serialize(engine.world);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [engine]);

  // Play / Stop handled by Toolbar via Zustand store; PlayModeController is wired
  // via EngineProvider subscription. We keep playController in scope for future use.
  void playController;

  return (
    <App
      leftPanel={
        <HierarchyPanel
          nodes={nodes}
          onCreateEntity={handleCreateEntity}
          onDeleteEntity={handleDeleteEntity}
        />
      }
      centerPanel={<Viewport engine={engine} />}
      rightPanel={
        <InspectorPanel
          schemas={
            selectedIds.length > 0
              ? [
                  {
                    type: 'Transform',
                    fields: [
                      {
                        name: 'position',
                        type: 'vec3',
                        value: { x: 0, y: 0, z: 0 },
                      },
                      {
                        name: 'rotation',
                        type: 'vec3',
                        value: { x: 0, y: 0, z: 0 },
                      },
                      {
                        name: 'scale',
                        type: 'vec3',
                        value: { x: 1, y: 1, z: 1 },
                      },
                    ],
                  },
                ]
              : []
          }
          onFieldChange={(type, field, value) => {
            // TODO: sync to ECS component
            void type;
            void field;
            void value;
          }}
        />
      }
      bottomPanel={
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ flex: 1 }}>
            <AssetBrowserPanel
              onDragAsset={(id) => {
                void id;
              }}
            />
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid #333' }}>
            <ScriptEditorPanel
              initialValue="// Write your game script here"
              onRun={() => {
                // TODO: compile and run script in engine
              }}
            />
          </div>
        </div>
      }
      onUndo={handleUndo}
      onRedo={handleRedo}
      onSave={handleSave}
    />
  );
};
