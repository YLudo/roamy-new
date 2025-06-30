import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseCard from "./expense-card";
import ExpensesFilters from "./expenses-filter";
import { useEffect, useState } from "react";
import ExpenseAddForm from "./expense-add-form";
import { pusherClient } from "@/lib/pusher";
import { useTravelStore } from "@/stores/travel-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpenseDetails from "./expense-details";

interface ExpensesListProps {
    travel: ITravel;
}

export default function ExpensesList({ travel }: ExpensesListProps) {
    const { setCurrentTravel } = useTravelStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory>("all");
    const [statusFilter, setStatusFilter] = useState<ExpenseStatus>("all");

    const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

    const filteredExpenses = travel.expenses.filter((expense) => {
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

    const handleExpenseClick = (expense: IExpense) => {
        setSelectedExpense(expense);
        setIsDetailsOpen(true);
    }

    useEffect(() => {
        if (!travel) return;

        const channel = pusherClient.subscribe(`travel-${travel.id}`);

        channel.bind("expenses:new", (newExpense: IExpense) => {
            if (!travel?.expenses.some(e => e.id === newExpense.id)) {
                setCurrentTravel({
                    ...travel,
                    expenses: [...(travel?.expenses ?? []), newExpense],
                });
            }
        });

        channel.bind("expenses:settled", (updatedExpense: IExpense) => {
            const updatedExpenses = travel.expenses.map((expense) =>
                expense.id === updatedExpense.id ? updatedExpense : expense
            );

            setCurrentTravel({
                ...travel,
                expenses: updatedExpenses,
            });
        });

        return () => {
            pusherClient.unbind_all();
            pusherClient.unsubscribe(`travel-${travel.id}`);
        };
    }, [setCurrentTravel, travel]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Liste des dépenses</CardTitle>
                            <CardDescription>Gérez et filtrez vos dépenses</CardDescription>
                        </div>
                        <ExpenseAddForm travel={travel} />
                    </div>
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
                            <ExpenseCard key={expense.id} expense={expense} onClick={() => handleExpenseClick(expense)} />
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="!w-full !max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Détails de la dépense</DialogTitle>
                    </DialogHeader>
                    {selectedExpense && <ExpenseDetails expense={selectedExpense} onClose={() => setIsDetailsOpen(false)} />}
                </DialogContent>
            </Dialog>
        </>
    );
}