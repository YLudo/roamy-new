import { authOptions } from "@/lib/auth";
import { plaidClient } from "@/lib/plaid";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { AccountsGetRequest } from "plaid";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.id) {
            return NextResponse.json(
                { message: "Votre session a expiré. Veuillez vous reconnecter." },
                { status: 401 },
            );
        }

        const plaidItem = await prisma.plaidItem.findFirst({
            where: {
                userId: session.user.id,
            },
        });

        if (!plaidItem) {
            return NextResponse.json(
                { message: "Aucun compte Plaid n'est lié à cet utilisateur." },
                { status: 404 }
            );
        }

        const request: AccountsGetRequest = {
            access_token: plaidItem.accessToken,
        };

        const response = await plaidClient.accountsGet(request);
        const accounts = response.data.accounts;

        return NextResponse.json(
            { data: accounts },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur lors de la récupération des comptes bancaires." },
            { status: 500 },
        );
    }
}