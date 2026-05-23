import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AssetBrowserPanel } from '../AssetBrowserPanel.js';
import { useProjectStore } from '@pwe/editor-shell';

describe('AssetBrowserPanel', () => {
  beforeEach(() => {
    useProjectStore.setState({
      projectName: 'Test',
      scenes: [],
      activeSceneId: null,
      assets: [],
    });
  });

  it('should render empty when no assets', () => {
    render(React.createElement(AssetBrowserPanel, {}));
    expect(screen.getAllByPlaceholderText('Filter assets...').length).toBeGreaterThan(0);
  });

  it('should filter assets by name', () => {
    useProjectStore.setState({
      assets: [
        { id: 'a1', name: 'hero.png', type: 'texture', path: '/hero.png' },
        { id: 'a2', name: 'bg.png', type: 'texture', path: '/bg.png' },
      ],
    });

    render(React.createElement(AssetBrowserPanel, {}));
    const inputs = screen.getAllByPlaceholderText('Filter assets...');
    expect(inputs.length).toBeGreaterThan(0);
    fireEvent.change(inputs[0]!, { target: { value: 'hero' } });

    expect(screen.queryByText('hero.png')).toBeDefined();
    expect(screen.queryByText('bg.png')).toBeNull();
  });

  it('should call onDragAsset', () => {
    useProjectStore.setState({
      assets: [
        { id: 'a1', name: 'hero.png', type: 'texture', path: '/hero.png' },
      ],
    });

    let draggedId = '';
    render(
      React.createElement(AssetBrowserPanel, {
        onDragAsset: (id) => {
          draggedId = id;
        },
      })
    );

    const assetEls = screen.getAllByText('hero.png');
    expect(assetEls.length).toBeGreaterThan(0);
    // The text is inside a span; fire dragStart on the parent draggable div
    const draggable = assetEls[0]!.closest('[draggable]') as HTMLElement;
    expect(draggable).toBeDefined();
    fireEvent.dragStart(draggable);
    expect(draggedId).toBe('a1');
  });
});
