import { create } from 'zustand';
import type { Track, Segment, TrackEffects } from '../types/composition';

const DEFAULT_EFFECTS: TrackEffects = {
  reverb: { enabled: false, decay: 1.5, mix: 0.3 },
  delay: { enabled: false, time: 0.3, feedback: 0.4, mix: 0.3 },
  eq: { enabled: false, low: 0, mid: 0, high: 0 },
  envelope: { enabled: false, attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3 },
};

interface CompositionState {
  name: string;
  bpm: number;
  tracks: Track[];
  isDirty: boolean;

  setName: (name: string) => void;
  setBpm: (bpm: number) => void;
  setDirty: (dirty: boolean) => void;

  addTrack: (instrumentId?: string) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;

  addSegment: (trackId: string, segment: Segment) => void;
  updateSegment: (trackId: string, segmentId: string, updates: Partial<Segment>) => void;
  removeSegment: (trackId: string, segmentId: string) => void;
  moveSegment: (fromTrackId: string, toTrackId: string, segmentId: string, newStartBeat: number) => void;

  resetComposition: () => void;
  loadComposition: (state: { name: string; bpm: number; tracks: Track[] }) => void;
}

let trackCounter = 0;

export const useCompositionStore = create<CompositionState>((set) => ({
  name: 'Untitled',
  bpm: 120,
  tracks: [],
  isDirty: false,

  setName: (name) => set({ name, isDirty: true }),
  setBpm: (bpm) => set({ bpm: Math.max(30, Math.min(300, bpm)), isDirty: true }),
  setDirty: (isDirty) => set({ isDirty }),

  addTrack: (instrumentId = 'piano') => {
    trackCounter++;
    const track: Track = {
      id: `track-${Date.now()}-${trackCounter}`,
      name: `Track ${trackCounter}`,
      instrumentId,
      segments: [],
      volume: 0.8,
      isMuted: false,
      isSolo: false,
      effects: { ...DEFAULT_EFFECTS },
    };
    set((state) => ({ tracks: [...state.tracks, track], isDirty: true }));
  },

  removeTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== trackId),
      isDirty: true,
    })),

  updateTrack: (trackId, updates) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)),
      isDirty: true,
    })),

  addSegment: (trackId, segment) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, segments: [...t.segments, segment] } : t
      ),
      isDirty: true,
    })),

  updateSegment: (trackId, segmentId, updates) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              segments: t.segments.map((s) =>
                s.id === segmentId ? { ...s, ...updates } : s
              ),
            }
          : t
      ),
      isDirty: true,
    })),

  removeSegment: (trackId, segmentId) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, segments: t.segments.filter((s) => s.id !== segmentId) }
          : t
      ),
      isDirty: true,
    })),

  moveSegment: (fromTrackId, toTrackId, segmentId, newStartBeat) =>
    set((state) => {
      let segment: Segment | undefined;
      const tracks = state.tracks.map((t) => {
        if (t.id === fromTrackId) {
          segment = t.segments.find((s) => s.id === segmentId);
          return { ...t, segments: t.segments.filter((s) => s.id !== segmentId) };
        }
        return t;
      });
      if (!segment) return state;
      const moved = { ...segment, startBeat: newStartBeat };
      return {
        tracks: tracks.map((t) =>
          t.id === toTrackId ? { ...t, segments: [...t.segments, moved] } : t
        ),
        isDirty: true,
      };
    }),

  resetComposition: () => {
    trackCounter = 0;
    set({ name: 'Untitled', bpm: 120, tracks: [], isDirty: false });
  },

  loadComposition: ({ name, bpm, tracks }) => {
    trackCounter = tracks.length;
    set({ name, bpm, tracks, isDirty: false });
  },
}));
