import { audioEngine } from './AudioEngine';

export type MicState = 'idle' | 'requesting' | 'ready' | 'recording' | 'error';

class MicEngine {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private _state: MicState = 'idle';
  private _errorMessage = '';

  getState(): MicState {
    return this._state;
  }

  getErrorMessage(): string {
    return this._errorMessage;
  }

  async requestPermission(): Promise<boolean> {
    if (this.stream) {
      this._state = 'ready';
      return true;
    }

    this._state = 'requesting';
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this._state = 'ready';
      return true;
    } catch (err) {
      this._state = 'error';
      this._errorMessage =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone access in your browser settings.'
          : 'Could not access microphone. Please check your device.';
      return false;
    }
  }

  startRecording(): boolean {
    if (!this.stream || this._state === 'recording') return false;

    this.chunks = [];
    try {
      this.recorder = new MediaRecorder(this.stream);
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };
      this.recorder.start(100); // collect chunks every 100ms
      this._state = 'recording';
      return true;
    } catch {
      this._state = 'error';
      this._errorMessage = 'Failed to start recording.';
      return false;
    }
  }

  async stopRecording(): Promise<AudioBuffer | null> {
    if (!this.recorder || this._state !== 'recording') return null;

    return new Promise<AudioBuffer | null>((resolve) => {
      this.recorder!.onstop = async () => {
        this._state = 'ready';
        if (this.chunks.length === 0) {
          resolve(null);
          return;
        }

        try {
          const blob = new Blob(this.chunks, { type: this.recorder!.mimeType });
          const arrayBuffer = await blob.arrayBuffer();
          const ctx = audioEngine.getContext();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          resolve(audioBuffer);
        } catch {
          resolve(null);
        }
      };
      this.recorder!.stop();
    });
  }

  dispose(): void {
    if (this.recorder && this._state === 'recording') {
      this.recorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.recorder = null;
    this.chunks = [];
    this._state = 'idle';
  }
}

export const micEngine = new MicEngine();
