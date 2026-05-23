import React, { useState } from 'react';
import { Button, PanelHeader, editorTheme } from '@pwe/editor-shell';

export interface ScriptEditorPanelProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onRun?: () => void;
}

export const ScriptEditorPanel: React.FC<ScriptEditorPanelProps> = ({
  initialValue = '',
  onChange,
  onRun,
}) => {
  const [code, setCode] = useState(initialValue);

  const handleChange = (value: string) => {
    setCode(value);
    onChange?.(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PanelHeader title="Script Editor">
        <Button compact variant="primary" onClick={onRun}>
          Run
        </Button>
      </PanelHeader>

      <textarea
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1,
          width: '100%',
          resize: 'none',
          background: editorTheme.color.codeBackground,
          color: editorTheme.color.text,
          border: 'none',
          padding: 10,
          fontFamily: editorTheme.typography.monoFamily,
          fontSize: 13,
          lineHeight: 1.5,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};
