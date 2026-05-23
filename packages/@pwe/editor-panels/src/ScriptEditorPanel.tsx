import React, { useState } from 'react';

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 10px',
          borderBottom: '1px solid #333',
          background: '#252526',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>
          Script Editor
        </span>
        <button
          onClick={onRun}
          style={{
            padding: '2px 10px',
            fontSize: 12,
            background: '#0e639c',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Run
        </button>
      </div>

      <textarea
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1,
          width: '100%',
          resize: 'none',
          background: '#1e1e1e',
          color: '#d4d4d4',
          border: 'none',
          padding: 10,
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: 1.5,
          outline: 'none',
        }}
      />
    </div>
  );
};
