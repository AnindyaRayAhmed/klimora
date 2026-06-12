import { create } from 'zustand';

interface AppState {
  selectedLocalityId: string | null;
  setSelectedLocalityId: (id: string | null) => void;
  activeClimateLayer: 'climate' | 'aqi' | 'vegetation' | 'heat' | 'rainfall' | 'community';
  setActiveClimateLayer: (layer: 'climate' | 'aqi' | 'vegetation' | 'heat' | 'rainfall' | 'community') => void;
  ritActiveConversationId: string | null;
  setRitActiveConversationId: (id: string | null) => void;
  detectedCoordinates: { lat: number; lng: number } | null;
  setDetectedCoordinates: (coords: { lat: number; lng: number } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedLocalityId: null,
  setSelectedLocalityId: (id) => set({ selectedLocalityId: id }),
  activeClimateLayer: 'climate',
  setActiveClimateLayer: (layer) => set({ activeClimateLayer: layer }),
  ritActiveConversationId: null,
  setRitActiveConversationId: (id) => set({ ritActiveConversationId: id }),
  detectedCoordinates: null,
  setDetectedCoordinates: (coords) => set({ detectedCoordinates: coords }),
}));
