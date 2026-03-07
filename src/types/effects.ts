export type EffectType = 'reverb' | 'delay' | 'eq' | 'envelope';

export interface ReverbParams {
  enabled: boolean;
  decay: number;
  mix: number;
}

export interface DelayParams {
  enabled: boolean;
  time: number;
  feedback: number;
  mix: number;
}

export interface EQParams {
  enabled: boolean;
  low: number;
  mid: number;
  high: number;
}

export interface EnvelopeParams {
  enabled: boolean;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}
