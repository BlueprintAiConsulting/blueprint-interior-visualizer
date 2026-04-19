import { useState, useCallback, useRef } from 'react';

export function useHistory<T>(initialState: T) {
  const [state, setStateInternal] = useState<T>(initialState);
  const historyRef = useRef<T[]>([initialState]);
  const indexRef = useRef(0);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setStateInternal((prev) => typeof newState === 'function' ? (newState as (prev: T) => T)(prev) : newState);
  }, []);

  const saveState = useCallback(() => {
    setStateInternal((current) => {
      historyRef.current = [...historyRef.current.slice(0, indexRef.current + 1), current];
      indexRef.current = historyRef.current.length - 1;
      return current;
    });
  }, []);

  const undo = useCallback(() => {
    if (indexRef.current > 0) { indexRef.current -= 1; setStateInternal(historyRef.current[indexRef.current]); }
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) { indexRef.current += 1; setStateInternal(historyRef.current[indexRef.current]); }
  }, []);

  return { state, setState, undo, redo, saveState, canUndo: indexRef.current > 0, canRedo: indexRef.current < historyRef.current.length - 1 };
}