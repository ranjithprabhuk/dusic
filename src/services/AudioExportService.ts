import { Mp3Encoder } from 'lamejs';

class AudioExportService {
  exportWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = 2;
    const dataSize = length * numChannels * bytesPerSample;
    const headerSize = 44;
    const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, 16, true); // bits per sample
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Interleave channels and convert to 16-bit PCM
    const channels: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(buffer.getChannelData(c));
    }

    let offset = headerSize;
    for (let i = 0; i < length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const sample = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  exportMp3(buffer: AudioBuffer, kbps = 128): Blob {
    const sampleRate = buffer.sampleRate;
    const numChannels = Math.min(buffer.numberOfChannels, 2);
    const encoder = new Mp3Encoder(numChannels, sampleRate, kbps);

    const left = this.floatTo16Bit(buffer.getChannelData(0));
    const right = numChannels > 1
      ? this.floatTo16Bit(buffer.getChannelData(1))
      : left;

    const blockSize = 1152;
    const mp3Chunks: ArrayBuffer[] = [];

    for (let i = 0; i < left.length; i += blockSize) {
      const leftChunk = left.subarray(i, i + blockSize);
      const rightChunk = right.subarray(i, i + blockSize);
      const chunk = encoder.encodeBuffer(leftChunk, rightChunk);
      if (chunk.length > 0) {
        mp3Chunks.push(chunk.buffer as ArrayBuffer);
      }
    }

    const flush = encoder.flush();
    if (flush.length > 0) {
      mp3Chunks.push(flush.buffer as ArrayBuffer);
    }

    return new Blob(mp3Chunks, { type: 'audio/mpeg' });
  }

  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  private floatTo16Bit(float32: Float32Array): Int16Array {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  }
}

export const audioExportService = new AudioExportService();
