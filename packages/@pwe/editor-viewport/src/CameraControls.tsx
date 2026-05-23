import React from 'react';
import { useViewportStore } from '@pwe/editor-shell';

export const CameraControls: React.FC = () => {
  const mode = useViewportStore((s) => s.mode);
  const setMode = useViewportStore((s) => s.setMode);
  const cameraPosition = useViewportStore((s) => s.cameraPosition);
  const setCameraPosition = useViewportStore((s) => s.setCameraPosition);
  const cameraZoom = useViewportStore((s) => s.cameraZoom);
  const setCameraZoom = useViewportStore((s) => s.setCameraZoom);

  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        background: 'rgba(30,30,30,0.9)',
        padding: '6px 10px',
        borderRadius: 4,
        border: '1px solid #444',
      }}
    >
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as '2d' | '3d' | 'mixed')}
        style={{
          background: '#2c2c2c',
          color: '#e0e0e0',
          border: '1px solid #444',
          borderRadius: 4,
          padding: '4px 8px',
          fontSize: 12,
        }}
      >
        <option value="3d">3D</option>
        <option value="2d">2D</option>
        <option value="mixed">Mixed</option>
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <label style={{ fontSize: 11, color: '#aaa' }}>Pos</label>
        <input
          type="number"
          value={cameraPosition.x}
          onChange={(e) =>
            setCameraPosition({ ...cameraPosition, x: Number(e.target.value) })
          }
          style={inputStyle}
        />
        <input
          type="number"
          value={cameraPosition.y}
          onChange={(e) =>
            setCameraPosition({ ...cameraPosition, y: Number(e.target.value) })
          }
          style={inputStyle}
        />
        <input
          type="number"
          value={cameraPosition.z}
          onChange={(e) =>
            setCameraPosition({ ...cameraPosition, z: Number(e.target.value) })
          }
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <label style={{ fontSize: 11, color: '#aaa' }}>Zoom</label>
        <input
          type="number"
          step={0.1}
          value={cameraZoom}
          onChange={(e) => setCameraZoom(Number(e.target.value))}
          style={{ ...inputStyle, width: 50 }}
        />
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: 48,
  background: '#2c2c2c',
  color: '#e0e0e0',
  border: '1px solid #444',
  borderRadius: 4,
  padding: '2px 4px',
  fontSize: 12,
};
