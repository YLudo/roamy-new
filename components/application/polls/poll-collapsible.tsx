import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, ChevronDown, ChevronUp, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function PollCollapsible({ poll }: { poll: IPoll }) {
    const { data: session } = useSession();

    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [showVoters, setShowVoters] = useState<boolean>(false);
    const { id, title, description, hasVoted, pollOptions } = poll;

    const getTotalVotes = () => {
        return pollOptions.reduce((sum, option) => sum + option.votes.length, 0)
    }

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    const getUserVote = () => {
        for (const option of pollOptions) {
            if (option.votes.some(vote => vote.userId === session?.user.id)) {
                return option.id;
            }
        }
        return null;
    }

    const userVote = getUserVote();

    return (
        <Collapsible
            open={isExpanded}
            onOpenChange={() => setIsExpanded(!isExpanded)}
            className="border rounded-lg"
        >
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{title}</span>
                            {hasVoted && (
                                <Badge className="text-xs">
                                    <Check className="mr-2 h-4 w-4" />
                                    Voté
                                </Badge>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {getTotalVotes()} vote{getTotalVotes() !== 1 ? "s" : ""} • Créé par {poll.user?.name} • {formatDate(poll.createdAt)}
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="px-4 pb-4 pt-2">
                    {description && 
                        <p className="text-sm text-muted-foreground mb-4">{description}</p>
                    }

                    {!hasVoted ? (
                        <div className="space-y-4">
                            <RadioGroup
                                value={selectedOption}
                                onValueChange={setSelectedOption}
                            >
                                {pollOptions.map((option) => (
                                    <div key={option.id} className="flex items-center space-x-2 rounded-md border p-4">
                                        <RadioGroupItem value={option.id} id={`${id}-option-${option.id}`} />
                                        <Label htmlFor={`${id}-option-${option.id}`} className="flex-grow cursor-pointer">
                                            {option.text}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            <Button
                                disabled={!selectedOption}
                                className="w-full"
                            >
                                Voter
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pollOptions.map((option) => {
                                const totalVotes = getTotalVotes();
                                const percentage = totalVotes > 0
                                    ? Math.round((option.votes.length) / totalVotes) * 100
                                    : 0;
                                const isUserVote = userVote === option.id;

                                return (
                                    <div key={option.id} className="space-y-2">
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{option.text}</span>
                                                {isUserVote && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Votre vote
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                                        </div>
                                        <div className="relative">
                                            <Progress 
                                                value={percentage} 
                                                className={`h-2 ${isUserVote ? "bg-primary/20" : ""}`} 
                                            />
                                            {showVoters && option.votes.length > 0 && (
                                                <div className="mt-2 flex -space-x-2 overflow-hidden">
                                                    {option.votes.map((vote) => (
                                                        <Badge key={vote.id} variant="outline">
                                                            {vote.user.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowVoters(!showVoters)}
                                className="w-full"
                            >
                                <Users className="mr-2 h-4 w-4" />
                                {showVoters ? "Masquer" : "Voir"} les votants
                            </Button>
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}