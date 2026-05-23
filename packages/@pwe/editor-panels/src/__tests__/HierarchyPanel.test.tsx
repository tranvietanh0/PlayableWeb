import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HierarchyPanel } from '../HierarchyPanel.js';
import { useEditorStore } from '@pwe/editor-shell';

function getEditorState() {
  return useEditorStore.getState();
}

describe('HierarchyPanel', () => {
  beforeEach(() => {
    useEditorStore.setState({
      mode: 'edit',
      selectedEntityIds: [],
      layout: { left: 20, right: 20, top: 40, bottom: 20 },
      isPlaying: false,
    });
  });

  it('should render nodes', () => {
    const nodes = [
      { id: 1, name: 'Player', children: [] },
      { id: 2, name: 'Enemy', children: [] },
    ];

    render(React.createElement(HierarchyPanel, { nodes }));
    expect(screen.getByText('Player')).toBeDefined();
    expect(screen.getByText('Enemy')).toBeDefined();
  });

  it('should select entity on click', () => {
    const nodes = [{ id: 1, name: 'Player', children: [] }];
    render(React.createElement(HierarchyPanel, { nodes }));

    const item = screen.getAllByText('Player')[0]!;
    fireEvent.click(item);

    expect(getEditorState().selectedEntityIds).toContain(1);
  });

  it('should multi-select with ctrl click', () => {
    const nodes = [
      { id: 1, name: 'A', children: [] },
      { id: 2, name: 'B', children: [] },
    ];
    render(React.createElement(HierarchyPanel, { nodes }));

    fireEvent.click(screen.getAllByText('A')[0]!);
    fireEvent.click(screen.getAllByText('B')[0]!, { ctrlKey: true });

    expect(getEditorState().selectedEntityIds).toEqual([1, 2]);
  });

  it('should call onCreateEntity', () => {
    let called = false;
    const nodes: { id: number; name: string; children: number[] }[] = [];
    render(
      React.createElement(HierarchyPanel, {
        nodes,
        onCreateEntity: () => {
          called = true;
        },
      })
    );

    const btn = screen.getAllByText('+ Entity')[0]!;
    fireEvent.click(btn);
    expect(called).toBe(true);
  });
});
