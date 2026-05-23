import React from 'react';
import { Button, editorTheme, useEditorStore } from '@pwe/editor-shell';

export interface HierarchyNode {
  id: number;
  name: string;
  children: number[];
}

export interface HierarchyPanelProps {
  nodes: HierarchyNode[];
  onCreateEntity?: () => void;
  onDeleteEntity?: (id: number) => void;
  onReparent?: (childId: number, parentId: number | null) => void;
}

export const HierarchyPanel: React.FC<HierarchyPanelProps> = ({
  nodes,
  onCreateEntity,
  onDeleteEntity,
  onReparent,
}) => {
  const selectedIds = useEditorStore((s) => s.selectedEntityIds);
  const selectEntity = useEditorStore((s) => s.selectEntity);
  void onReparent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: editorTheme.spacing.sm,
          padding: `${editorTheme.spacing.sm}px ${editorTheme.spacing.md}px`,
          borderBottom: editorTheme.border.default,
        }}
      >
        <Button compact onClick={onCreateEntity}>
          + Entity
        </Button>
        <Button
          compact
          onClick={() => {
            selectedIds.forEach((id) => onDeleteEntity?.(id));
          }}
        >
          Delete
        </Button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {nodes.map((node) => (
          <HierarchyItem
            key={node.id}
            node={node}
            selected={selectedIds.includes(node.id)}
            onSelect={(id, multi) => selectEntity(id, multi)}
          />
        ))}
      </div>
    </div>
  );
};

const HierarchyItem: React.FC<{
  node: HierarchyNode;
  selected: boolean;
  onSelect: (id: number, multi: boolean) => void;
}> = ({ node, selected, onSelect }) => {
  return (
    <div
      style={{
        padding: `${editorTheme.spacing.xs}px ${editorTheme.spacing.lg}px`,
        cursor: 'pointer',
        background: selected ? editorTheme.color.surfaceActive : 'transparent',
        color: editorTheme.color.text,
        fontSize: editorTheme.typography.bodySize,
        userSelect: 'none',
      }}
      onClick={(e) => onSelect(node.id, e.ctrlKey || e.metaKey)}
    >
      {node.name}
    </div>
  );
};
