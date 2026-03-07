import { useEffect } from 'react';
import { useTransportStore } from '../store/useTransportStore';
import { useCompositionStore } from '../store/useCompositionStore';
import { audioEngine } from '../engine/AudioEngine';
import { playbackEngine } from '../engine/PlaybackEngine';
import { metronome } from '../engine/Metronome';

/**
 * Handles reactive playback state changes (BPM, loop).
 * Play/pause/stop are handled directly by TransportBar click handlers.
 */
export function usePlayback() {
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const bpm = useCompositionStore((s) => s.bpm);

  // Handle BPM changes while playing
  useEffect(() => {
    if (!isPlaying) return;
    metronome.setBpm(bpm);
    // Restart playback engine at current position for accurate timing
    const transport = useTransportStore.getState();
    playbackEngine.stop();
    playbackEngine.start(transport.playheadPosition);
    audioEngine.startPlayheadAnimation();
  }, [bpm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playbackEngine.stop();
      metronome.stop();
      audioEngine.stopPlayheadUpdate();
    };
  }, []);
}
