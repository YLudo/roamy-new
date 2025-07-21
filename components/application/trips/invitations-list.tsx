import { Skeleton } from "@/components/ui/skeleton";
import { Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import InvitationCard from "./invitation-card";

interface InvitationsListProps {
    isLoading: boolean;
    travels: ITravel[];
}

export default function InvitationsList({ isLoading, travels }: InvitationsListProps) {
    const { data: session } = useSession();

    const invitedTravels = () => {
        if (travels.length <= 0 && !session?.user.id) return [];
        return travels.filter((travel) => {
            return travel.participants.some((p) => p.userId === session?.user.id && p.status === "invited");
        });
    }

    const filteredTravels = invitedTravels();

    if (isLoading) {
        return <Skeleton className="h-[200px] w-full rounded-xl" />
    }

    if (filteredTravels.length <= 0) {
        return (
            <div className="text-center py-12 px-6 bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                <div className="flex flex-col items-center space-y-2">
                    <Mail className="size-8 text-primary" />
                    <div className="space-y-2">
                        <h3 className="text font-semibold text-foreground">Aucun invitation reçue</h3>
                        <p className="text-sm text-muted-foreground">N'attendez pas et créez votre propre voyage !</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {filteredTravels.map((travel, index) => (
                <InvitationCard key={index} travel={travel} />
            ))}
        </div>
    );
}