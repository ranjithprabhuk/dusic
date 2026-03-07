import { audioEngine } from './AudioEngine';

class Metronome {
  private nextBeatTime = 0;
  private currentBeat = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private beatsPerMeasure = 4;

  start(bpm: number): void {
    this.stop();
    const ctx = audioEngine.getContext();
    this.nextBeatTime = ctx.currentTime;
    this.currentBeat = 0;
    this.scheduleBeats(bpm);

    this.timerId = setInterval(() => this.scheduleBeats(bpm), 25);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  setBpm(bpm: number): void {
    if (this.timerId !== null) {
      this.stop();
      this.start(bpm);
    }
  }

  private scheduleBeats(bpm: number): void {
    const ctx = audioEngine.getContext();
    const secondsPerBeat = 60 / bpm;
    const scheduleAhead = 0.1; // schedule 100ms ahead

    while (this.nextBeatTime < ctx.currentTime + scheduleAhead) {
      const isDownbeat = this.currentBeat % this.beatsPerMeasure === 0;
      this.playClick(this.nextBeatTime, isDownbeat);
      this.nextBeatTime += secondsPerBeat;
      this.currentBeat++;
    }
  }

  private playClick(time: number, accent: boolean): void {
    const ctx = audioEngine.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = accent ? 1000 : 800;
    osc.type = 'sine';

    gain.gain.setValueAtTime(accent ? 0.3 : 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(audioEngine.getMasterOutput());

    osc.start(time);
    osc.stop(time + 0.05);
  }
}

export const metronome = new Metronome();
