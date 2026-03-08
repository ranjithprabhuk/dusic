import { audioEngine } from '../engine/AudioEngine';
import { audioExportService } from './AudioExportService';
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

    return this.createSegmentFromBuffer(audioBuffer, bpm, 0);
  }

  /** Create a Segment from an AudioBuffer (used by mic recording and file import) */
  async createSegmentFromBuffer(audioBuffer: AudioBuffer, bpm: number, startBeat: number): Promise<Segment> {
    const waveformData = this.extractWaveform(audioBuffer, 200);
    const durationSeconds = audioBuffer.duration;
    const durationBeats = (durationSeconds / 60) * bpm;

    // Convert AudioBuffer to WAV blob then to base64
    const wavBlob = audioExportService.exportWav(audioBuffer);
    const arrayBuf = await wavBlob.arrayBuffer();
    const audioBase64 = this.arrayBufferToBase64(arrayBuf);

    return {
      id: `seg-${Date.now()}`,
      type: 'audio',
      startBeat,
      durationBeats,
      audioBuffer: audioBase64,
      waveformData,
    };
  }

  /** Decode a base64 WAV string back to AudioBuffer */
  async decodeBase64Audio(base64: string): Promise<AudioBuffer> {
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const ctx = audioEngine.getContext();
    return ctx.decodeAudioData(bytes.buffer);
  }

  private isSupported(file: File): boolean {
    if (file.type && SUPPORTED_TYPES.has(file.type)) return true;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    return SUPPORTED_EXTENSIONS.has(ext);
  }

  extractWaveform(buffer: AudioBuffer, numSamples: number): number[] {
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

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export const audioImportService = new AudioImportService();
