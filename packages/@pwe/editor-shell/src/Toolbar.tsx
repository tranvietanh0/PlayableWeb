import React from 'react';
import { useEditorStore } from './stores/editorStore.js';
import { Button, ToolbarGroup, editorTheme } from './ui/index.js';

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
        gap: editorTheme.spacing.md,
        padding: `${editorTheme.spacing.md}px ${editorTheme.spacing.lg}px`,
        background: editorTheme.color.surface,
        borderBottom: editorTheme.border.default,
        color: editorTheme.color.text,
        fontFamily: editorTheme.typography.fontFamily,
        fontSize: editorTheme.typography.bodySize,
        userSelect: 'none',
      }}
    >
      <span style={{ fontWeight: 700, marginRight: editorTheme.spacing.md }}>
        PlayableWeb Editor
      </span>

      <Button
        compact
        variant={isPlaying ? 'primary' : 'default'}
        onClick={() => {
          if (isPlaying) stop();
          else play();
        }}
      >
        {isPlaying ? 'Stop' : 'Play'}
      </Button>

      <ToolbarGroup>
        <Button compact onClick={onUndo}>Undo</Button>
        <Button compact onClick={onRedo}>Redo</Button>
      </ToolbarGroup>

      <ToolbarGroup>
        <Button compact onClick={onSave}>Save</Button>
      </ToolbarGroup>

      <div style={{ marginLeft: 'auto', fontSize: 12, color: editorTheme.color.textSubtle }}>
        Mode: <strong style={{ color: editorTheme.color.textMuted }}>{mode}</strong>
      </div>
    </div>
  );
};
