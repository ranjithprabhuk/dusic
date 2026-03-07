import { synthEngine } from './SynthEngine';
import { sampleEngine } from './SampleEngine';
import { getInstrument, getSampleUrls } from '../instruments';
import type { NoteMapping } from '../types/instrument';

class InstrumentEngine {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    const urls = getSampleUrls();
    await sampleEngine.preloadSamples(urls);
    this.initialized = true;
  }

  playNote(instrumentId: string, key: string, destination?: AudioNode): NoteMapping | null {
    const instrument = getInstrument(instrumentId);
    if (!instrument) return null;

    const mapping = instrument.keyMappings[key];
    if (!mapping) return null;

    if (instrument.type === 'tonal' && mapping.frequency) {
      synthEngine.playNote(key, {
        frequency: mapping.frequency,
        oscillatorType: mapping.oscillatorType ?? 'sine',
        velocity: 100,
        destination,
      });
    } else if (instrument.type === 'percussion' && mapping.sampleUrl) {
      sampleEngine.playSample(mapping.sampleUrl, { velocity: 100, destination });
    }

    return mapping;
  }

  stopNote(instrumentId: string, key: string): void {
    const instrument = getInstrument(instrumentId);
    if (!instrument) return;

    if (instrument.type === 'tonal') {
      synthEngine.stopNote(key);
    }
    // Percussion samples play through — no stop needed
  }

  stopAll(): void {
    synthEngine.stopAll();
  }

  getMapping(instrumentId: string, key: string): NoteMapping | undefined {
    return getInstrument(instrumentId)?.keyMappings[key];
  }
}

export const instrumentEngine = new InstrumentEngine();
