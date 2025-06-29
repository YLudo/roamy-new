import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Users } from "lucide-react";

interface ExpensesSharedProps {
    expenses: IExpense[];
}

export default function ExpensesShared({ expenses }: ExpensesSharedProps) {
    const sharedExpenses = expenses.filter((e) => e.isShared).reduce((sum, expense) => sum + Number(expense.amount), 0)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Dépenses partagées</CardTitle>
                <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(sharedExpenses, "EUR")}</div>
                <p className="text-xs text-muted-foreground">
                    {expenses.filter((e) => e.isShared).length} dépense
                    {expenses.filter((e) => e.isShared).length > 1 ? "s" : ""} partagée
                    {expenses.filter((e) => e.isShared).length > 1 ? "s" : ""}
                </p>
            </CardContent>
        </Card>
    );
}