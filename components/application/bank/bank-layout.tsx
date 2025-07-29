import { useSession } from "next-auth/react";
import BankInformations from "./bank-informations";
import { useCallback, useEffect, useState, useTransition } from "react";
import { pusherClient } from "@/lib/pusher";
import BankBalance from "./bank-balance";
import BankHistory from "./bank-history";

export default function BankLayout() {
    const { data: session } = useSession();

    const [accounts, setAccounts] = useState([]);
    const [isPending, startTransition] = useTransition();

    const fetchAccounts = useCallback(() => {
        startTransition(async () => {
            const response = await fetch(`/api/bank/accounts`);

            const result = await response.json();
            if (Array.isArray(result.data)) {
                setAccounts(result.data);
            }
        });
    }, []);

    useEffect(() => {
        if (!session?.user?.id) return;
        const channelName = `user-${session.user.id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("bank:new", () => fetchAccounts());

        return () => {
            pusherClient.unbind("bank:new");
            pusherClient.unsubscribe(channelName);
        };
    }, [fetchAccounts, session?.user.id]);

    useEffect(() => {
        fetchAccounts();
    }, []);

    return (
        <div className="grid lg:grid-cols-3 mt-4 gap-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-4 h-fit">
                <BankInformations account={accounts.length > 0 ? accounts[0] : null} isLoading={isPending} />
                <BankBalance accounts={accounts} isLoading={isPending} />
            </div>
            <div className="lg:col-span-2">
                <BankHistory />
            </div>
        </div>
    );
}