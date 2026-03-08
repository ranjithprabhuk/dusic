import type { Curriculum } from '../../types/tutorial';
import { pianoLessons } from './piano';
import { guitarLessons } from './guitar';
import { synthesizerLessons } from './synthesizer';
import { tablaLessons } from './tabla';
import { dholakLessons } from './dholak';

export const curricula: Record<string, Curriculum> = {
  piano: { instrumentId: 'piano', lessons: pianoLessons },
  guitar: { instrumentId: 'guitar', lessons: guitarLessons },
  synthesizer: { instrumentId: 'synthesizer', lessons: synthesizerLessons },
  tabla: { instrumentId: 'tabla', lessons: tablaLessons },
  dholak: { instrumentId: 'dholak', lessons: dholakLessons },
};

export function getCurriculum(instrumentId: string): Curriculum | undefined {
  return curricula[instrumentId];
}
