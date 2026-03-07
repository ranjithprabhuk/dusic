import type { Track } from './composition';

export interface ProjectFile {
  version: string;
  appName: 'dusic';
  composition: {
    name: string;
    bpm: number;
    tracks: Track[];
  };
  createdAt: string;
  exportedAt: string;
}
