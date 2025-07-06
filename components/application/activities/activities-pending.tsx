import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

interface ActivitiesPendingProps {
    activities: IActivity[];
}

export default function ActivitiesPending({ activities }: ActivitiesPendingProps) {
    const pendingCount = activities.filter((activity) => !activity.isConfirmed).length;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Activités non confirmées</CardTitle>
                <XCircle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">
                    {pendingCount}
                </div>
                <p className="text-xs text-muted-foreground">En attente de confirmation</p>
            </CardContent>
        </Card>
    );
}