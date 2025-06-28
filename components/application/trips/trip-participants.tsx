import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

export default function TripParticipants({ participants }: { participants: IParticipant[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Liste des participants ({participants.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {participants.map((participant) => (
                        <div key={participant.id} className="flex items-start md:items-center gap-3 p-3 rounded-lg border bg-card">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="" alt={participant.user.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground">{participant.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{participant.user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{participant.user.email}</p>
                                    </div>
                                    {participant.role === "owner" && (
                                        <Badge>
                                            <Crown className="size-3 mr-1" />
                                            Propriétaire
                                        </Badge>
                                    )}
                                </div>
                            </div>                        
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}