import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Users } from "lucide-react";

interface ExpenseCardProps {
    expense: IExpense;
}

export default function ExpenseCard({ expense }: ExpenseCardProps) {
    return (
        <div className="cursor-pointer hover:bg-muted/50 transition-colors p-4 border rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{expense.title}</h3>
                            {expense.isShared && (
                                <Badge variant="secondary" className="text-xs">
                                    <Users className="size-3 mr-1" />
                                    Partagé
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {formatDate(expense.expenseDate)}
                            </span>
                            <span>Payé par {expense.payer.name}</span>
                            {expense.location && <span className="truncate">{expense.location}</span>}
                        </div>
                        {expense.description && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">{expense.description}</p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-semibold">{formatCurrency(Number(expense.amount), expense.currency)}</div>
                    {expense.participants && expense.participants.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {expense.participants.filter((p) => p.isSettled).length}/{expense.participants.length}{" "}
                            réglé(s)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}