import { describe, it, expect } from 'vitest';
import { storageService } from '../StorageService';

describe('StorageService', () => {
  it('saves and loads a composition', async () => {
    const comp = { name: 'Test', bpm: 120, tracks: [] };
    const id = await storageService.save(comp);
    expect(id).toBeTruthy();

    const loaded = await storageService.load(id);
    expect(loaded).toBeDefined();
    expect(loaded!.name).toBe('Test');
    expect(loaded!.bpm).toBe(120);
  });

  it('lists all compositions', async () => {
    await storageService.save({ name: 'Song A', bpm: 100, tracks: [] });
    await storageService.save({ name: 'Song B', bpm: 140, tracks: [] });
    const all = await storageService.listAll();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it('deletes a composition', async () => {
    const id = await storageService.save({ name: 'To Delete', bpm: 120, tracks: [] });
    await storageService.delete(id);
    const loaded = await storageService.load(id);
    expect(loaded).toBeUndefined();
  });
});
