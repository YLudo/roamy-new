import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, User } from "lucide-react";

const statusConfig = {
    planning: { label: "Planification", color: "bg-blue-100 text-blue-800 border-blue-200" },
    confirmed: { label: "Confirmé", color: "bg-green-100 text-green-800 border-green-200" },
    ongoing: { label: "En cours", color: "bg-orange-100 text-orange-800 border-orange-200" },
    completed: { label: "Terminé", color: "bg-gray-100 text-gray-800 border-gray-200" },
    cancelled: { label: "Annulé", color: "bg-red-100 text-red-800 border-red-200" },
}

interface InvitationCardProps {
    travel: ITravel;
}

export default function InvitationCard({ travel }: InvitationCardProps) {
    const getDestination = () => {
        if (travel.destinationCity && travel.destinationCountry) {
            return `${travel.destinationCity}, ${travel.destinationCountry}`
        }
        return travel.destinationCountry || travel.destinationCity || "Destination non définie"
    }

    return (
        <Card className="w-full">
            <CardContent>
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">{travel.title}</h3>
                        {travel.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">{travel.description}</p>
                        )}
                    </div>
                    <Badge variant="secondary" className={`self-start ${statusConfig[travel.status].color}`}>
                        {statusConfig[travel.status].label}
                    </Badge>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium truncate">{getDestination()}</span>
                    </div>
                    {(travel.startDate || travel.endDate) && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 whitespace-nowrap">
                                {travel.startDate && formatDate(travel.startDate)}
                                {travel.startDate && travel.endDate && " - "}
                                {travel.endDate && formatDate(travel.endDate)}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Créé par {travel.creator.name}</span>
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <Button variant="ghost">Refuser</Button>
                    <Button>Accepter</Button>
                </div>
            </CardContent>
        </Card>
    );
}