import { describe, it, expect, beforeEach } from 'vitest';
import { useTransportStore } from '../useTransportStore';

describe('useTransportStore', () => {
  beforeEach(() => {
    useTransportStore.getState().stop();
  });

  it('has correct initial state', () => {
    const state = useTransportStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.isRecording).toBe(false);
    expect(state.playheadPosition).toBe(0);
    expect(state.gridSnap).toBe(true);
  });

  it('play/pause/stop cycle', () => {
    useTransportStore.getState().play();
    expect(useTransportStore.getState().isPlaying).toBe(true);

    useTransportStore.getState().pause();
    expect(useTransportStore.getState().isPlaying).toBe(false);

    useTransportStore.getState().seek(10);
    useTransportStore.getState().stop();
    expect(useTransportStore.getState().playheadPosition).toBe(0);
  });

  it('toggleRecord starts playback', () => {
    useTransportStore.getState().toggleRecord();
    const state = useTransportStore.getState();
    expect(state.isRecording).toBe(true);
    expect(state.isPlaying).toBe(true);
  });

  it('seek clamps to non-negative', () => {
    useTransportStore.getState().seek(-5);
    expect(useTransportStore.getState().playheadPosition).toBe(0);
  });

  it('toggles gridSnap, loop, metronome', () => {
    useTransportStore.getState().setGridSnap(false);
    expect(useTransportStore.getState().gridSnap).toBe(false);

    useTransportStore.getState().setLoopEnabled(true);
    expect(useTransportStore.getState().loopEnabled).toBe(true);

    useTransportStore.getState().setMetronomeEnabled(true);
    expect(useTransportStore.getState().metronomeEnabled).toBe(true);
  });
});
