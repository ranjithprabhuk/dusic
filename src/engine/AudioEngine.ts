import { useTransportStore } from '../store/useTransportStore';
import { useCompositionStore } from '../store/useCompositionStore';

class AudioEngine {
  private context: AudioContext | null = null;
  private playbackStartTime = 0;
  private playbackStartPosition = 0;
  private animFrameId: number | null = null;

  getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  async ensureResumed(): Promise<void> {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  isContextSuspended(): boolean {
    return (this.context?.state ?? 'suspended') === 'suspended';
  }

  getMasterOutput(): AudioNode {
    return this.getContext().destination;
  }

  getCurrentTime(): number {
    return this.getContext().currentTime;
  }

  beatsToSeconds(beats: number, bpm: number): number {
    return (beats / bpm) * 60;
  }

  secondsToBeats(seconds: number, bpm: number): number {
    return (seconds / 60) * bpm;
  }

  startPlayback(): void {
    const transport = useTransportStore.getState();
    const ctx = this.getContext();

    this.playbackStartTime = ctx.currentTime;
    this.playbackStartPosition = transport.playheadPosition;

    transport.play();
    this.startPlayheadUpdate();
  }

  stopPlayback(): void {
    const transport = useTransportStore.getState();
    transport.stop();
    this.stopPlayheadUpdate();
  }

  pausePlayback(): void {
    const transport = useTransportStore.getState();
    transport.pause();
    this.stopPlayheadUpdate();
  }

  /** Start only the playhead animation (called by usePlayback hook) */
  startPlayheadAnimation(): void {
    const transport = useTransportStore.getState();
    const ctx = this.getContext();
    this.playbackStartTime = ctx.currentTime;
    this.playbackStartPosition = transport.playheadPosition;
    this.startPlayheadUpdate();
  }

  stopPlayheadUpdate(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private computeEndBeat(): number {
    const { tracks } = useCompositionStore.getState();
    let maxBeat = 0;
    for (const track of tracks) {
      for (const seg of track.segments) {
        const end = seg.startBeat + seg.durationBeats;
        if (end > maxBeat) maxBeat = end;
      }
    }
    return maxBeat;
  }

  private startPlayheadUpdate(): void {
    this.stopPlayheadUpdate();

    const update = () => {
      const transport = useTransportStore.getState();
      if (!transport.isPlaying) return;

      const ctx = this.getContext();
      const elapsed = ctx.currentTime - this.playbackStartTime;
      const bpm = useCompositionStore.getState().bpm;
      const currentBeat = this.playbackStartPosition + this.secondsToBeats(elapsed, bpm);

      if (transport.loopEnabled && currentBeat >= transport.loopEnd && transport.loopEnd > transport.loopStart) {
        this.playbackStartPosition = transport.loopStart;
        this.playbackStartTime = ctx.currentTime;
        transport.setPlayheadPosition(transport.loopStart);
      } else {
        // Auto-stop at end of composition (skip while recording)
        const endBeat = this.computeEndBeat();
        if (!transport.isRecording && endBeat > 0 && currentBeat >= endBeat) {
          transport.setPlayheadPosition(endBeat);
          transport.stop();
          this.stopPlayheadUpdate();
          this.onAutoStop?.();
          return;
        }
        transport.setPlayheadPosition(currentBeat);
      }

      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  /** Callback invoked when playback auto-stops at end of composition */
  onAutoStop: (() => void) | null = null;

  dispose(): void {
    this.stopPlayheadUpdate();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}

export const audioEngine = new AudioEngine();
