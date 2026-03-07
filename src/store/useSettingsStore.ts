import { create } from 'zustand';
import type { AIConfig } from '../types/ai';

interface SettingsState {
  aiConfig: AIConfig | null;
  setAIConfig: (config: AIConfig | null) => void;
}

const loadAIConfig = (): AIConfig | null => {
  try {
    const stored = localStorage.getItem('dusic-ai-config');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useSettingsStore = create<SettingsState>((set) => ({
  aiConfig: loadAIConfig(),
  setAIConfig: (aiConfig) => {
    if (aiConfig) {
      localStorage.setItem('dusic-ai-config', JSON.stringify(aiConfig));
    } else {
      localStorage.removeItem('dusic-ai-config');
    }
    set({ aiConfig });
  },
}));
