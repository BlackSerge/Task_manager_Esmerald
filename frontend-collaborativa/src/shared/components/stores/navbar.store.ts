import { create } from 'zustand';

interface NavBarState {
  isChatOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;
}

export const useNavBarStore = create<NavBarState>((set) => ({
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  closeChat: () => set({ isChatOpen: false }),
}));