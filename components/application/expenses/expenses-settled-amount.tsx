import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface ExpensesSettledAmountProps {
    expenses: IExpense[];
}

export default function ExpensesSettledAmount({ expenses }: ExpensesSettledAmountProps) {
    const settledAmount = expenses.reduce((sum, expense) => {
        if (!expense.participants) return sum
        return sum + expense.participants.filter((p) => p.isSettled).reduce((pSum, p) => pSum + Number(p.amountOwed), 0)
    }, 0)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Montant réglé</CardTitle>
                <TrendingUp className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(settledAmount, "EUR")}</div>
                <p className="text-xs text-muted-foreground">Remboursements effectués</p>
            </CardContent>
        </Card>
    );
}