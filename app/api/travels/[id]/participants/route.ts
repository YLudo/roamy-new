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

        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { message: "Vous devez renseigner une adresse e-mail valide." },
                { status: 400 }
            );
        }

        const currentParticipant = await prisma.tripParticipant.findUnique({
            where: {
                tripId_userId: {
                    tripId: travelId,
                    userId: session.user.id,
                },
            },
        });

        if (!currentParticipant) {
            return NextResponse.json(
                { message: "Vous n'avez pas accès à ce voyage." },
                { status: 403 },
            );
        }

        if (currentParticipant.role !== "owner") {
            return NextResponse.json(
                { message: "Vous n'avez pas les droits pour inviter un participant." },
                { status: 403 },
            );
        }

        const targetUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!targetUser) {
            return NextResponse.json(
                { message: "Aucun utilisateur trouvé avec cette adresse e-mail." },
                { status: 404 },
            );
        }

        const existingParticipant = await prisma.tripParticipant.findUnique({
            where: {
                tripId_userId: {
                    tripId: travelId,
                    userId: targetUser.id,
                },
            },
        });

        if (existingParticipant) {
            return NextResponse.json(
                { message: "Cet utilisateur est déjà un participant de ce voyage." },
                { status: 400 },
            );
        }

        const participant = await prisma.tripParticipant.create({
            data: {
                tripId: travelId,
                userId: targetUser.id,
                invitedBy: session.user.id,
                role: "member",
                status: "invited",
            },
            include: {
                user: true,
            }
        });

        await pusherServer.trigger(
            `travel-${travelId}`,
            "participants:new",
            participant
        );

        return NextResponse.json(
            { message: "Le participant a été invité avec succès." },
            { status: 201 },
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Erreur lors de l'ajout du participant." },
            { status: 500 },
        );
    }
}