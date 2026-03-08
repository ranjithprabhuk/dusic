export type TutorialLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: TutorialLevel;
  instrumentId: string;
  tempo: number; // BPM for the practice
  sequence: string[]; // keyboard keys in order
  passThreshold: number; // 0-1, e.g. 0.7 = 70%
}

export interface Curriculum {
  instrumentId: string;
  lessons: Lesson[];
}

export interface LessonProgress {
  lessonId: string;
  bestScore: number; // 0-100
  stars: number; // 0-3
  completed: boolean;
}

export interface ScoreResult {
  correct: number;
  total: number;
  accuracy: number; // 0-100
  avgTimingMs: number;
  stars: number; // 0-3
}

export const LEVEL_ORDER: TutorialLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export const LEVEL_LABELS: Record<TutorialLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export const LEVEL_COLORS: Record<TutorialLevel, string> = {
  beginner: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  intermediate: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  advanced: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
  expert: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
};
