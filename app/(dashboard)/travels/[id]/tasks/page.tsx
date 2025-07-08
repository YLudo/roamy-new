"use client";

import TasksLayout from "@/components/application/tasks/tasks-layout";
import { useTravelStore } from "@/stores/travel-store";
import { Loader2 } from "lucide-react";

export default function TravelTasksPage() {
    const { currentTravel } = useTravelStore();

    if (!currentTravel) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="animate-spin size-8 text-primary" />
            </div>
        );
    }
    
    return (
        <TasksLayout travel={currentTravel} />
    );
}