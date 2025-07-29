import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
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

        const travel = await prisma.trip.findUnique({
            where: { id: travelId },
        });

        if (!travel) {
            return NextResponse.json({ message: "Le voyage que vous tentez de consulter n'existe pas." }, { status: 404 });
        }

        const participant = await prisma.tripParticipant.findUnique({
            where: {
                tripId_userId: {
                    tripId: travelId,
                    userId: session.user.id,
                },
            },
        });

        if (!participant) {
            return NextResponse.json(
                { message: "L'invitation que vous tentez de consulter n'existe pas."},
                { status: 404 },
            );
        }

        if (participant.status !== "invited") {
            return NextResponse.json(
                { message: "Vous êtes déjà un participant de ce voyage."},
                { status: 400 },
            );
        }

        const { status } = await request.json();

        if (status !== "accepted" && status !== "declined") {
            return NextResponse.json(
                { message: "Vous devez spécifier un statut valide." },
                { status: 400 },
            );
        }

        const updatedParticipant = await prisma.tripParticipant.update({
            where: {
                id: participant.id,
            },
            data: {
                status: status,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });

        await pusherServer.trigger(
            `travel-${travelId}`,
            "invitations:respond",
            updatedParticipant
        );

        await pusherServer.trigger(
            `user-${session.user.id}`,
            "invitations:respond",
            updatedParticipant
        );

        if (status === "accepted") {
            return NextResponse.json(
                { message: "Vous avez accepté l'invitation avec succès." },
                { status: 200 },
            );
        } else {
            return NextResponse.json(
                { message: "Vous avez décliné l'invitation avec succès." },
                { status: 200 },
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur lors de la mise à jour de l'invitation." },
            { status: 500 },
        );
    }
}