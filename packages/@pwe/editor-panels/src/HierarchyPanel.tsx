import React from 'react';
import { useEditorStore } from '@pwe/editor-shell';

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
          gap: 4,
          padding: '6px 8px',
          borderBottom: '1px solid #333',
        }}
      >
        <button style={btnStyle} onClick={onCreateEntity}>
          + Entity
        </button>
        <button
          style={btnStyle}
          onClick={() => {
            selectedIds.forEach((id) => onDeleteEntity?.(id));
          }}
        >
          Delete
        </button>
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
        padding: '4px 12px',
        cursor: 'pointer',
        background: selected ? '#094771' : 'transparent',
        color: '#e0e0e0',
        fontSize: 13,
        userSelect: 'none',
      }}
      onClick={(e) => onSelect(node.id, e.ctrlKey || e.metaKey)}
    >
      {node.name}
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  padding: '2px 8px',
  fontSize: 12,
  background: '#2c2c2c',
  color: '#e0e0e0',
  border: '1px solid #444',
  borderRadius: 4,
  cursor: 'pointer',
};
