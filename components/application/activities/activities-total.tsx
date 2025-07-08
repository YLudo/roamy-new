import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface ActivitiesTotalProps {
    activities: IActivity[];
}

export default function ActivitiesTotal({ activities }: ActivitiesTotalProps) {
    return (
        <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Activités prévues</CardTitle>
                <CalendarDays className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activities.length}</div>
                <p className="text-xs text-muted-foreground">
                    Sur la période totale du voyage
                </p>
            </CardContent>
        </Card>
    );
}