import { create } from 'zustand';
import { Interaction } from '@/types/types';

interface InteractionState {
    interaction: Interaction;
    setInteraction: (interaction: Interaction) => void;
}

const useInteractionStore = create<InteractionState>((set) => ({
    interaction: 'qna',
    setInteraction: (interaction) => set({ interaction }),
}));

export default useInteractionStore;
