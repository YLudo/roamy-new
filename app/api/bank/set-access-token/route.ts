import { authOptions } from "@/lib/auth";
import { plaidClient } from "@/lib/plaid";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { CountryCode } from "plaid";

export async function POST(
    request: Request,
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.id) {
            return NextResponse.json(
                { message: "Votre session a expiré. Veuillez vous reconnecter." },
                { status: 401 },
            );
        }

        const { public_token } = await request.json();

        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: public_token,
        });

        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;

        const itemResponse = await plaidClient.itemGet({
            access_token: accessToken,
        });

        const institutionId = itemResponse.data.item.institution_id || "";

        let institutionName = "Institution financière";
        if (institutionId) {
            const institutionResponse = await plaidClient.institutionsGetById({
                institution_id: institutionId,
                country_codes: [CountryCode.Fr],
            });
            institutionName = institutionResponse.data.institution.name;
        }

        const plaidItem = await prisma.plaidItem.create({
            data: {
                userId: session.user.id,
                accessToken,
                itemId,
                institutionId,
                institutionName,
            },
        });

        await pusherServer.trigger(
            `user-${session.user.id}`,
            "bank:new",
            plaidItem.id,
        );

        return NextResponse.json(
            { data: plaidItem.id },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur interne du serveur lors de l'échange des tokens." },
            { status: 500 },
        );
    }
}