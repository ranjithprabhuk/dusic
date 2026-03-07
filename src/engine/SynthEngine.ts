import { audioEngine } from './AudioEngine';

interface PlayNoteOptions {
  frequency: number;
  duration?: number;
  oscillatorType?: OscillatorType;
  velocity?: number;
  destination?: AudioNode;
}

interface ActiveNote {
  oscillator: OscillatorNode;
  gain: GainNode;
}

class SynthEngine {
  private activeNotes = new Map<string, ActiveNote>();

  playNote(key: string, options: PlayNoteOptions): void {
    this.stopNote(key);

    const ctx = audioEngine.getContext();
    const {
      frequency,
      duration,
      oscillatorType = 'sine',
      velocity = 100,
      destination,
    } = options;

    const oscillator = ctx.createOscillator();
    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    const gain = ctx.createGain();
    const vol = (velocity / 127) * 0.5;

    // ADSR envelope
    const attack = 0.01;
    const decay = 0.1;
    const sustain = vol * 0.7;
    const now = ctx.currentTime;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + attack);
    gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    oscillator.connect(gain);
    gain.connect(destination ?? audioEngine.getMasterOutput());

    oscillator.start(now);

    if (duration !== undefined && duration > 0) {
      const releaseTime = 0.1;
      const stopTime = now + duration;
      gain.gain.setValueAtTime(sustain, stopTime);
      gain.gain.linearRampToValueAtTime(0, stopTime + releaseTime);
      oscillator.stop(stopTime + releaseTime);
      oscillator.onended = () => this.activeNotes.delete(key);
    }

    this.activeNotes.set(key, { oscillator, gain });
  }

  stopNote(key: string): void {
    const note = this.activeNotes.get(key);
    if (!note) return;

    const ctx = audioEngine.getContext();
    const release = 0.05;
    const now = ctx.currentTime;

    note.gain.gain.cancelScheduledValues(now);
    note.gain.gain.setValueAtTime(note.gain.gain.value, now);
    note.gain.gain.linearRampToValueAtTime(0, now + release);

    note.oscillator.stop(now + release);
    this.activeNotes.delete(key);
  }

  stopAll(): void {
    for (const key of this.activeNotes.keys()) {
      this.stopNote(key);
    }
  }
}

export const synthEngine = new SynthEngine();
