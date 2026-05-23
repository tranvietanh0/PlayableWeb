import React, { useState } from 'react';
import { TextInput, editorTheme, useProjectStore } from '@pwe/editor-shell';

export interface AssetBrowserPanelProps {
  onDragAsset?: (assetId: string) => void;
  onFilterChange?: (filter: string) => void;
}

export const AssetBrowserPanel: React.FC<AssetBrowserPanelProps> = ({
  onDragAsset,
  onFilterChange,
}) => {
  const assets = useProjectStore((s) => s.assets);
  const [filter, setFilter] = useState('');

  const filtered = filter
    ? assets.filter((a) =>
        a.name.toLowerCase().includes(filter.toLowerCase())
      )
    : assets;

  const handleFilter = (value: string) => {
    setFilter(value);
    onFilterChange?.(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          padding: `${editorTheme.spacing.sm}px ${editorTheme.spacing.md}px`,
          borderBottom: editorTheme.border.default,
        }}
      >
        <TextInput
          placeholder="Filter assets..."
          value={filter}
          onChange={(e) => handleFilter(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 8,
          padding: 8,
        }}
      >
        {filtered.map((asset) => (
          <div
            key={asset.id}
            draggable
            onDragStart={() => onDragAsset?.(asset.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: editorTheme.spacing.xs,
              padding: editorTheme.spacing.sm,
              background: editorTheme.color.surfaceRaised,
              borderRadius: editorTheme.radius.md,
              cursor: 'grab',
              border: editorTheme.border.default,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: editorTheme.color.surfaceHover,
                borderRadius: editorTheme.radius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: editorTheme.color.textSubtle,
                textTransform: 'uppercase',
              }}
            >
              {asset.type.slice(0, 3)}
            </div>
            <span
              style={{
                fontSize: 10,
                color: editorTheme.color.textMuted,
                textAlign: 'center',
                wordBreak: 'break-word',
                width: '100%',
              }}
            >
              {asset.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
