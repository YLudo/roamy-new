import { Skeleton } from "@/components/ui/skeleton";
import { Plane } from "lucide-react";
import TripCard from "./trip-card";

interface TripsListProps {
    isLoading: boolean;
    travels: ITravel[];
}

export default function TripsList({ isLoading, travels }: TripsListProps) {
    if (isLoading) {
        return <Skeleton className="h-[200px] w-full rounded-xl" />
    }

    if (travels.length <= 0) {
        return (
            <div className="text-center py-12 px-6 bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                <div className="flex flex-col items-center space-y-2">
                    <Plane className="size-8 text-primary" />
                    <div className="space-y-2">
                        <h3 className="text font-semibold text-foreground">Aucun voyage planifié</h3>
                        <p className="text-sm text-muted-foreground">Commencez votre aventure en créant votre premier voyage !</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {travels.map((travel, index) => (
                <TripCard key={index} trip={travel} showActions />
            ))}
        </div>
    );
}