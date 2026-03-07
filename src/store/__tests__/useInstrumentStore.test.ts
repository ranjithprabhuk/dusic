import { describe, it, expect, beforeEach } from 'vitest';
import { useInstrumentStore } from '../useInstrumentStore';

describe('useInstrumentStore', () => {
  beforeEach(() => {
    useInstrumentStore.getState().clearPressedKeys();
    useInstrumentStore.getState().selectInstrument('piano');
  });

  it('has piano as default instrument', () => {
    expect(useInstrumentStore.getState().selectedInstrumentId).toBe('piano');
  });

  it('selects instrument', () => {
    useInstrumentStore.getState().selectInstrument('guitar');
    expect(useInstrumentStore.getState().selectedInstrumentId).toBe('guitar');
  });

  it('manages pressed keys', () => {
    useInstrumentStore.getState().addPressedKey('a');
    useInstrumentStore.getState().addPressedKey('s');
    expect(useInstrumentStore.getState().pressedKeys.size).toBe(2);

    useInstrumentStore.getState().removePressedKey('a');
    expect(useInstrumentStore.getState().pressedKeys.has('a')).toBe(false);
    expect(useInstrumentStore.getState().pressedKeys.has('s')).toBe(true);

    useInstrumentStore.getState().clearPressedKeys();
    expect(useInstrumentStore.getState().pressedKeys.size).toBe(0);
  });
});
