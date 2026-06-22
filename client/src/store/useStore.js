import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      isDataLoaded: false,
      transactions: [],
      analysis: null,
      stats: null,

      setData: (data) => set({
        isDataLoaded: true,
        transactions: data.transactions || [],
        analysis: data.analysis || null,
        stats: data.stats || null,
      }),

      resetData: () => set({
        isDataLoaded: false,
        transactions: [],
        analysis: null,
        stats: null,
      }),
    }),
    {
      name: 'ledgerlens-data', // localStorage key
    }
  )
);

export default useStore;