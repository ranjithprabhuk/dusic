import { describe, it, expect, beforeEach } from 'vitest';
import { pushUndoSnapshot, undo, redo, canUndo, canRedo, clearHistory } from '../useUndoRedo';
import { useCompositionStore } from '../../store/useCompositionStore';

describe('useUndoRedo', () => {
  beforeEach(() => {
    clearHistory();
    useCompositionStore.getState().resetComposition();
  });

  it('undo restores previous state', () => {
    useCompositionStore.getState().setName('Original');
    pushUndoSnapshot();
    useCompositionStore.getState().setName('Changed');

    expect(useCompositionStore.getState().name).toBe('Changed');
    undo();
    expect(useCompositionStore.getState().name).toBe('Original');
  });

  it('redo restores undone state', () => {
    useCompositionStore.getState().setName('Original');
    pushUndoSnapshot();
    useCompositionStore.getState().setName('Changed');
    undo();
    redo();
    expect(useCompositionStore.getState().name).toBe('Changed');
  });

  it('canUndo and canRedo report correctly', () => {
    expect(canUndo()).toBe(false);
    pushUndoSnapshot();
    useCompositionStore.getState().setName('X');
    expect(canUndo()).toBe(true);
    expect(canRedo()).toBe(false);
    undo();
    expect(canRedo()).toBe(true);
  });

  it('caps history at 50 entries', () => {
    for (let i = 0; i < 60; i++) {
      pushUndoSnapshot();
      useCompositionStore.getState().setName(`Name ${i}`);
    }
    // Should still be undoable but capped
    let undoCount = 0;
    while (canUndo()) {
      undo();
      undoCount++;
    }
    expect(undoCount).toBeLessThanOrEqual(50);
  });

  it('clearHistory resets stacks', () => {
    pushUndoSnapshot();
    useCompositionStore.getState().setName('X');
    clearHistory();
    expect(canUndo()).toBe(false);
    expect(canRedo()).toBe(false);
  });
});
