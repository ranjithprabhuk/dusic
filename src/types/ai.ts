export interface AIConfig {
  provider: 'openai' | 'claude' | 'gemini' | 'custom';
  apiKey: string;
  endpoint?: string;
  model?: string;
}

export type AIInputMethod = 'text' | 'selectors' | 'trackSeed' | 'midiPattern';

export interface AIGenerateParams {
  method: AIInputMethod;
  textPrompt?: string;
  genre?: string;
  mood?: string;
  instrument?: string;
  tempo?: number;
  seedTrackId?: string;
  seedSegmentId?: string;
  midiPattern?: number[];
}
