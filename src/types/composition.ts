export interface Track {
  id: string;
  name: string;
  instrumentId: string;
  segments: Segment[];
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
  effects: TrackEffects;
}

export interface Segment {
  id: string;
  type: 'notes' | 'audio';
  startBeat: number;
  durationBeats: number;
  notes?: NoteEvent[];
  audioBuffer?: string;
  waveformData?: number[];
}

export interface NoteEvent {
  pitch: number;
  startBeat: number;
  durationBeats: number;
  velocity: number;
}

export interface TrackEffects {
  reverb: { enabled: boolean; decay: number; mix: number };
  delay: { enabled: boolean; time: number; feedback: number; mix: number };
  eq: { enabled: boolean; low: number; mid: number; high: number };
  envelope: {
    enabled: boolean;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}
