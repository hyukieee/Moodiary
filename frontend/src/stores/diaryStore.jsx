// frontend/src/stores/diaryStore.jsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useDiaryStore = create(
  persist(
    (set) => ({
      entries: {},

      addEntry: (date, data) =>
        set((state) => ({
          entries: { ...state.entries, [date]: data },
        })),

      updateEntry: (date, data) =>
        set((state) => ({
          entries: { ...state.entries, [date]: data },
        })),

      removeEntry: (date) =>
        set((state) => {
          const e = { ...state.entries };
          delete e[date];
          return { entries: e };
        }),

      clearAll: () => set({ entries: {} }),
    }),
    { name: "diary-storage" }
  )
);

export default useDiaryStore;
