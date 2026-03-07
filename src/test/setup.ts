import 'fake-indexeddb/auto';

// Mock AudioContext for non-browser environments
class MockAudioContext {
  state = 'running' as AudioContextState;
  sampleRate = 44100;
  currentTime = 0;
  destination = {} as AudioDestinationNode;

  createGain() {
    return {
      gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => this.createGain(),
      disconnect: () => {},
    };
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440, setValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
      disconnect: () => {},
      addEventListener: () => {},
    };
  }

  createDelay() {
    return {
      delayTime: { value: 0 },
      connect: () => this.createGain(),
      disconnect: () => {},
    };
  }

  createBiquadFilter() {
    return {
      type: 'lowshelf',
      frequency: { value: 320 },
      Q: { value: 0.5 },
      gain: { value: 0 },
      connect: () => this.createGain(),
      disconnect: () => {},
    };
  }

  createConvolver() {
    return {
      buffer: null,
      connect: () => this.createGain(),
      disconnect: () => {},
    };
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    const data = new Float32Array(length);
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: () => data,
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: () => {},
      start: () => {},
      stop: () => {},
      disconnect: () => {},
    };
  }

  async decodeAudioData() {
    return this.createBuffer(2, 44100, 44100);
  }

  async resume() {
    this.state = 'running' as AudioContextState;
  }

  async close() {
    this.state = 'closed' as AudioContextState;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).AudioContext = MockAudioContext;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).OfflineAudioContext = MockAudioContext;
