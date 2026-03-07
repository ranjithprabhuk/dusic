import { describe, it, expect } from 'vitest';
import { projectFileService } from '../ProjectFileService';

describe('ProjectFileService', () => {
  const sampleComposition = {
    name: 'Test Song',
    bpm: 140,
    tracks: [
      {
        id: 't1',
        name: 'Track 1',
        instrumentId: 'piano',
        segments: [],
        volume: 0.8,
        isMuted: false,
        isSolo: false,
        effects: {
          reverb: { enabled: false, decay: 1.5, mix: 0.3 },
          delay: { enabled: false, time: 0.3, feedback: 0.4, mix: 0.3 },
          eq: { enabled: false, low: 0, mid: 0, high: 0 },
          envelope: { enabled: false, attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3 },
        },
      },
    ],
  };

  it('exports valid JSON', () => {
    const json = projectFileService.exportProject(sampleComposition);
    const parsed = JSON.parse(json);
    expect(parsed.appName).toBe('dusic');
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.composition.name).toBe('Test Song');
    expect(parsed.composition.bpm).toBe(140);
    expect(parsed.composition.tracks).toHaveLength(1);
  });

  it('import roundtrips correctly', () => {
    const json = projectFileService.exportProject(sampleComposition);
    const project = projectFileService.importProject(json);
    expect(project.composition.name).toBe('Test Song');
    expect(project.composition.bpm).toBe(140);
    expect(project.composition.tracks).toHaveLength(1);
  });

  it('rejects invalid JSON', () => {
    expect(() => projectFileService.importProject('not json')).toThrow('Invalid JSON');
  });

  it('rejects non-dusic files', () => {
    expect(() => projectFileService.importProject('{"appName":"other"}')).toThrow('Not a valid Dusic');
  });

  it('rejects files without composition', () => {
    expect(() => projectFileService.importProject('{"appName":"dusic"}')).toThrow('missing composition');
  });
});
