import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Euro } from "lucide-react";

interface ExpensesTotalProps {
    expenses: IExpense[];
}

export default function ExpensesTotal({ expenses }: ExpensesTotalProps) {
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

    return (
        <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Total des dépenses</CardTitle>
                <Euro className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses, "EUR")}</div>
                <p className="text-xs text-muted-foreground">
                    {expenses.length} dépense{expenses.length > 1 ? "s" : ""}
                </p>
            </CardContent>
        </Card>
    );
}