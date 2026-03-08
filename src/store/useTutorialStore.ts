import { create } from 'zustand';
import type { LessonProgress } from '../types/tutorial';

interface TutorialState {
  progress: Record<string, LessonProgress>; // keyed by lessonId
  setLessonProgress: (lessonId: string, score: number, stars: number) => void;
  isLessonUnlocked: (lessonId: string, prevLessonId: string | null) => boolean;
  reset: () => void;
}

const STORAGE_KEY = 'dusic-tutorial-progress';

const loadProgress = (): Record<string, LessonProgress> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveProgress = (progress: Record<string, LessonProgress>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const useTutorialStore = create<TutorialState>((set, get) => ({
  progress: loadProgress(),

  setLessonProgress: (lessonId, score, stars) => {
    const current = get().progress[lessonId];
    // Only update if new score is better
    const bestScore = Math.max(score, current?.bestScore ?? 0);
    const bestStars = Math.max(stars, current?.stars ?? 0);
    const completed = bestStars >= 1;

    const updated = {
      ...get().progress,
      [lessonId]: { lessonId, bestScore, stars: bestStars, completed },
    };
    saveProgress(updated);
    set({ progress: updated });
  },

  isLessonUnlocked: (_lessonId, prevLessonId) => {
    if (!prevLessonId) return true; // first lesson is always unlocked
    const prev = get().progress[prevLessonId];
    return prev?.completed ?? false;
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ progress: {} });
  },
}));
