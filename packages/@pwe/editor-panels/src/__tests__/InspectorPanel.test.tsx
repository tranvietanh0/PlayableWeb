import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InspectorPanel } from '../InspectorPanel.js';
import { useEditorStore } from '@pwe/editor-shell';

describe('InspectorPanel', () => {
  beforeEach(() => {
    useEditorStore.setState({
      mode: 'edit',
      selectedEntityIds: [],
      layout: { left: 20, right: 20, top: 40, bottom: 20 },
      isPlaying: false,
    });
  });

  it('should show placeholder when no selection', () => {
    render(React.createElement(InspectorPanel, { schemas: [] }));
    expect(screen.getAllByText('Select an entity to inspect').length).toBeGreaterThan(0);
  });

  it('should render component schemas', () => {
    useEditorStore.setState({ selectedEntityIds: [1] });

    const schemas = [
      {
        type: 'Transform',
        fields: [
          { name: 'position', type: 'vec3' as const, value: { x: 0, y: 0, z: 0 } },
        ],
      },
    ];

    render(React.createElement(InspectorPanel, { schemas }));
    expect(screen.getAllByText('Transform').length).toBeGreaterThan(0);
    expect(screen.getAllByText('position').length).toBeGreaterThan(0);
  });

  it('should call onFieldChange', () => {
    useEditorStore.setState({ selectedEntityIds: [1] });

    let changed = false;
    const schemas = [
      {
        type: 'Transform',
        fields: [
          { name: 'x', type: 'number' as const, value: 0 },
        ],
      },
    ];

    render(
      React.createElement(InspectorPanel, {
        schemas,
        onFieldChange: () => {
          changed = true;
        },
      })
    );

    const inputs = screen.getAllByDisplayValue('0');
    expect(inputs.length).toBeGreaterThan(0);
    fireEvent.change(inputs[0]!, { target: { value: '5' } });
    expect(changed).toBe(true);
  });
});
