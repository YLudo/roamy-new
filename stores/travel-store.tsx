import { create } from "zustand";

interface TravelStore {
    travels: ITravel[];
    currentTravel: ITravel | null;
    isLoading: boolean;
    fetchTravels: () => Promise<void>;
    fetchCurrentTravel: (id: string) => Promise<void>;
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

    fetchCurrentTravel: async (id: string) => {
        set({ isLoading: true });
        try {
            const result = await fetch(`/api/travels/${id}`);
            if (!result.ok) throw new Error("Erreur lors de la récupération du voyage.");
            const data = await result.json();
            set({ currentTravel: data });
        } catch (error) {
            console.error(error);
            set({ currentTravel: null });
        } finally {
            set({ isLoading: false });
        }
    },
}));