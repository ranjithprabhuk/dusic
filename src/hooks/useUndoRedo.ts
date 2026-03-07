import { useEffect, useRef, useCallback } from 'react';
import { useCompositionStore } from '../store/useCompositionStore';
import type { Track } from '../types/composition';

const MAX_HISTORY = 50;

interface Snapshot {
  name: string;
  bpm: number;
  tracks: Track[];
}

function takeSnapshot(): Snapshot {
  const { name, bpm, tracks } = useCompositionStore.getState();
  return { name, bpm, tracks: JSON.parse(JSON.stringify(tracks)) };
}

function applySnapshot(snapshot: Snapshot) {
  useCompositionStore.getState().loadComposition(snapshot);
}

let undoStack: Snapshot[] = [];
let redoStack: Snapshot[] = [];

export function pushUndoSnapshot() {
  undoStack.push(takeSnapshot());
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }
  redoStack = [];
}

export function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(takeSnapshot());
  const snapshot = undoStack.pop()!;
  applySnapshot(snapshot);
}

export function redo() {
  if (redoStack.length === 0) return;
  undoStack.push(takeSnapshot());
  const snapshot = redoStack.pop()!;
  applySnapshot(snapshot);
}

export function canUndo() {
  return undoStack.length > 0;
}

export function canRedo() {
  return redoStack.length > 0;
}

export function clearHistory() {
  undoStack = [];
  redoStack = [];
}

const FOCUS_IGNORE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function useUndoRedo() {
  const undoCount = useRef(undoStack.length);
  const redoCount = useRef(redoStack.length);

  const handleUndo = useCallback(() => {
    undo();
    undoCount.current = undoStack.length;
    redoCount.current = redoStack.length;
  }, []);

  const handleRedo = useCallback(() => {
    redo();
    undoCount.current = undoStack.length;
    redoCount.current = redoStack.length;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && FOCUS_IGNORE_TAGS.has(el.tagName)) return;
      if (el?.getAttribute('contenteditable') === 'true') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return { undo: handleUndo, redo: handleRedo, canUndo, canRedo };
}
