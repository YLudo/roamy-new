import { authOptions } from "@/lib/auth";
import { plaidClient } from "@/lib/plaid";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { CountryCode, Products } from "plaid";

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

        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: session.user.id },
            client_name: "Roamy App",
            products: [Products.Transactions],
            country_codes: [CountryCode.Fr],
            language: "fr",
        });

        return NextResponse.json(
            { data: response.data.link_token },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur lors de la création du lien avec Plaid. Veuillez réessayer." },
            { status: 500 },
        );
    }
}