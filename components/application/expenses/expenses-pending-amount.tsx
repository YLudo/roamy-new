import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown } from "lucide-react";

interface ExpensesPendingAmountProps {
    expenses: IExpense[];
}

export default function ExpensesPendingAmount({ expenses }: ExpensesPendingAmountProps) {
    const pendingAmount = expenses.reduce((sum, expense) => {
        if (!expense.participants) return sum
        return sum + expense.participants.filter((p) => !p.isSettled).reduce((pSum, p) => pSum + Number(p.amountOwed), 0)
    }, 0)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <TrendingDown className="size-4 text-red-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(pendingAmount, "EUR")}</div>
                <p className="text-xs text-muted-foreground">À rembourser</p>
            </CardContent>
        </Card>
    );
}