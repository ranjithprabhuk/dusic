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
  const loopEnabled = useTransportStore((s) => s.loopEnabled);
  const loopStart = useTransportStore((s) => s.loopStart);
  const loopEnd = useTransportStore((s) => s.loopEnd);
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

  // Handle loop reset — when playhead passes loopEnd, reset scheduling window
  useEffect(() => {
    if (!isPlaying || !loopEnabled) return;

    const checkLoop = () => {
      const transport = useTransportStore.getState();
      if (transport.loopEnabled && loopEnd > loopStart && transport.playheadPosition >= loopEnd) {
        playbackEngine.resetForLoop(loopStart);
      }
    };

    const id = setInterval(checkLoop, 50);
    return () => clearInterval(id);
  }, [isPlaying, loopEnabled, loopStart, loopEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playbackEngine.stop();
      metronome.stop();
      audioEngine.stopPlayheadUpdate();
    };
  }, []);
}
