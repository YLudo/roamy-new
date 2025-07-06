import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Euro } from "lucide-react";

interface ActivitiesCostProps {
    activities: IActivity[];
}

export default function ActivitiesCost({ activities }: ActivitiesCostProps) {
    const total = activities.reduce((sum, activity) => {
        return sum + (activity.estimatedCost ?? 0);
    }, 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Coût total estimé</CardTitle>
                <Euro className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(total, "EUR")}</div>
                <p className="text-xs text-muted-foreground">
                    Somme des coûts prévus (hors dépenses)
                </p>
            </CardContent>
        </Card>
    );
}