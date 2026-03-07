import type { InstrumentConfig } from '../types/instrument';

const BASE = '/dusic/samples/dholak/';

export const dholak: InstrumentConfig = {
  id: 'dholak',
  name: 'Dholak',
  type: 'percussion',
  icon: 'dholak',
  keyMappings: {
    a: { key: 'a', label: 'Dha', pitch: 36, sampleUrl: `${BASE}dha.wav` },
    s: { key: 's', label: 'Dhin', pitch: 37, sampleUrl: `${BASE}dhin.wav` },
    d: { key: 'd', label: 'Ta', pitch: 38, sampleUrl: `${BASE}ta.wav` },
    f: { key: 'f', label: 'Tin', pitch: 39, sampleUrl: `${BASE}tin.wav` },
    g: { key: 'g', label: 'Ge', pitch: 40, sampleUrl: `${BASE}ge.wav` },
    h: { key: 'h', label: 'Ke', pitch: 41, sampleUrl: `${BASE}ke.wav` },
    j: { key: 'j', label: 'Na', pitch: 42, sampleUrl: `${BASE}na.wav` },
    k: { key: 'k', label: 'Tun', pitch: 43, sampleUrl: `${BASE}tun.wav` },
    l: { key: 'l', label: 'Kat', pitch: 44, sampleUrl: `${BASE}kat.wav` },
    q: { key: 'q', label: 'Dhi', pitch: 45, sampleUrl: `${BASE}dhi.wav` },
    w: { key: 'w', label: 'Tit', pitch: 46, sampleUrl: `${BASE}tit.wav` },
    e: { key: 'e', label: 'Ghe', pitch: 47, sampleUrl: `${BASE}ghe.wav` },
  },
};
