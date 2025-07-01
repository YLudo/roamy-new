import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
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
            include: {
                participants: true,
            },
        });

        if (!travel) {
            return NextResponse.json({ message: "Le voyage que vous tentez de consulter n'existe pas." }, { status: 404 });
        }

        const isParticipant = travel.participants.some(p => p.userId === session.user.id);
        if (!isParticipant) {
            return NextResponse.json(
                { message: "Vous n'avez pas l'autorisation de récupérer les messages de ce voyage." },
                { status: 403 },
            );
        }

        const { content } = await request.json();

        if (!content || typeof content !== "string") {
            return NextResponse.json({ message: "Vous devez spécifier un message valide." }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                tripId: travelId,
                senderId: session.user.id,
            },
            include: { sender: true },
        });

        await pusherServer.trigger(
            `travel-${travelId}`,
            "messages:new",
            message
        );

        return NextResponse.json(
            { message: "Le message a été envoyé avec succès." },
            { status: 201 },
        )
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur lors de la récupération des messages." },
            { status: 500 },
        );
    }
}