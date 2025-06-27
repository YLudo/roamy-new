"use client";

import { useTravelStore } from "@/stores/travel-store";
import { Loader2 } from "lucide-react";

export default function TravelDashboardPage() {
    const { currentTravel } = useTravelStore();

    if (!currentTravel) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="animate-spin size-8 text-primary" />
            </div>
        );
    }

    return (
        <p>{currentTravel.title}</p>
    );
}