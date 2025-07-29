"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import BankTransactions from "./bank-transactions";

export default function BankHistory() {
    const { data: session } = useSession();
    const [transactions, setTransactions] = useState([]);
    const [isPending, startTransition] = useTransition();

    const fetchTransactions = useCallback(() => {
        startTransition(async () => {
            const response = await fetch(`/api/bank/transactions`);
            const result = await response.json();
            setTransactions(result.data);
        });
    }, []);

    useEffect(() => {
        if (!session?.user?.id) return;
        const channelName = `user-${session.user.id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("bank:new", () => fetchTransactions());

        return () => {
            pusherClient.unbind("bank:new");
            pusherClient.unsubscribe(channelName);
        };
    }, [fetchTransactions, session?.user.id])

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Liste des transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <BankTransactions transactions={transactions} isLoading={isPending} />
            </CardContent>
        </Card>
    );
}