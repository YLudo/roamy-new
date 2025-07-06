"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";
import { useState } from "react";
import ActivitiesFilters from "./activities-filters";
import ActivityAddForm from "./activity-add-form";

interface ActivitiesListProps {
    travel: ITravel;
}

export default function ActivitiesList({ travel }: ActivitiesListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<ActivityType>("all");
    const [confirmationFilter, setConfirmationFilter] = useState<boolean>(false);

    const filteredActivities = travel.activities.filter((activity) => {
        const matchesSearch =
            activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || activity.type === typeFilter;
        const matchesConfirmation = activity.isConfirmed === confirmationFilter;

        return matchesSearch && matchesType && matchesConfirmation;
    });

    return (
        <>
            <Card className="h-fit">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Liste des activités</CardTitle>
                            <CardDescription>Gérez et filtrez vos activités</CardDescription>
                        </div>
                        <ActivityAddForm />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ActivitiesFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        confirmationFilter={confirmationFilter}
                        setConfirmationFilter={setConfirmationFilter}
                    />
                    {filteredActivities.length > 0 ? (
                        <div className="space-y-4">

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
        </>
    );
}