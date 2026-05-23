import React from 'react';
import { useEditorStore } from './stores/editorStore.js';

export interface ToolbarProps {
  onUndo?: (() => void) | undefined;
  onRedo?: (() => void) | undefined;
  onSave?: (() => void) | undefined;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onUndo, onRedo, onSave }) => {
  const mode = useEditorStore((s) => s.mode);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const play = useEditorStore((s) => s.play);
  const stop = useEditorStore((s) => s.stop);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: '#1e1e1e',
        borderBottom: '1px solid #333',
        color: '#e0e0e0',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        userSelect: 'none',
      }}
    >
      <span style={{ fontWeight: 600, marginRight: 12 }}>PlayableWeb Editor</span>

      <ToolbarButton
        label={isPlaying ? 'Stop' : 'Play'}
        active={isPlaying}
        onClick={() => {
          if (isPlaying) stop();
          else play();
        }}
      />

      <ToolbarDivider />

      <ToolbarButton label="Undo" onClick={onUndo} />
      <ToolbarButton label="Redo" onClick={onRedo} />

      <ToolbarDivider />

      <ToolbarButton label="Save" onClick={onSave} />

      <div style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
        Mode: <strong>{mode}</strong>
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{
  label: string;
  active?: boolean;
  onClick?: (() => void) | undefined;
}> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick ?? undefined}
      style={{
        padding: '4px 10px',
        borderRadius: 4,
        border: '1px solid #444',
        background: active ? '#0e639c' : '#2c2c2c',
        color: active ? '#fff' : '#e0e0e0',
        cursor: 'pointer',
        fontSize: 13,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = active ? '#1177bb' : '#3c3c3c';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = active ? '#0e639c' : '#2c2c2c';
      }}
    >
      {label}
    </button>
  );
};

const ToolbarDivider: React.FC = () => (
  <div style={{ width: 1, height: 20, background: '#444', margin: '0 4px' }} />
);
