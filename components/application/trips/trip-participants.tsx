import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pusherClient } from "@/lib/pusher";
import { ParticipantSchema } from "@/schemas/travels";
import { useTravelStore } from "@/stores/travel-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Crown, Loader2, Mail, Plus, Users } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface TripParticipantsProps {
    travelId: string;
    participants: IParticipant[];
}

export default function TripParticipants({ travelId, participants }: TripParticipantsProps) {
    const { currentTravel, setCurrentTravel } = useTravelStore();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ParticipantSchema>>({
        resolver: zodResolver(ParticipantSchema),
        defaultValues: {
            email: "",
        },
    });

    const acceptedParticipants = participants.filter((p) => p.status === "accepted")
    const invitations = participants.filter((p) => p.status === "invited")

    useEffect(() => {
        if (!currentTravel) return;

        const channel = pusherClient.subscribe(`travel-${travelId}`);

        channel.bind("participants:new", (newParticipant: IParticipant) => {
            if (!currentTravel?.participants.some(p => p.id === newParticipant.id)) {
                setCurrentTravel({
                    ...currentTravel,
                    participants: [...(currentTravel?.participants ?? []), newParticipant],
                });
            }
        });

        return () => {
            pusherClient.unbind_all();
            pusherClient.unsubscribe(`travel-${travelId}`);
        };
    }, [currentTravel, setCurrentTravel, travelId]);

    const onSubmit = (values: z.infer<typeof ParticipantSchema>) => {
        startTransition(async () => {
            try {
                const response = await fetch(`/api/travels/${travelId}/participants`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || "Une erreur inconnue s'est produite.");
                }

                toast.success("Participant invité !", { description: result.message });
                form.reset();
            } catch (error: any) {
                toast.error("Oups !", { description: error.message || "Une erreur s'est produite lors de l'ajout du participant." });
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Liste des participants ({acceptedParticipants.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="participants" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="participants" className="flex items-center gap-2">
                            <Users className="size-4" />
                            Participants ({acceptedParticipants.length})
                        </TabsTrigger>
                        <TabsTrigger value="invitations" className="flex items-center gap-2">
                            <Mail className="size-4" />
                            Invitations ({invitations.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="participants" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            {acceptedParticipants.map((participant) => (
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
                    </TabsContent>
                    <TabsContent value="invitations" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            {invitations.length > 0 ? (
                                invitations.map((invitation) => (
                                    <div key={invitation.id} className="flex items-start md:items-center gap-3 p-3 rounded-lg border bg-card">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src="" alt={invitation.user.name} />
                                            <AvatarFallback className="bg-primary text-primary-foreground">{invitation.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{invitation.user.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{invitation.user.email}</p>
                                                </div>
                                            </div>
                                        </div>                        
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 px-6 bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                                    <div className="flex flex-col items-center space-y-2">
                                        <Mail className="size-8 text-primary" />
                                        <div className="space-y-2">
                                            <h3 className="text font-semibold text-foreground">Aucun invitation en cours</h3>
                                            <p className="text-sm text-muted-foreground">Invitez vos amis et famille à rejoindre cette aventure !</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
                <Separator className="my-6" />
                <div className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ajouter un participant</FormLabel>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <FormControl className="flex-1">
                                                <Input
                                                    placeholder="adresse@email.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <Button type="submit" size="sm" disabled={isPending}>
                                                {isPending 
                                                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    : (
                                                        <>
                                                            <Plus className="size-4 mr-1" />
                                                            Inviter
                                                        </>
                                                    )
                                                }
                                            </Button>
                                        </div>
                                        <FormMessage />
                                        <FormDescription className="text-xs">
                                            Un email d'invitation sera envoyé à cette adresse.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    );
}