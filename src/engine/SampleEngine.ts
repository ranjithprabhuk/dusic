import { audioEngine } from './AudioEngine';

class SampleEngine {
  private bufferCache = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer | null>>();
  private failedSamples = new Set<string>();

  async loadSample(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }

    if (this.failedSamples.has(url)) {
      return null;
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    const promise = this.fetchAndDecode(url);
    this.loadingPromises.set(url, promise);

    const buffer = await promise;
    this.loadingPromises.delete(url);

    if (buffer) {
      this.bufferCache.set(url, buffer);
    } else {
      this.failedSamples.add(url);
      console.warn(`Failed to load sample: ${url}`);
    }

    return buffer;
  }

  private async fetchAndDecode(url: string): Promise<AudioBuffer | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return await audioEngine.getContext().decodeAudioData(arrayBuffer);
    } catch {
      return null;
    }
  }

  async preloadSamples(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.loadSample(url)));
  }

  playSample(
    url: string,
    options?: { velocity?: number; destination?: AudioNode }
  ): void {
    const buffer = this.bufferCache.get(url);
    if (!buffer) return;

    const ctx = audioEngine.getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    const velocity = options?.velocity ?? 100;
    gain.gain.value = (velocity / 127) * 0.8;

    source.connect(gain);
    gain.connect(options?.destination ?? audioEngine.getMasterOutput());

    source.start(ctx.currentTime);
  }

  getBuffer(url: string): AudioBuffer | undefined {
    return this.bufferCache.get(url);
  }

  isSampleLoaded(url: string): boolean {
    return this.bufferCache.has(url);
  }

  isSampleFailed(url: string): boolean {
    return this.failedSamples.has(url);
  }

  clearCache(): void {
    this.bufferCache.clear();
    this.failedSamples.clear();
  }
}

export const sampleEngine = new SampleEngine();
