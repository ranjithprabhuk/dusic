export interface InstrumentConfig {
  id: string;
  name: string;
  type: 'tonal' | 'percussion';
  keyMappings: Record<string, NoteMapping>;
  icon: string;
}

export interface NoteMapping {
  key: string;
  label: string;
  pitch?: number;
  frequency?: number;
  sampleUrl?: string;
  oscillatorType?: OscillatorType;
}
