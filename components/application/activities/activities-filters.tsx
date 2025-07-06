import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activityTypeLabels } from "@/lib/utils";
import { Search } from "lucide-react";

interface ActivitiesFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    typeFilter: ActivityType;
    setTypeFilter: (value: ActivityType) => void;
    confirmationFilter: boolean;
    setConfirmationFilter: (value: boolean) => void;
}

export default function ActivitiesFilters({
    searchTerm, setSearchTerm, typeFilter, setTypeFilter, confirmationFilter, setConfirmationFilter,
}: ActivitiesFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                    placeholder="Rechercher une activité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {Object.entries(activityTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}