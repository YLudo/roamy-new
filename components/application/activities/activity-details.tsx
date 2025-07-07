import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { activityTypeLabels, formatCurrency, formatDateTime } from "@/lib/utils";
import { Calendar, CheckCheck, MapPin } from "lucide-react";

interface ActivityDetailsProps {
    activity: IActivity;
}

export default function ActivityDetails({
    activity,
}: ActivityDetailsProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-lg font-bold tracking-tight">{activity.title}</h2>
                                    <Badge variant="secondary" className="text-xs">
                                        {activity.isConfirmed ? "Confirmé" : "A confirmer"}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {activityTypeLabels[activity.type]}
                                    </Badge>
                                </div>
                                {activity.estimatedCost && (
                                    <div className="text-xl font-bold text-primary">
                                        {formatCurrency(activity.estimatedCost, "EUR")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Calendar className="size-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">{formatDateTime(activity.startDate)}</p>
                                </div>
                            </div>
                            {activity.location && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <MapPin className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lieu</p>
                                        <p className="font-medium truncate text-wrap" title={activity.location}>
                                            {activity.location}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CheckCheck className="size-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Confirmé ?</p>
                                    <p className="font-medium">{activity.isConfirmed ? "Oui" : "Non"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}