"use client";

import { useTravelStore } from "@/stores/travel-store";

export default function TravelDashboardPage() {
    const { currentTravel } = useTravelStore();
    return (
        <p>{currentTravel?.title}</p>
    );
}