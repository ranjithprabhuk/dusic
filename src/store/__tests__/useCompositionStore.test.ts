import { describe, it, expect, beforeEach } from 'vitest';
import { useCompositionStore } from '../useCompositionStore';

describe('useCompositionStore', () => {
  beforeEach(() => {
    useCompositionStore.getState().resetComposition();
  });

  it('has correct initial state', () => {
    const state = useCompositionStore.getState();
    expect(state.name).toBe('Untitled');
    expect(state.bpm).toBe(120);
    expect(state.tracks).toHaveLength(0);
    expect(state.isDirty).toBe(false);
  });

  it('sets name and marks dirty', () => {
    useCompositionStore.getState().setName('My Song');
    const state = useCompositionStore.getState();
    expect(state.name).toBe('My Song');
    expect(state.isDirty).toBe(true);
  });

  it('clamps BPM to 30-300', () => {
    useCompositionStore.getState().setBpm(10);
    expect(useCompositionStore.getState().bpm).toBe(30);
    useCompositionStore.getState().setBpm(500);
    expect(useCompositionStore.getState().bpm).toBe(300);
  });

  it('adds and removes tracks', () => {
    useCompositionStore.getState().addTrack('piano');
    expect(useCompositionStore.getState().tracks).toHaveLength(1);
    expect(useCompositionStore.getState().tracks[0].instrumentId).toBe('piano');

    const trackId = useCompositionStore.getState().tracks[0].id;
    useCompositionStore.getState().removeTrack(trackId);
    expect(useCompositionStore.getState().tracks).toHaveLength(0);
  });

  it('updates track properties', () => {
    useCompositionStore.getState().addTrack();
    const trackId = useCompositionStore.getState().tracks[0].id;
    useCompositionStore.getState().updateTrack(trackId, { volume: 0.5, isMuted: true });
    const track = useCompositionStore.getState().tracks[0];
    expect(track.volume).toBe(0.5);
    expect(track.isMuted).toBe(true);
  });

  it('adds, updates, and removes segments', () => {
    useCompositionStore.getState().addTrack();
    const trackId = useCompositionStore.getState().tracks[0].id;

    useCompositionStore.getState().addSegment(trackId, {
      id: 'seg-1',
      type: 'notes',
      startBeat: 0,
      durationBeats: 4,
      notes: [],
    });
    expect(useCompositionStore.getState().tracks[0].segments).toHaveLength(1);

    useCompositionStore.getState().updateSegment(trackId, 'seg-1', { durationBeats: 8 });
    expect(useCompositionStore.getState().tracks[0].segments[0].durationBeats).toBe(8);

    useCompositionStore.getState().removeSegment(trackId, 'seg-1');
    expect(useCompositionStore.getState().tracks[0].segments).toHaveLength(0);
  });

  it('moves segment between tracks', () => {
    const store = useCompositionStore.getState();
    store.addTrack('piano');
    store.addTrack('guitar');
    const tracks = useCompositionStore.getState().tracks;
    const t1 = tracks[0].id;
    const t2 = tracks[1].id;

    store.addSegment(t1, { id: 'seg-m', type: 'notes', startBeat: 0, durationBeats: 4 });
    store.moveSegment(t1, t2, 'seg-m', 8);

    const updated = useCompositionStore.getState().tracks;
    expect(updated.find((t) => t.id === t1)!.segments).toHaveLength(0);
    expect(updated.find((t) => t.id === t2)!.segments).toHaveLength(1);
    expect(updated.find((t) => t.id === t2)!.segments[0].startBeat).toBe(8);
  });

  it('loadComposition restores state', () => {
    useCompositionStore.getState().loadComposition({
      name: 'Loaded',
      bpm: 140,
      tracks: [],
    });
    const state = useCompositionStore.getState();
    expect(state.name).toBe('Loaded');
    expect(state.bpm).toBe(140);
    expect(state.isDirty).toBe(false);
  });
});
