import { Badge } from "@/components/ui/badge";
import { activityTypeLabels, formatCurrency, formatDateTime } from "@/lib/utils";
import { Calendar, MapPin } from "lucide-react";

interface ActivityCardProps {
    activity: IActivity;
    onClick: () => void;
}

export default function ActivityCard({ activity, onClick }: ActivityCardProps) {
    return (
        <div className="cursor-pointer hover:bg-muted/50 transition-colors p-4 border rounded-lg" onClick={onClick}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{activity.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                                {activity.isConfirmed ? "Confirmé" : "A confirmer"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {activityTypeLabels[activity.type]}
                            </Badge>
                        </div>
                        {activity.description && (
                            <p className="text-sm text-muted-foreground mb-2 truncate">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <MapPin className="size-3 text-primary" />
                                {activity.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="size-3 text-primary" />
                                {formatDateTime(activity.startDate)}
                            </span>
                        </div>
                    </div>
                </div>
                {activity.estimatedCost && (
                    <div className="text-right">
                        <div className="text-lg font-semibold">{formatCurrency(Number(activity.estimatedCost), activity.currency)}</div>
                    </div>
                )}
            </div>
        </div>
    );
}