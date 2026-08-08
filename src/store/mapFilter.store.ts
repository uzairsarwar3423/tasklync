import { create } from 'zustand';

interface MapFilterState {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  resetFilter: () => void;
}

export const useMapFilterStore = create<MapFilterState>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  resetFilter: () => set({ selectedCategory: null }),
}));
