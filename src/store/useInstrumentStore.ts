import { create } from 'zustand';
import type { InstrumentConfig } from '../types/instrument';

interface InstrumentState {
  selectedInstrumentId: string;
  instruments: InstrumentConfig[];
  pressedKeys: Set<string>;

  selectInstrument: (id: string) => void;
  setInstruments: (instruments: InstrumentConfig[]) => void;
  addPressedKey: (key: string) => void;
  removePressedKey: (key: string) => void;
  clearPressedKeys: () => void;
}

export const useInstrumentStore = create<InstrumentState>((set) => ({
  selectedInstrumentId: 'piano',
  instruments: [],
  pressedKeys: new Set<string>(),

  selectInstrument: (selectedInstrumentId) => set({ selectedInstrumentId }),
  setInstruments: (instruments) => set({ instruments }),
  addPressedKey: (key) =>
    set((state) => {
      const next = new Set(state.pressedKeys);
      next.add(key);
      return { pressedKeys: next };
    }),
  removePressedKey: (key) =>
    set((state) => {
      const next = new Set(state.pressedKeys);
      next.delete(key);
      return { pressedKeys: next };
    }),
  clearPressedKeys: () => set({ pressedKeys: new Set<string>() }),
}));
