import { create } from 'zustand';

interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  playheadPosition: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  metronomeEnabled: boolean;
  gridSnap: boolean;

  play: () => void;
  pause: () => void;
  stop: () => void;
  toggleRecord: () => void;
  seek: (position: number) => void;
  setLoopEnabled: (enabled: boolean) => void;
  setLoopRegion: (start: number, end: number) => void;
  setMetronomeEnabled: (enabled: boolean) => void;
  setGridSnap: (enabled: boolean) => void;
  setPlayheadPosition: (position: number) => void;
}

export const useTransportStore = create<TransportState>((set) => ({
  isPlaying: false,
  isRecording: false,
  playheadPosition: 0,
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 0,
  metronomeEnabled: false,
  gridSnap: true,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ isPlaying: false, isRecording: false, playheadPosition: 0 }),
  toggleRecord: () =>
    set((state) => ({
      isRecording: !state.isRecording,
      isPlaying: !state.isRecording ? true : state.isPlaying,
    })),
  seek: (position) => set({ playheadPosition: Math.max(0, position) }),
  setLoopEnabled: (loopEnabled) => set({ loopEnabled }),
  setLoopRegion: (loopStart, loopEnd) => set({ loopStart, loopEnd }),
  setMetronomeEnabled: (metronomeEnabled) => set({ metronomeEnabled }),
  setGridSnap: (gridSnap) => set({ gridSnap }),
  setPlayheadPosition: (playheadPosition) => set({ playheadPosition }),
}));
