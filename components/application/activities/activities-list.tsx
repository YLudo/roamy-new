"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";
import { useEffect, useState } from "react";
import ActivitiesFilters from "./activities-filters";
import ActivityAddForm from "./activity-add-form";
import ActivityCard from "./activity-card";
import { pusherClient } from "@/lib/pusher";
import { useTravelStore } from "@/stores/travel-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ActivityDetails from "./activity-details";

interface ActivitiesListProps {
    travel: ITravel;
}

export default function ActivitiesList({ travel }: ActivitiesListProps) {
    const { setCurrentTravel } = useTravelStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<ActivityType>("all");

    const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

    const filteredActivities = travel.activities.filter((activity) => {
        const matchesSearch =
            activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || activity.type === typeFilter;

        return matchesSearch && matchesType;
    });

    const handleActivityClick = (activity: IActivity) => {
        setSelectedActivity(activity);
        setIsDetailsOpen(true);
    }

    useEffect(() => {
        if (!travel) return;

        const channel = pusherClient.subscribe(`travel-${travel.id}`);

        channel.bind("activities:new", (newActivity: IActivity) => {
            if (!travel?.activities.some(a => a.id === newActivity.id)) {
                setCurrentTravel({
                    ...travel,
                    activities: [...(travel?.activities ?? []), newActivity],
                });
            }
        });

        return () => {
            pusherClient.unbind_all();
            pusherClient.unsubscribe(`travel-${travel.id}`);
        };
    }, [setCurrentTravel, travel]);

    return (
        <>
            <Card className="h-fit">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Liste des activités</CardTitle>
                            <CardDescription>Gérez et filtrez vos activités</CardDescription>
                        </div>
                        <ActivityAddForm travelId={travel.id} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ActivitiesFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                    />
                    {filteredActivities.length > 0 ? (
                        <div className="space-y-4">
                            {filteredActivities.map((activity) => (
                                <ActivityCard key={activity.id} activity={activity} onClick={() => handleActivityClick(activity)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 px-6 bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                            <div className="flex flex-col items-center space-y-2">
                                <Map className="size-8 text-primary" />
                                <div className="space-y-2">
                                    <h3 className="text font-semibold text-foreground">Aucun activité enregistrée</h3>
                                    <p className="text-sm text-muted-foreground">Ajoutez une première activité pour commencer l'aventure.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="!w-full !max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Détails de l'activité</DialogTitle>
                    </DialogHeader>
                    {selectedActivity && <ActivityDetails activity={selectedActivity} />}
                </DialogContent>
            </Dialog>
        </>
    );
}