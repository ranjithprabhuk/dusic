import type { InstrumentConfig } from '../types/instrument';

const BASE = '/dusic/samples/tabla/';

export const tabla: InstrumentConfig = {
  id: 'tabla',
  name: 'Tabla',
  type: 'percussion',
  icon: 'tabla',
  keyMappings: {
    a: { key: 'a', label: 'Na', pitch: 36, sampleUrl: `${BASE}na.wav` },
    s: { key: 's', label: 'Tin', pitch: 37, sampleUrl: `${BASE}tin.wav` },
    d: { key: 'd', label: 'Tu', pitch: 38, sampleUrl: `${BASE}tu.wav` },
    f: { key: 'f', label: 'Ta', pitch: 39, sampleUrl: `${BASE}ta.wav` },
    g: { key: 'g', label: 'Dha', pitch: 40, sampleUrl: `${BASE}dha.wav` },
    h: { key: 'h', label: 'Dhin', pitch: 41, sampleUrl: `${BASE}dhin.wav` },
    j: { key: 'j', label: 'Ge', pitch: 42, sampleUrl: `${BASE}ge.wav` },
    k: { key: 'k', label: 'Ke', pitch: 43, sampleUrl: `${BASE}ke.wav` },
    l: { key: 'l', label: 'Tit', pitch: 44, sampleUrl: `${BASE}tit.wav` },
    q: { key: 'q', label: 'Ri', pitch: 45, sampleUrl: `${BASE}ri.wav` },
    w: { key: 'w', label: 'Te', pitch: 46, sampleUrl: `${BASE}te.wav` },
    e: { key: 'e', label: 'Kat', pitch: 47, sampleUrl: `${BASE}kat.wav` },
  },
};
