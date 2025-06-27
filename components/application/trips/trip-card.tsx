import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Eye, Globe, MapPin, User } from "lucide-react";
import Link from "next/link";

const statusConfig = {
  planning: { label: "Planification", color: "bg-blue-100 text-blue-800 border-blue-200" },
  confirmed: { label: "Confirmé", color: "bg-green-100 text-green-800 border-green-200" },
  ongoing: { label: "En cours", color: "bg-orange-100 text-orange-800 border-orange-200" },
  completed: { label: "Terminé", color: "bg-gray-100 text-gray-800 border-gray-200" },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-800 border-red-200" },
}

const visibilityConfig = {
  participants_only: { label: "Participants uniquement", icon: User },
  public: { label: "Public", icon: Globe },
  private: { label: "Privé", icon: Eye },
}

export default function TripCard({ trip }) {
    const formatDate = (date?: Date) => {
        if (!date) return null
        return new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(date))
    }

    const getDestination = () => {
        if (trip.destinationCity && trip.destinationCountry) {
            return `${trip.destinationCity}, ${trip.destinationCountry}`
        }
        return trip.destinationCountry || trip.destinationCity || "Destination non définie"
    }

    const getDuration = () => {
        if (trip.startDate && trip.endDate) {
            const start = new Date(trip.startDate)
            const end = new Date(trip.endDate)
            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return `${diffDays} jour${diffDays > 1 ? "s" : ""}`
        }
        return null
    }

    const VisibilityIcon = visibilityConfig[trip.visibility].icon

    return (
        <Card className="w-full">
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">{trip.title}</h3>
                        {trip.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">{trip.description}</p>
                        )}
                    </div>
                    <Badge variant="secondary" className={`self-start ${statusConfig[trip.status].color}`}>
                        {statusConfig[trip.status].label}
                    </Badge>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium truncate">{getDestination()}</span>
                        </div>
                        {(trip.startDate || trip.endDate) && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <span className="whitespace-nowrap">
                                        {trip.startDate && formatDate(trip.startDate)}
                                        {trip.startDate && trip.endDate && " - "}
                                        {trip.endDate && formatDate(trip.endDate)}
                                    </span>
                                    {getDuration() && (
                                        <Badge variant="outline">{getDuration()}</Badge>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <VisibilityIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{visibilityConfig[trip.visibility].label}</span>
                        </div>
                    </div>
                    <Link href={`/travels/${trip.id}`} className={buttonVariants()}>Voir le voyage</Link>
                </div>
            </CardContent>
        </Card>
    );
}