// src/stores/diaryStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useDiaryStore = create(
  persist(
    (set) => ({
      entries: {},

      addEntry: (date, data) =>
        set((s) => ({ entries: { ...s.entries, [date]: data } })),

      updateEntry: (date, data) =>
        set((s) => ({ entries: { ...s.entries, [date]: data } })),

      deleteEntry: (date) =>
        set((s) => {
          const next = { ...s.entries };
          delete next[date];
          return { entries: next };
        }),
    }),
    {
      name: "diary-storage",
    }
  )
);

export default useDiaryStore;
