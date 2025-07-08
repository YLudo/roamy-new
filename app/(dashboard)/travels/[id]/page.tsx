"use client";

import ActivitiesTotal from "@/components/application/activities/activities-total";
import ExpensesTotal from "@/components/application/expenses/expenses-total";
import TripCard from "@/components/application/trips/trip-card";
import TripParticipants from "@/components/application/trips/trip-participants";
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-4">
                <TripCard trip={currentTravel} />
                <TripParticipants travelId={currentTravel.id} participants={currentTravel.participants} />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ActivitiesTotal activities={currentTravel.activities} />
                <ExpensesTotal expenses={currentTravel.expenses} />
            </div>
        </div>
    );
}