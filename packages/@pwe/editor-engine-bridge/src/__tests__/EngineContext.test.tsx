import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { EngineProvider, useEngine } from '../EngineContext.js';
import { useEditorStore } from '@pwe/editor-shell';

function TestComponent() {
  const { engine } = useEngine();
  return React.createElement('div', null, `mode:${engine.mode}`);
}

describe('EngineProvider', () => {
  beforeEach(() => {
    useEditorStore.setState({
      mode: 'edit',
      selectedEntityIds: [],
      layout: { left: 20, right: 20, top: 40, bottom: 20 },
      isPlaying: false,
    });
  });

  it('should provide engine instance', () => {
    render(
      React.createElement(EngineProvider, null,
        React.createElement(TestComponent, null)
      )
    );
    expect(screen.getByText('mode:edit')).toBeDefined();
  });

  it('should sync play state from store to engine', () => {
    let engineRef: { engine: { mode: string } } | null = null;

    function CaptureEngine() {
      const ctx = useEngine();
      engineRef = ctx;
      return React.createElement('div', null, `mode:${ctx.engine.mode}`);
    }

    render(
      React.createElement(EngineProvider, null,
        React.createElement(CaptureEngine, null)
      )
    );

    expect(engineRef).not.toBeNull();
    expect(engineRef!.engine.mode).toBe('edit');

    useEditorStore.getState().play();
    expect(engineRef!.engine.mode).toBe('play');
  });
});
