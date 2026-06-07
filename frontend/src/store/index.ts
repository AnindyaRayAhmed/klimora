import { create } from 'zustand';

interface AppState {
  selectedLocalityId: string | null;
  setSelectedLocalityId: (id: string | null) => void;
  activeClimateLayer: 'overall' | 'aqi' | 'ndvi' | 'heat' | 'rainfall';
  setActiveClimateLayer: (layer: 'overall' | 'aqi' | 'ndvi' | 'heat' | 'rainfall') => void;
  ritActiveConversationId: string | null;
  setRitActiveConversationId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedLocalityId: null,
  setSelectedLocalityId: (id) => set({ selectedLocalityId: id }),
  activeClimateLayer: 'overall',
  setActiveClimateLayer: (layer) => set({ activeClimateLayer: layer }),
  ritActiveConversationId: null,
  setRitActiveConversationId: (id) => set({ ritActiveConversationId: id }),
}));
