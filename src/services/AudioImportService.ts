import { audioEngine } from '../engine/AudioEngine';
import type { Segment } from '../types/composition';

const SUPPORTED_TYPES = new Set([
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac',
  'audio/x-wav', 'audio/x-flac', 'audio/mp3',
]);

const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac']);

class AudioImportService {
  async importFile(file: File, bpm: number): Promise<Segment> {
    if (!this.isSupported(file)) {
      throw new Error(`Unsupported audio format: ${file.type || file.name}. Supported: MP3, WAV, OGG, FLAC.`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const ctx = audioEngine.getContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const waveformData = this.extractWaveform(audioBuffer, 200);
    const durationSeconds = audioBuffer.duration;
    const durationBeats = (durationSeconds / 60) * bpm;

    return {
      id: `seg-${Date.now()}`,
      type: 'audio',
      startBeat: 0,
      durationBeats,
      waveformData,
    };
  }

  private isSupported(file: File): boolean {
    if (file.type && SUPPORTED_TYPES.has(file.type)) return true;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    return SUPPORTED_EXTENSIONS.has(ext);
  }

  private extractWaveform(buffer: AudioBuffer, numSamples: number): number[] {
    const data = buffer.getChannelData(0);
    const step = Math.floor(data.length / numSamples);
    const waveform: number[] = [];
    for (let i = 0; i < numSamples; i++) {
      const start = i * step;
      let max = 0;
      for (let j = start; j < start + step && j < data.length; j++) {
        const abs = Math.abs(data[j]);
        if (abs > max) max = abs;
      }
      waveform.push(max);
    }
    return waveform;
  }
}

export const audioImportService = new AudioImportService();
