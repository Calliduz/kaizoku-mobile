import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { Anime, Episode, HistoryItem } from '@/types';

// ─── MMKV Storage Adapter for Zustand ────────────────────────────────────────
const storage = new MMKV({ id: 'kaizoku-store' });

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => storage.delete(name),
};

const MAX_HISTORY = 20;

// ─── Store Interface ──────────────────────────────────────────────────────────
interface HistoryStore {
  items: HistoryItem[];
  /** True once the persisted state has been hydrated from MMKV */
  _hydrated: boolean;
  setHydrated: () => void;
  addToHistory: (
    anime: Anime,
    episode: Episode,
    progressMs?: number,
    progressPercentage?: number,
  ) => void;
  updateProgress: (
    animeId: string,
    progressMs: number,
    progressPercentage: number,
  ) => void;
  removeFromHistory: (animeId: string) => void;
  clearHistory: () => void;
}

// ─── Zustand Store with Persist Middleware ────────────────────────────────────
export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      items: [],
      _hydrated: false,

      setHydrated: () => set({ _hydrated: true }),

      addToHistory: (anime, episode, progressMs = 0, progressPercentage = 0) => {
        set((state) => {
          // Remove existing entry for this anime to re-insert at top
          const filtered = state.items.filter(
            (item) => item.anime._id !== anime._id,
          );

          const newItem: HistoryItem = {
            anime,
            episode,
            watchedAt: Date.now(),
            progressMs,
            progressPercentage,
          };

          const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
          return { items: updated };
        });
      },

      updateProgress: (animeId, progressMs, progressPercentage) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.anime._id === animeId
              ? { ...item, progressMs, progressPercentage }
              : item,
          ),
        }));
      },

      removeFromHistory: (animeId) => {
        set((state) => ({
          items: state.items.filter((item) => item.anime._id !== animeId),
        }));
      },

      clearHistory: () => set({ items: [] }),
    }),
    {
      name: 'kaizoku-history',
      storage: createJSONStorage(() => mmkvStorage),
      // Only persist the items array — not the hydration flag
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
