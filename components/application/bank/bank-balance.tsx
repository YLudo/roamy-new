import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BankBalance({ accounts, isLoading }) {
    if (isLoading) {
        return <Skeleton className="w-full h-[150px] rounded-xl" />
    }

    console.log(accounts);

    const totalBalance = accounts.reduce((sum, account) => sum + (account.balances.current || 0), 0);

    const formattedBalance = new Intl.NumberFormat('fr-FR', {
        style: "currency",
        currency: "EUR",
    }).format(totalBalance);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Solde actuel</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-4xl font-bold">
                    {isLoading ? "Chargement..." : formattedBalance}
                </p>
            </CardContent>
        </Card>
    );
}