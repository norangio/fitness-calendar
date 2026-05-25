import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewMode } from '../types/calendar.ts';
import type { PainCategory } from '../types/bodyLog.ts';

interface AppState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
  selectedActivityId: string | null;
  setSelectedActivityId: (id: string | null) => void;
  bodyTrackerOpen: boolean;
  setBodyTrackerOpen: (open: boolean) => void;
  lastUsedCategories: PainCategory[];
  setLastUsedCategories: (categories: PainCategory[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      viewMode: 'month',
      setViewMode: (viewMode) => set({ viewMode }),
      theme: 'dark',
      toggleTheme: () => set((s) => {
        const newTheme = s.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        return { theme: newTheme };
      }),
      importModalOpen: false,
      setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
      selectedActivityId: null,
      setSelectedActivityId: (selectedActivityId) => set({ selectedActivityId }),
      bodyTrackerOpen: false,
      setBodyTrackerOpen: (bodyTrackerOpen) => set({ bodyTrackerOpen }),
      lastUsedCategories: [],
      setLastUsedCategories: (lastUsedCategories) => set({ lastUsedCategories }),
    }),
    {
      name: 'fitness-calendar-settings',
      partialize: (state) => ({
        viewMode: state.viewMode,
        theme: state.theme,
        lastUsedCategories: state.lastUsedCategories,
      }),
    }
  )
);

// Apply persisted theme to DOM immediately (before React renders)
document.documentElement.classList.toggle('dark', useAppStore.getState().theme === 'dark');
