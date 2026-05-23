import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { Engine } from '@pwe/engine-core';
import { useEditorStore } from '@pwe/editor-shell';
import { CommandHistory } from './CommandHistory.js';

export interface EngineContextValue {
  engine: Engine;
  history: CommandHistory;
}

const EngineContext = createContext<EngineContextValue | null>(null);

export interface EngineProviderProps {
  engine?: Engine;
  children: React.ReactNode;
}

export const EngineProvider: React.FC<EngineProviderProps> = ({
  engine: externalEngine,
  children,
}) => {
  const engineRef = useRef<Engine | null>(null);
  const historyRef = useRef<CommandHistory | null>(null);
  const [ready, setReady] = useState(false);

  if (!engineRef.current) {
    engineRef.current = externalEngine ?? new Engine();
  }
  if (!historyRef.current) {
    historyRef.current = new CommandHistory();
  }

  const engine = engineRef.current;
  const history = historyRef.current;

  useEffect(() => {
    const unsubPlay = useEditorStore.subscribe((state) => {
      if (state.isPlaying && engine.mode !== 'play') {
        engine.play();
      } else if (!state.isPlaying && engine.mode === 'play') {
        engine.stop();
      }
    });

    const handleEnginePlay = () => {
      useEditorStore.getState().play();
    };
    const handleEngineStop = () => {
      useEditorStore.getState().stop();
    };

    const unsubSignalPlay = engine.signalBus.subscribe('engine:play', handleEnginePlay);
    const unsubSignalStop = engine.signalBus.subscribe('engine:stop', handleEngineStop);

    setReady(true);

    return () => {
      unsubPlay();
      unsubSignalPlay();
      unsubSignalStop();
    };
  }, [engine]);

  if (!ready) {
    return null;
  }

  return (
    <EngineContext.Provider value={{ engine, history }}>
      {children}
    </EngineContext.Provider>
  );
};

export function useEngine(): EngineContextValue {
  const ctx = useContext(EngineContext);
  if (!ctx) {
    throw new Error('useEngine must be used within an EngineProvider');
  }
  return ctx;
}
