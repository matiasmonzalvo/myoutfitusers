"use client";

import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo procesar si Ctrl (o Cmd en Mac) está presionado
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (!isCtrlOrCmd) return;

      // Verificar que no estemos en un input, textarea, o elemento editable
      const target = event.target as HTMLElement;
      const isEditable =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        target.closest('[contenteditable="true"]') !== null;

      // Si estamos en un elemento editable, solo procesar si no hay texto seleccionado
      // o si el elemento está vacío
      if (isEditable) {
        const selection = window.getSelection();
        const hasSelection = selection && selection.toString().length > 0;

        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          const inputElement = target as HTMLInputElement | HTMLTextAreaElement;
          const hasInputSelection =
            inputElement.selectionStart !== inputElement.selectionEnd;
          const isEmpty = inputElement.value.length === 0;

          // Solo permitir undo/redo si no hay selección de texto y el campo está vacío
          if (hasInputSelection || !isEmpty) {
            return;
          }
        } else if (hasSelection) {
          return;
        }
      }

      switch (event.key.toLowerCase()) {
        case "z":
          if (event.shiftKey) {
            // Ctrl+Shift+Z = Redo
            if (canRedo) {
              event.preventDefault();
              event.stopPropagation();
              onRedo();
            }
          } else {
            // Ctrl+Z = Undo
            if (canUndo) {
              event.preventDefault();
              event.stopPropagation();
              onUndo();
            }
          }
          break;
        case "y":
          // Ctrl+Y = Redo (alternativo)
          if (canRedo) {
            event.preventDefault();
            event.stopPropagation();
            onRedo();
          }
          break;
      }
    };

    // Usar capture para interceptar antes que otros handlers
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [onUndo, onRedo, canUndo, canRedo]);
}
