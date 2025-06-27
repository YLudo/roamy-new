import { create } from "zustand";

interface TravelStore {
    travels: ITravel[];
    currentTravel: ITravel | null;
    isLoading: boolean;
    fetchTravels: () => Promise<void>;
    setCurrentTravel: (travel: ITravel) => void;
}

export const useTravelStore = create<TravelStore>((set) => ({
    travels: [],
    currentTravel: null,
    isLoading: false,

    fetchTravels: async () => {
        set({ isLoading: true });
        try {
            const result = await fetch("/api/travels");
            const data = await result.json();
            set({ travels: data });
        } catch (error) {
            console.error("Error when fetching travels : ", error);
        } finally {
            set({ isLoading: false });
        }
    },

    setCurrentTravel: (travel) => set({ currentTravel: travel }),
}));