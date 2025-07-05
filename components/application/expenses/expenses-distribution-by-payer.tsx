import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Euro } from "lucide-react";

interface ExpensesDistributionByPayerProps {
    expenses: IExpense[];
}

export default function ExpensesDistributionByPayer({ expenses }: ExpensesDistributionByPayerProps) {
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

    const payerStats = expenses.reduce(
        (acc, expense) => {
            const payerName = expense.payer.name
            if (!acc[payerName]) {
                acc[payerName] = { amount: 0, count: 0 }
            }
            acc[payerName].amount += Number(expense.amount)
            acc[payerName].count += 1
            return acc
        },
        {} as Record<string, { amount: number; count: number }>,
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Répartition par payeur</CardTitle>
                <CardDescription>Qui a payé le plus ?</CardDescription>
            </CardHeader>
            <CardContent>
                {expenses.length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(payerStats)
                            .sort(([, a], [, b]) => b.amount - a.amount)
                            .map(([payer, stats]) => {
                                const percentage = (stats.amount / totalExpenses) * 100
                                return (
                                    <div key={payer} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{payer}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {stats.count} dépense{stats.count > 1 ? "s" : ""}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{formatCurrency(stats.amount, "EUR")}</div>
                                                <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                                            </div>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                )
                            })
                        }
                    </div>
                ) : (
                    <div className="text-center py-6 px-6 bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                        <div className="flex flex-col items-center space-y-2">
                            <Euro className="size-8 text-primary" />
                            <div className="space-y-2">
                                <h3 className="text font-semibold text-foreground">Aucun dépense enregistrée</h3>
                                <p className="text-sm text-muted-foreground">Ajoutez une première dépense pour visualiser la répartition par payeur.</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}