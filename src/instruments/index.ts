import type { InstrumentConfig } from '../types/instrument';
import { piano } from './piano';
import { guitar } from './guitar';
import { synthesizer } from './synthesizer';
import { dholak } from './dholak';
import { tabla } from './tabla';
import { bass } from './bass';
import { flute } from './flute';
import { organ } from './organ';

export const instruments: InstrumentConfig[] = [
  piano,
  guitar,
  synthesizer,
  dholak,
  tabla,
  bass,
  flute,
  organ,
];

export const instrumentMap = new Map<string, InstrumentConfig>(
  instruments.map((i) => [i.id, i])
);

export function getInstrument(id: string): InstrumentConfig | undefined {
  return instrumentMap.get(id);
}

export function getSampleUrls(): string[] {
  return instruments
    .filter((i) => i.type === 'percussion')
    .flatMap((i) => Object.values(i.keyMappings))
    .map((m) => m.sampleUrl)
    .filter((url): url is string => !!url);
}
