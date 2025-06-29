import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.id) {
            return NextResponse.json(
                { message: "Votre session a expiré. Veuillez vous reconnecter." },
                { status: 401 },
            );
        }

        const params = await context.params;
        const travelId = params.id;

        const travel = await prisma.trip.findFirst({
            where: {
                id: travelId,
                participants: {
                    some: {
                        userId: session.user.id,
                        status: "accepted",
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                expenses: {
                    include: {
                        participants: {
                            include: {
                                user: true
                            }
                        },
                        payer: true
                    }
                },
            },
        });

        if (!travel) {
            return NextResponse.json({ message: "Le voyage que vous tentez de consulter n'existe pas." }, { status: 404 });
        }

        console.log(travel);

        return NextResponse.json(travel);
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur lors de la récupération du voyage." },
            { status: 500 },
        );
    }
}