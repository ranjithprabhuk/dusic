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
  private scheduledAudioSegments = new Set<string>();
  private decodedAudioBuffers = new Map<string, AudioBuffer>();

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
    this.scheduledAudioSegments.clear();

    this.prepareAudioSegments();
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
    this.scheduledAudioSegments.clear();
  }

  /** Called when the playhead loops back to loopStart */
  resetForLoop(loopStartBeat: number): void {
    const ctx = audioEngine.getContext();
    this.playbackStartTime = ctx.currentTime;
    this.playbackStartBeat = loopStartBeat;
    this.lastScheduledBeat = loopStartBeat;
    this.scheduledAudioSegments.clear();
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
        // Handle audio segments
        if (seg.type === 'audio' && seg.audioBuffer) {
          this.scheduleAudioSegment(ctx, seg.id, seg.audioBuffer, seg.startBeat, seg.durationBeats, bpm, track.volume, currentBeat);
          continue;
        }

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
  /** Pre-decode audio segments so they're ready for scheduling */
  private prepareAudioSegments(): void {
    const { tracks } = useCompositionStore.getState();
    for (const track of tracks) {
      for (const seg of track.segments) {
        if (seg.type === 'audio' && seg.audioBuffer && !this.decodedAudioBuffers.has(seg.id)) {
          // Decode in background — will be available by the time we need it
          const binaryStr = atob(seg.audioBuffer);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const ctx = audioEngine.getContext();
          ctx.decodeAudioData(bytes.buffer.slice(0)).then((decoded) => {
            this.decodedAudioBuffers.set(seg.id, decoded);
          }).catch(() => {
            // Ignore decode failures
          });
        }
      }
    }
  }

  /** Schedule an audio segment for playback */
  private scheduleAudioSegment(
    ctx: AudioContext,
    segId: string,
    _audioBase64: string,
    startBeat: number,
    durationBeats: number,
    bpm: number,
    trackVolume: number,
    currentBeat: number,
  ): void {
    if (this.scheduledAudioSegments.has(segId)) return;

    const segEndBeat = startBeat + durationBeats;
    if (segEndBeat <= currentBeat) return; // Already past

    const decoded = this.decodedAudioBuffers.get(segId);
    if (!decoded) return; // Not yet decoded

    this.scheduledAudioSegments.add(segId);

    const source = ctx.createBufferSource();
    source.buffer = decoded;

    const gain = ctx.createGain();
    gain.gain.value = trackVolume;

    source.connect(gain);
    gain.connect(audioEngine.getMasterOutput());

    const segStartTime = this.playbackStartTime + beatsToSeconds(startBeat - this.playbackStartBeat, bpm);

    if (segStartTime >= ctx.currentTime) {
      // Segment starts in the future
      source.start(segStartTime);
    } else {
      // Segment already started — play from offset
      const offsetSeconds = ctx.currentTime - segStartTime;
      if (offsetSeconds < decoded.duration) {
        source.start(0, offsetSeconds);
      } else {
        return; // Segment already finished
      }
    }

    const stopTime = segStartTime + decoded.duration;
    this.activeNodes.push({ node: source, stopTime });
  }
}

export const playbackEngine = new PlaybackEngine();
