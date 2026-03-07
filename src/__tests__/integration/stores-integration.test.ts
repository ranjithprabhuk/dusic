import { describe, it, expect, beforeEach } from 'vitest';
import { useCompositionStore } from '../../store/useCompositionStore';
import { useTransportStore } from '../../store/useTransportStore';
import { useInstrumentStore } from '../../store/useInstrumentStore';
import { useUIStore } from '../../store/useUIStore';

describe('Store integration', () => {
  beforeEach(() => {
    useCompositionStore.getState().resetComposition();
    useTransportStore.getState().stop();
    useInstrumentStore.getState().selectInstrument('piano');
    useInstrumentStore.getState().clearPressedKeys();
  });

  it('full workspace flow: add track, add segment, record mode', () => {
    // Add a track
    useCompositionStore.getState().addTrack('piano');
    const track = useCompositionStore.getState().tracks[0];
    expect(track).toBeDefined();
    expect(track.instrumentId).toBe('piano');

    // Add a segment
    useCompositionStore.getState().addSegment(track.id, {
      id: 'seg-test',
      type: 'notes',
      startBeat: 0,
      durationBeats: 4,
      notes: [{ pitch: 60, startBeat: 0, durationBeats: 1, velocity: 100 }],
    });
    expect(useCompositionStore.getState().tracks[0].segments).toHaveLength(1);

    // Start recording
    useTransportStore.getState().toggleRecord();
    expect(useTransportStore.getState().isRecording).toBe(true);
    expect(useTransportStore.getState().isPlaying).toBe(true);

    // Stop
    useTransportStore.getState().stop();
    expect(useTransportStore.getState().isRecording).toBe(false);
    expect(useTransportStore.getState().isPlaying).toBe(false);
  });

  it('theme toggle persists', () => {
    const initial = useUIStore.getState().theme;
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).not.toBe(initial);
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe(initial);
  });

  it('instrument selection updates store', () => {
    useInstrumentStore.getState().selectInstrument('dholak');
    expect(useInstrumentStore.getState().selectedInstrumentId).toBe('dholak');

    useInstrumentStore.getState().addPressedKey('a');
    expect(useInstrumentStore.getState().pressedKeys.has('a')).toBe(true);
  });

  it('save/load roundtrip with composition store', () => {
    useCompositionStore.getState().setName('Integration Test');
    useCompositionStore.getState().setBpm(160);
    useCompositionStore.getState().addTrack('guitar');

    const { name, bpm, tracks } = useCompositionStore.getState();
    expect(name).toBe('Integration Test');
    expect(bpm).toBe(160);
    expect(tracks).toHaveLength(1);

    // Reset and reload
    useCompositionStore.getState().resetComposition();
    expect(useCompositionStore.getState().tracks).toHaveLength(0);

    useCompositionStore.getState().loadComposition({ name, bpm, tracks });
    expect(useCompositionStore.getState().name).toBe('Integration Test');
    expect(useCompositionStore.getState().tracks).toHaveLength(1);
  });

  it('segment operations: cut then merge', () => {
    useCompositionStore.getState().addTrack();
    const trackId = useCompositionStore.getState().tracks[0].id;

    // Add a long segment
    useCompositionStore.getState().addSegment(trackId, {
      id: 'long-seg',
      type: 'notes',
      startBeat: 0,
      durationBeats: 8,
      notes: [
        { pitch: 60, startBeat: 0, durationBeats: 1, velocity: 100 },
        { pitch: 62, startBeat: 4, durationBeats: 1, velocity: 100 },
      ],
    });

    // Simulate cut at beat 4
    const seg = useCompositionStore.getState().tracks[0].segments[0];
    useCompositionStore.getState().updateSegment(trackId, seg.id, {
      durationBeats: 4,
      notes: seg.notes?.filter((n) => n.startBeat < 4),
    });
    useCompositionStore.getState().addSegment(trackId, {
      id: 'cut-seg',
      type: 'notes',
      startBeat: 4,
      durationBeats: 4,
      notes: [{ pitch: 62, startBeat: 0, durationBeats: 1, velocity: 100 }],
    });

    expect(useCompositionStore.getState().tracks[0].segments).toHaveLength(2);

    // Merge: extend first, remove second
    useCompositionStore.getState().updateSegment(trackId, seg.id, { durationBeats: 8 });
    useCompositionStore.getState().removeSegment(trackId, 'cut-seg');
    expect(useCompositionStore.getState().tracks[0].segments).toHaveLength(1);
    expect(useCompositionStore.getState().tracks[0].segments[0].durationBeats).toBe(8);
  });
});
