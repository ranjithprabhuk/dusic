import type { InstrumentConfig } from '../types/instrument';

export const guitar: InstrumentConfig = {
  id: 'guitar',
  name: 'Guitar',
  type: 'tonal',
  icon: 'guitar',
  keyMappings: {
    a: { key: 'a', label: 'E2', pitch: 40, frequency: 82.41, oscillatorType: 'sawtooth' },
    s: { key: 's', label: 'A2', pitch: 45, frequency: 110.0, oscillatorType: 'sawtooth' },
    d: { key: 'd', label: 'D3', pitch: 50, frequency: 146.83, oscillatorType: 'sawtooth' },
    f: { key: 'f', label: 'G3', pitch: 55, frequency: 196.0, oscillatorType: 'sawtooth' },
    g: { key: 'g', label: 'B3', pitch: 59, frequency: 246.94, oscillatorType: 'sawtooth' },
    h: { key: 'h', label: 'E4', pitch: 64, frequency: 329.63, oscillatorType: 'sawtooth' },
    j: { key: 'j', label: 'A3', pitch: 57, frequency: 220.0, oscillatorType: 'sawtooth' },
    k: { key: 'k', label: 'C4', pitch: 60, frequency: 261.63, oscillatorType: 'sawtooth' },
    l: { key: 'l', label: 'D4', pitch: 62, frequency: 293.66, oscillatorType: 'sawtooth' },
    ';': { key: ';', label: 'F4', pitch: 65, frequency: 349.23, oscillatorType: 'sawtooth' },
    q: { key: 'q', label: 'G4', pitch: 67, frequency: 392.0, oscillatorType: 'sawtooth' },
    w: { key: 'w', label: 'A4', pitch: 69, frequency: 440.0, oscillatorType: 'sawtooth' },
    e: { key: 'e', label: 'B4', pitch: 71, frequency: 493.88, oscillatorType: 'sawtooth' },
    r: { key: 'r', label: 'C5', pitch: 72, frequency: 523.25, oscillatorType: 'sawtooth' },
    t: { key: 't', label: 'D5', pitch: 74, frequency: 587.33, oscillatorType: 'sawtooth' },
    y: { key: 'y', label: 'E5', pitch: 76, frequency: 659.25, oscillatorType: 'sawtooth' },
  },
};
