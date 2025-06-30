import ExpensesDistributionByCategory from "./expenses-distribution-by-category";
import ExpensesDistributionByPayer from "./expenses-distribution-by-payer";
import ExpensesList from "./expenses-list";
import ExpensesPendingAmount from "./expenses-pending-amount";
import ExpensesSettledAmount from "./expenses-settled-amount";
import ExpensesShared from "./expenses-shared";
import ExpensesTotal from "./expenses-total";

interface ExpensesLayoutProps {
    travel: ITravel;
}

export default function ExpensesLayout({ travel }: ExpensesLayoutProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ExpensesTotal expenses={travel.expenses} />
                <ExpensesShared expenses={travel.expenses} />
                <ExpensesSettledAmount expenses={travel.expenses} />
                <ExpensesPendingAmount expenses={travel.expenses} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <ExpensesDistributionByPayer expenses={travel.expenses} />
                    <ExpensesDistributionByCategory expenses={travel.expenses} />
                </div>
                <div className="lg:col-span-2">
                    <ExpensesList travel={travel} />
                </div>
            </div>
        </div>
    );
}
