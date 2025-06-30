import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { expenseCategoryLabels } from "@/lib/utils";
import { Search } from "lucide-react";

interface ExpensesFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    categoryFilter: ExpenseCategory;
    setCategoryFilter: (value: ExpenseCategory) => void;
    statusFilter: ExpenseStatus;
    setStatusFilter: (value: ExpenseStatus) => void;
}

export default function ExpensesFilters({
    searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
}: ExpensesFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                    placeholder="Rechercher une dépense..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {Object.entries(expenseCategoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les status</SelectItem>
                    <SelectItem value="settled">Réglé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}