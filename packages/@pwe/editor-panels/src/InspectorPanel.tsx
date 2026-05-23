import React from 'react';
import { useEditorStore } from '@pwe/editor-shell';

export interface ComponentField {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'vec2' | 'vec3' | 'color' | 'assetRef';
  value: unknown;
}

export interface ComponentSchema {
  type: string;
  fields: ComponentField[];
}

export interface InspectorPanelProps {
  schemas: ComponentSchema[];
  onFieldChange?: (componentType: string, fieldName: string, value: unknown) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  schemas,
  onFieldChange,
}) => {
  const selectedIds = useEditorStore((s) => s.selectedEntityIds);

  if (selectedIds.length === 0) {
    return (
      <div style={placeholderStyle}>
        Select an entity to inspect
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 10px', overflow: 'auto' }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
        Entity {selectedIds.join(', ')}
      </div>

      {schemas.map((schema) => (
        <ComponentSection
          key={schema.type}
          schema={schema}
          onFieldChange={onFieldChange}
        />
      ))}
    </div>
  );
};

const ComponentSection: React.FC<{
  schema: ComponentSchema;
  onFieldChange?: ((componentType: string, fieldName: string, value: unknown) => void) | undefined;
}> = ({ schema, onFieldChange }) => {
  return (
    <div
      style={{
        marginBottom: 12,
        border: '1px solid #333',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '6px 10px',
          background: '#252526',
          fontSize: 12,
          fontWeight: 600,
          color: '#ccc',
        }}
      >
        {schema.type}
      </div>
      <div style={{ padding: '6px 10px' }}>
        {schema.fields.map((field) => (
          <FieldRow
            key={field.name}
            field={field}
            onChange={(value) => onFieldChange?.(schema.type, field.name, value)}
          />
        ))}
      </div>
    </div>
  );
};

const FieldRow: React.FC<{
  field: ComponentField;
  onChange: (value: unknown) => void;
}> = ({ field, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
      }}
    >
      <label
        style={{
          width: 80,
          fontSize: 12,
          color: '#aaa',
          flexShrink: 0,
        }}
      >
        {field.name}
      </label>
      <FieldInput field={field} onChange={onChange} />
    </div>
  );
};

const FieldInput: React.FC<{
  field: ComponentField;
  onChange: (value: unknown) => void;
}> = ({ field, onChange }) => {
  switch (field.type) {
    case 'number':
      return (
        <input
          type="number"
          value={field.value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          style={inputStyle}
        />
      );
    case 'string':
    case 'assetRef':
      return (
        <input
          type="text"
          value={field.value as string}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={field.value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          style={{ cursor: 'pointer' }}
        />
      );
    case 'vec2': {
      const v2 = field.value as { x: number; y: number };
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <VecInput value={v2.x} onChange={(x) => onChange({ ...v2, x })} />
          <VecInput value={v2.y} onChange={(y) => onChange({ ...v2, y })} />
        </div>
      );
    }
    case 'vec3': {
      const v3 = field.value as { x: number; y: number; z: number };
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <VecInput value={v3.x} onChange={(x) => onChange({ ...v3, x })} />
          <VecInput value={v3.y} onChange={(y) => onChange({ ...v3, y })} />
          <VecInput value={v3.z} onChange={(z) => onChange({ ...v3, z })} />
        </div>
      );
    }
    case 'color': {
      const c = field.value as { r: number; g: number; b: number; a: number };
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <VecInput value={c.r} onChange={(r) => onChange({ ...c, r })} />
          <VecInput value={c.g} onChange={(g) => onChange({ ...c, g })} />
          <VecInput value={c.b} onChange={(b) => onChange({ ...c, b })} />
          <VecInput value={c.a} onChange={(a) => onChange({ ...c, a })} />
        </div>
      );
    }
    default:
      return <span style={{ color: '#666', fontSize: 12 }}>Unsupported</span>;
  }
};

const VecInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => (
  <input
    type="number"
    step={0.1}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    style={{ ...inputStyle, width: 52 }}
  />
);

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: '#2c2c2c',
  color: '#e0e0e0',
  border: '1px solid #444',
  borderRadius: 4,
  padding: '3px 6px',
  fontSize: 12,
};

const placeholderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  color: '#666',
  fontSize: 13,
};
