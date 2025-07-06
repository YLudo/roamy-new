import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCheck } from "lucide-react";

interface ActivitiesConfirmedProps {
    activities: IActivity[];
}

export default function ActivitiesConfirmed({ activities }: ActivitiesConfirmedProps) {
    const confirmedActivities = activities.filter((activity) => activity.isConfirmed).length;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Activités confirmées</CardTitle>
                <CheckCheck className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">{confirmedActivities}</div>
                <p className="text-xs text-muted-foreground">Confirmées par l'organisateur</p>
            </CardContent>
        </Card>
    );
}