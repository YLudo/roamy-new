import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";
import PollCollapsible from "./poll-collapsible";
import PollAddForm from "./poll-add-form";
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { useTravelStore } from "@/stores/travel-store";

interface PollsLayoutProps {
    travel: ITravel;
}

export default function PollsLayout({ travel }: PollsLayoutProps) {
    const { setCurrentTravel } = useTravelStore();

    useEffect(() => {
        if (!travel) return;

        const channel = pusherClient.subscribe(`travel-${travel.id}`);

        channel.bind("polls:new", (newPoll: IPoll) => {
           if (!travel?.polls.some(p => p.id === newPoll.id)) {
                setCurrentTravel({
                    ...travel,
                    polls: [...(travel?.polls ?? []), newPoll],
                });
            }
        });

        return () => {
            pusherClient.unbind_all();
            pusherClient.unsubscribe(`travel-${travel.id}`);
        };
    }, [setCurrentTravel, travel]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Liste des sondages</CardTitle>
                        <CardDescription>Votez ou decidez ensemble des activités</CardDescription>
                    </div>
                    <PollAddForm travelId={travel.id} />
                </div>
            </CardHeader>
            <CardContent>
                {travel.polls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {travel.polls.map((poll) => (
                            <PollCollapsible key={poll.id} poll={poll} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 px-6 bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                        <div className="flex flex-col items-center space-y-2">
                            <ScrollText className="size-8 text-primary" />
                            <div className="space-y-2">
                                <h3 className="text font-semibold text-foreground">Aucun sondage enregistré</h3>
                                <p className="text-sm text-muted-foreground">Ajoutez un premier sondage pour commencer l'aventure.</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}