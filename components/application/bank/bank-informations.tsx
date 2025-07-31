import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlaidLink from "./plaid-link";
import { Skeleton } from "@/components/ui/skeleton";

interface BankInformationsProps {
    account: any;
    isLoading: boolean;
}

export default function BankInformations({ account, isLoading }: BankInformationsProps) {
    if (isLoading) {
        return <Skeleton className="w-full h-[150px] rounded-xl" />
    }

    return (
        <Card className="bg-primary">
            <CardHeader>
                <CardTitle className="text-muted">Mon compte</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between gap-4 rounded-lg">
                {account ? (
                    <div className="flex flex-col gap-2">
                        <h2 className="text-base font-bold text-muted">{account.official_name}</h2>
                        <p className="text-sm text-muted">
                            {account.name}
                        </p>
                        <p className="text-sm font-semibold tracking-[1.1px] text-muted">
                            {account.mask ? `●●●● ●●●● ●●●● ${account.mask}` : 'Compte connecté via Plaid'}
                        </p>
                    </div>
                ) : (
                    <PlaidLink />
                )}
            </CardContent>
        </Card>
    );
}