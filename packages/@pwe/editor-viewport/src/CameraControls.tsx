import React from 'react';
import { NumberInput, editorTheme, useViewportStore } from '@pwe/editor-shell';

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
        background: editorTheme.color.overlay,
        padding: `${editorTheme.spacing.sm}px ${editorTheme.spacing.lg}px`,
        borderRadius: editorTheme.radius.lg,
        border: editorTheme.border.strong,
      }}
    >
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as '2d' | '3d' | 'mixed')}
        style={{
          background: editorTheme.color.surfaceRaised,
          color: editorTheme.color.text,
          border: editorTheme.border.default,
          borderRadius: editorTheme.radius.md,
          padding: '4px 8px',
          fontSize: editorTheme.typography.controlSize,
        }}
      >
        <option value="3d">3D</option>
        <option value="2d">2D</option>
        <option value="mixed">Mixed</option>
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <label style={{ fontSize: 11, color: editorTheme.color.textMuted }}>Pos</label>
        <NumberInput
          value={cameraPosition.x}
          onChange={(e) =>
            setCameraPosition({ ...cameraPosition, x: Number(e.target.value) })
          }
          style={inputStyle}
        />
        <NumberInput
          value={cameraPosition.y}
          onChange={(e) =>
            setCameraPosition({ ...cameraPosition, y: Number(e.target.value) })
          }
          style={inputStyle}
        />
        <NumberInput
          value={cameraPosition.z}
          onChange={(e) =>
            setCameraPosition({ ...cameraPosition, z: Number(e.target.value) })
          }
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <label style={{ fontSize: 11, color: editorTheme.color.textMuted }}>Zoom</label>
        <NumberInput
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
  padding: '2px 4px',
};
