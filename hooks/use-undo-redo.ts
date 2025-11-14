"use client";

import React from "react";

import { useCallback, useRef, useState } from "react";

export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UndoRedoActions<T> {
  set: (newState: T, skipHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY_SIZE = 50;

export function useUndoRedo<T>(
  initialState: T,
  isEqual?: (a: T, b: T) => boolean
): [T, UndoRedoActions<T>] {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Función para comparar estados (por defecto usa JSON.stringify)
  const areEqual = useCallback(
    (a: T, b: T): boolean => {
      if (isEqual) return isEqual(a, b);
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch {
        return a === b;
      }
    },
    [isEqual]
  );

  // Debounce para evitar crear demasiadas entradas en el historial
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingStateRef = useRef<T | null>(null);

  const set = useCallback(
    (newState: T, skipHistory = false) => {
      // Si skipHistory es true, actualizar sin agregar al historial
      if (skipHistory) {
        setState((prev) => ({
          ...prev,
          present: newState,
        }));
        return;
      }

      // Cancelar timeout anterior si existe
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Guardar el estado pendiente
      pendingStateRef.current = newState;

      // Actualizar inmediatamente la UI
      setState((prev) => ({
        ...prev,
        present: newState,
      }));

      // Debounce para agregar al historial
      debounceTimeoutRef.current = setTimeout(() => {
        const stateToSave = pendingStateRef.current;
        if (!stateToSave) return;

        setState((prev) => {
          // No agregar si el estado es igual al actual
          if (areEqual(prev.present, stateToSave)) {
            return prev;
          }

          const newPast = [...prev.past, prev.present];

          // Limitar el tamaño del historial
          if (newPast.length > MAX_HISTORY_SIZE) {
            newPast.shift();
          }

          return {
            past: newPast,
            present: stateToSave,
            future: [], // Limpiar el futuro cuando se hace una nueva acción
          };
        });

        pendingStateRef.current = null;
      }, 300); // 300ms de debounce
    },
    [areEqual]
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  // Cleanup en unmount
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Effect para cleanup
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return [
    state.present,
    {
      set,
      undo,
      redo,
      canUndo,
      canRedo,
      clear,
    },
  ];
}
