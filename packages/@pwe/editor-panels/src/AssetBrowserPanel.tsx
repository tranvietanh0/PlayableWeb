import React, { useState } from 'react';
import { useProjectStore } from '@pwe/editor-shell';

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
          padding: '6px 8px',
          borderBottom: '1px solid #333',
        }}
      >
        <input
          type="text"
          placeholder="Filter assets..."
          value={filter}
          onChange={(e) => handleFilter(e.target.value)}
          style={{
            width: '100%',
            background: '#2c2c2c',
            color: '#e0e0e0',
            border: '1px solid #444',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 12,
          }}
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
              gap: 4,
              padding: 6,
              background: '#252526',
              borderRadius: 4,
              cursor: 'grab',
              border: '1px solid #333',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: '#333',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#888',
                textTransform: 'uppercase',
              }}
            >
              {asset.type.slice(0, 3)}
            </div>
            <span
              style={{
                fontSize: 10,
                color: '#ccc',
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
