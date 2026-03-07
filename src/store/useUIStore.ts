import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface UIState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('dusic-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
};

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dusic-theme', next);
      return { theme: next };
    }),
  setTheme: (theme) => {
    localStorage.setItem('dusic-theme', theme);
    set({ theme });
  },
}));
