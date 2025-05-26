// src/stores/diaryStore.js
import create from "zustand";
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
          // 원본을 건드리지 않고 복사본으로 삭제
          const next = { ...s.entries };
          delete next[date];
          return { entries: next };
        }),
    }),
    {
      name: "diary-storage", // localStorage key
    }
  )
);

export default useDiaryStore;
