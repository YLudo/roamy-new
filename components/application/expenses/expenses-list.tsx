import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseCard from "./expense-card";
import ExpensesFilters from "./expenses-filter";
import { useEffect, useState } from "react";
import ExpenseAddForm from "./expense-add-form";
import { pusherClient } from "@/lib/pusher";
import { useTravelStore } from "@/stores/travel-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpenseDetails from "./expense-details";
import { Euro } from "lucide-react";
import { toast } from "sonner";

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
    };

    const handleDeleteExpense = async (expenseId: string) => {
        try {
            const response = await fetch(`/api/travels/${travel.id}/expenses/${expenseId}`, {
                method: "DELETE",
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Une erreur inconnue s'est produite.");
            }

            // Mise à jour optimiste de l'état local
            setCurrentTravel({
                ...travel,
                expenses: travel.expenses.filter((expense) => expense.id !== expenseId),
            });

            // Fermer le modal si la dépense supprimée était sélectionnée
            if (selectedExpense && selectedExpense.id === expenseId) {
                setIsDetailsOpen(false);
                setSelectedExpense(null);
            }

            toast.success("Dépense supprimée", { description: "La dépense a été supprimée avec succès." });
        } catch (error: any) {
            toast.error("Erreur de suppression", { description: error.message || "Une erreur s'est produite lors de la suppression de la dépense." });
        }
    };

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

        // Gestion de la suppression en temps réel
        channel.bind("expenses:delete", (data: { expenseId: string }) => {
            const current = structuredClone(travel);
            
            const filteredExpenses = current.expenses.filter(expense => expense.id !== data.expenseId);
            
            setCurrentTravel({ ...current, expenses: filteredExpenses });

            // Fermer le modal si la dépense supprimée était sélectionnée
            if (selectedExpense && selectedExpense.id === data.expenseId) {
                setIsDetailsOpen(false);
                setSelectedExpense(null);
            }
        });

        return () => {
            pusherClient.unbind_all();
            pusherClient.unsubscribe(`travel-${travel.id}`);
        };
    }, [setCurrentTravel, travel, selectedExpense]);

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
                    {filteredExpenses.length > 0 ? (
                        <div className="space-y-4">
                            {filteredExpenses.map((expense) => (
                                <ExpenseCard 
                                    key={expense.id} 
                                    expense={expense} 
                                    onClick={() => handleExpenseClick(expense)}
                                    onDelete={handleDeleteExpense}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 px-6 bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                            <div className="flex flex-col items-center space-y-2">
                                <Euro className="size-8 text-primary" />
                                <div className="space-y-2">
                                    <h3 className="text font-semibold text-foreground">Aucun dépense enregistrée</h3>
                                    <p className="text-sm text-muted-foreground">Ajoutez une première dépense pour commencer l'aventure.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="!w-full !max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Détails de la dépense</DialogTitle>
                    </DialogHeader>
                    {selectedExpense && (
                        <ExpenseDetails 
                            expense={selectedExpense} 
                            onClose={() => setIsDetailsOpen(false)} 
                            onDelete={handleDeleteExpense}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
