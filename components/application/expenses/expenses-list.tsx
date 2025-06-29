import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseCard from "./expense-card";
import ExpensesFilters from "./expenses-filter";
import { useState } from "react";

interface ExpensesListProps {
    expenses: IExpense[];
}

export default function ExpensesList({ expenses }: ExpensesListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory>("all");
    const [statusFilter, setStatusFilter] = useState<ExpenseStatus>("all");

    const filteredExpenses = expenses.filter((expense) => {
        const matchesSearch =
            expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "settled" && expense.participants?.every((p) => p.isSettled)) ||
            (statusFilter === "pending" && expense.participants?.some((p) => !p.isSettled))

        return matchesSearch && matchesCategory && matchesStatus
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Liste des dépenses</CardTitle>
                <CardDescription>Gérez et filtrez vos dépenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <ExpensesFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />
                <div className="space-y-4">
                    {filteredExpenses.map((expense) => (
                        <ExpenseCard key={expense.id} expense={expense} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}