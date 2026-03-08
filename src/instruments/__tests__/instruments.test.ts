import { describe, it, expect } from 'vitest';
import { instruments, getInstrument, getSampleUrls } from '../index';

describe('instruments', () => {
  it('has 8 instruments registered', () => {
    expect(instruments).toHaveLength(8);
  });

  it('each instrument has 12+ key mappings', () => {
    for (const inst of instruments) {
      const count = Object.keys(inst.keyMappings).length;
      expect(count, `${inst.name} should have 12+ mappings but has ${count}`).toBeGreaterThanOrEqual(12);
    }
  });

  it('each mapping has a label and pitch', () => {
    for (const inst of instruments) {
      for (const [key, mapping] of Object.entries(inst.keyMappings)) {
        expect(mapping.label, `${inst.name}[${key}] missing label`).toBeTruthy();
        expect(mapping.pitch, `${inst.name}[${key}] missing pitch`).toBeDefined();
      }
    }
  });

  it('tonal instruments have frequency', () => {
    for (const inst of instruments.filter((i) => i.type === 'tonal')) {
      for (const [key, mapping] of Object.entries(inst.keyMappings)) {
        expect(mapping.frequency, `${inst.name}[${key}] missing frequency`).toBeGreaterThan(0);
      }
    }
  });

  it('percussion instruments have sampleUrl', () => {
    for (const inst of instruments.filter((i) => i.type === 'percussion')) {
      for (const [key, mapping] of Object.entries(inst.keyMappings)) {
        expect(mapping.sampleUrl, `${inst.name}[${key}] missing sampleUrl`).toBeTruthy();
      }
    }
  });

  it('getInstrument returns correct instrument', () => {
    expect(getInstrument('piano')?.name).toBe('Piano');
    expect(getInstrument('nonexistent')).toBeUndefined();
  });

  it('getSampleUrls returns percussion URLs', () => {
    const urls = getSampleUrls();
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.every((u) => u.endsWith('.wav'))).toBe(true);
  });
});
