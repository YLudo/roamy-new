import ExpensesDistributionByCategory from "./expenses-distribution-by-category";
import ExpensesDistributionByPayer from "./expenses-distribution-by-payer";
import ExpensesPendingAmount from "./expenses-pending-amount";
import ExpensesSettledAmount from "./expenses-settled-amount";
import ExpensesShared from "./expenses-shared";
import ExpensesTotal from "./expenses-total";

interface ExpensesLayoutProps {
    expenses: IExpense[];
}

export default function ExpensesLayout({ expenses }: ExpensesLayoutProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ExpensesTotal expenses={expenses} />
                <ExpensesShared expenses={expenses} />
                <ExpensesSettledAmount expenses={expenses} />
                <ExpensesPendingAmount expenses={expenses} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <ExpensesDistributionByPayer expenses={expenses} />
                    <ExpensesDistributionByCategory expenses={expenses} />
                </div>
            </div>
        </div>
    );
}
