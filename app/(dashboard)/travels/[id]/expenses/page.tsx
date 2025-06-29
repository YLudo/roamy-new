"use client";

import ExpensesLayout from "@/components/application/expenses/expenses-layout";
import { useTravelStore } from "@/stores/travel-store";
import { Loader2 } from "lucide-react";

export default function TravelExpensesPage() {
    const { currentTravel } = useTravelStore();

    if (!currentTravel) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="animate-spin size-8 text-primary" />
            </div>
        );
    }
    
    return (
        <ExpensesLayout travel={currentTravel} />
    );
}