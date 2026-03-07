import { getInstrument } from '../instruments';
import type { Track, NoteEvent, TrackEffects } from '../types/composition';

interface RenderOptions {
  tracks: Track[];
  bpm: number;
  sampleRate?: number;
  onProgress?: (fraction: number) => void;
}

function beatsToSeconds(beats: number, bpm: number): number {
  return (beats / bpm) * 60;
}

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function computeDuration(tracks: Track[]): number {
  let maxBeat = 0;
  for (const track of tracks) {
    for (const seg of track.segments) {
      const end = seg.startBeat + seg.durationBeats;
      if (end > maxBeat) maxBeat = end;
    }
  }
  return maxBeat;
}

function applyEffectsToNode(
  ctx: OfflineAudioContext,
  source: AudioNode,
  effects: TrackEffects,
  output: AudioNode
): void {
  let current: AudioNode = source;

  // EQ
  if (effects.eq.enabled) {
    const low = ctx.createBiquadFilter();
    low.type = 'lowshelf';
    low.frequency.value = 320;
    low.gain.value = effects.eq.low;
    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.Q.value = 0.5;
    mid.gain.value = effects.eq.mid;
    const high = ctx.createBiquadFilter();
    high.type = 'highshelf';
    high.frequency.value = 3200;
    high.gain.value = effects.eq.high;
    current.connect(low);
    low.connect(mid);
    mid.connect(high);
    current = high;
  }

  // Delay
  if (effects.delay.enabled) {
    const dry = ctx.createGain();
    dry.gain.value = 1 - effects.delay.mix;
    const wet = ctx.createGain();
    wet.gain.value = effects.delay.mix;
    const delay = ctx.createDelay(2.0);
    delay.delayTime.value = effects.delay.time;
    const feedback = ctx.createGain();
    feedback.gain.value = effects.delay.feedback;

    const merge = ctx.createGain();
    current.connect(dry);
    current.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    dry.connect(merge);
    wet.connect(merge);
    current = merge;
  }

  current.connect(output);
}

export async function renderOffline(options: RenderOptions): Promise<AudioBuffer> {
  const { tracks, bpm, sampleRate = 44100, onProgress } = options;

  const totalBeats = computeDuration(tracks);
  if (totalBeats === 0) {
    // Return 1 second of silence
    const ctx = new OfflineAudioContext(2, sampleRate, sampleRate);
    return ctx.startRendering();
  }

  const totalSeconds = beatsToSeconds(totalBeats, bpm) + 2; // +2s for reverb tail
  const totalFrames = Math.ceil(totalSeconds * sampleRate);
  const ctx = new OfflineAudioContext(2, totalFrames, sampleRate);

  let scheduledTracks = 0;
  const totalTracks = tracks.filter((t) => !t.isMuted).length;

  for (const track of tracks) {
    if (track.isMuted) continue;

    const instrument = getInstrument(track.instrumentId);
    if (!instrument) continue;

    const trackGain = ctx.createGain();
    trackGain.gain.value = track.volume;

    // Apply effects chain
    applyEffectsToNode(ctx, trackGain, track.effects, ctx.destination);

    for (const seg of track.segments) {
      if (seg.type !== 'notes' || !seg.notes) continue;

      for (const note of seg.notes) {
        scheduleNote(ctx, note, seg.startBeat, bpm, instrument.type, trackGain);
      }
    }

    scheduledTracks++;
    onProgress?.(scheduledTracks / (totalTracks + 1));
  }

  onProgress?.(totalTracks / (totalTracks + 1));
  const buffer = await ctx.startRendering();
  onProgress?.(1);

  return buffer;
}

function scheduleNote(
  ctx: OfflineAudioContext,
  note: NoteEvent,
  segStartBeat: number,
  bpm: number,
  instrumentType: 'tonal' | 'percussion',
  destination: AudioNode
): void {
  const startTime = beatsToSeconds(segStartBeat + note.startBeat, bpm);
  const duration = beatsToSeconds(note.durationBeats, bpm);
  const velocity = (note.velocity / 127) * 0.5;

  if (instrumentType === 'tonal') {
    const freq = midiToFrequency(note.pitch);
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    osc.type = 'sine';

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
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + release);
  } else {
    // For percussion, render a short noise burst at the given pitch
    const bufferLength = Math.ceil(ctx.sampleRate * Math.min(duration, 0.5));
    const buffer = ctx.createBuffer(1, bufferLength, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferLength; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = velocity;

    source.connect(gain);
    gain.connect(destination);
    source.start(startTime);
  }
}
