"use client";

import { Button } from "@/components/ui/button";
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link';
import { useCallback, useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

export default function PlaidLink() {
    const [token, setToken] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const generateToken = useCallback(async () => {
        startTransition(async () => {
            try {
                const response = await fetch(`/api/bank/create-link-token`, { method: "POST" });
                const result = await response.json();
                setToken(result.data);
            } catch (error: any) {
                console.error(error);
            }
        })
    }, []);

    useEffect(() => {
        generateToken();
    }, [generateToken]);

    const onSuccess = useCallback(async (public_token: string) => {
        await fetch('/api/bank/set-access-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_token }),
        });
    }, []);

    const config: PlaidLinkOptions = {
        token,
        onSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    return (
        <Button
            onClick={() => open()}
            disabled={!ready || isPending}
            variant="secondary"
            className="w-fit"
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                </>
            ) : (
                "Connecter un compte bancaire"
            )}
        </Button>
    );
}