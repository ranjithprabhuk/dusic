import { audioEngine } from './AudioEngine';
import { sampleEngine } from './SampleEngine';
import { getInstrument } from '../instruments';
import { useCompositionStore } from '../store/useCompositionStore';
import { useTransportStore } from '../store/useTransportStore';
import type { NoteEvent } from '../types/composition';
import type { InstrumentConfig, NoteMapping } from '../types/instrument';

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function beatsToSeconds(beats: number, bpm: number): number {
  return (beats / bpm) * 60;
}

function secondsToBeats(seconds: number, bpm: number): number {
  return (seconds / 60) * bpm;
}

class PlaybackEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private playbackStartTime = 0;
  private playbackStartBeat = 0;
  private lastScheduledBeat = 0;
  private activeNodes: { node: AudioScheduledSourceNode; stopTime: number }[] = [];
  private lookAheadSeconds = 0.15;

  /** Build a pitch -> NoteMapping lookup for an instrument */
  private getPitchMap(instrument: InstrumentConfig): Map<number, NoteMapping> {
    const map = new Map<number, NoteMapping>();
    for (const mapping of Object.values(instrument.keyMappings)) {
      if (mapping.pitch !== undefined) {
        map.set(mapping.pitch, mapping);
      }
    }
    return map;
  }

  start(startBeat: number): void {
    this.stop();
    const ctx = audioEngine.getContext();
    this.playbackStartTime = ctx.currentTime;
    this.playbackStartBeat = startBeat;
    // Start scheduling slightly before startBeat to catch notes right at the start
    this.lastScheduledBeat = startBeat - 0.001;

    this.scheduleAhead();
    this.intervalId = setInterval(() => this.scheduleAhead(), 25);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Stop all active nodes immediately
    const ctx = audioEngine.getContext();
    const now = ctx.currentTime;
    for (const entry of this.activeNodes) {
      try {
        entry.node.stop(now);
      } catch {
        // Already stopped
      }
    }
    this.activeNodes = [];
  }

  /** Called when the playhead loops back to loopStart */
  resetForLoop(loopStartBeat: number): void {
    const ctx = audioEngine.getContext();
    this.playbackStartTime = ctx.currentTime;
    this.playbackStartBeat = loopStartBeat;
    this.lastScheduledBeat = loopStartBeat;
  }

  private scheduleAhead(): void {
    const ctx = audioEngine.getContext();
    const { bpm, tracks } = useCompositionStore.getState();
    const transport = useTransportStore.getState();

    if (!transport.isPlaying) return;

    const elapsed = ctx.currentTime - this.playbackStartTime;
    const currentBeat = this.playbackStartBeat + secondsToBeats(elapsed, bpm);
    const lookAheadBeats = secondsToBeats(this.lookAheadSeconds, bpm);
    const lookAheadBeat = currentBeat + lookAheadBeats;

    // Check for solo tracks
    const hasSolo = tracks.some((t) => t.isSolo);

    for (const track of tracks) {
      if (track.isMuted) continue;
      if (hasSolo && !track.isSolo) continue;

      const instrument = getInstrument(track.instrumentId);
      if (!instrument) continue;

      const pitchMap = this.getPitchMap(instrument);

      for (const seg of track.segments) {
        if (seg.type !== 'notes' || !seg.notes) continue;

        for (const note of seg.notes) {
          const absoluteBeat = seg.startBeat + note.startBeat;

          if (absoluteBeat >= this.lastScheduledBeat && absoluteBeat < lookAheadBeat) {
            const noteTimeOffset = beatsToSeconds(absoluteBeat - this.playbackStartBeat, bpm);
            const noteTime = this.playbackStartTime + noteTimeOffset;

            // Schedule note — clamp start time to now if slightly in the past
            const clampedTime = Math.max(noteTime, ctx.currentTime);
            this.scheduleNote(ctx, note, clampedTime, bpm, instrument, pitchMap, track.volume);
          }
        }
      }
    }

    this.lastScheduledBeat = lookAheadBeat;

    // Clean up expired nodes
    this.activeNodes = this.activeNodes.filter((e) => e.stopTime > ctx.currentTime);
  }

  private scheduleNote(
    ctx: AudioContext,
    note: NoteEvent,
    startTime: number,
    bpm: number,
    instrument: InstrumentConfig,
    pitchMap: Map<number, NoteMapping>,
    trackVolume: number,
  ): void {
    const duration = beatsToSeconds(note.durationBeats, bpm);
    const velocity = (note.velocity / 127) * 0.5 * trackVolume;

    if (instrument.type === 'tonal') {
      const mapping = pitchMap.get(note.pitch);
      const freq = mapping?.frequency ?? midiToFrequency(note.pitch);
      const oscType = mapping?.oscillatorType ?? 'sine';

      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      osc.type = oscType;

      const gain = ctx.createGain();
      const attack = 0.01;
      const decay = 0.05;
      const sustain = velocity * 0.7;
      const release = 0.05;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(velocity, startTime + attack);
      gain.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
      gain.gain.setValueAtTime(sustain, startTime + duration);
      gain.gain.linearRampToValueAtTime(0, startTime + duration + release);

      osc.connect(gain);
      gain.connect(audioEngine.getMasterOutput());

      const stopTime = startTime + duration + release;
      osc.start(startTime);
      osc.stop(stopTime);

      this.activeNodes.push({ node: osc, stopTime });
    } else {
      // Percussion — find the sample for this pitch
      const mapping = pitchMap.get(note.pitch);
      if (mapping?.sampleUrl) {
        const buffer = sampleEngine.getBuffer(mapping.sampleUrl);
        if (!buffer) return;

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.value = velocity * 1.6; // Percussion is quieter, boost a bit

        source.connect(gain);
        gain.connect(audioEngine.getMasterOutput());

        source.start(startTime);
        const stopTime = startTime + buffer.duration;

        this.activeNodes.push({ node: source, stopTime });
      }
    }
  }
}

export const playbackEngine = new PlaybackEngine();
