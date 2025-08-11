import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string, optionId: string }> },
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
        const pollOptionId = params.optionId;

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
                { message: "Vous n'avez pas l'autorisation d'ajouter un sondage à ce voyage." },
                { status: 403 },
            );
        }

        const pollOption = await prisma.pollOption.findUnique({
            where: { id: pollOptionId },
            include: { poll: true },
        });

        if (!pollOption) {
            return NextResponse.json(
                { message: "L'option de sondage spécifié n'existe pas." },
                { status: 404 },
            );
        }

        const existingVote = await prisma.vote.findFirst({
            where: {
                userId: session.user.id,
                pollOption: {
                    pollId: pollOption.pollId,
                },
            },
        });

        if (existingVote) {
            const updatedVote = await prisma.vote.update({
                where: { id: existingVote.id },
                data: { pollOptionId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            await pusherServer.trigger(
                `travel:${travelId}`,
                "polls:updated",
                updatedVote,
            );

            return NextResponse.json(
                { message: "Votre vote a été modifiée avec succès." },
                { status: 200 },
            );
        } else {
            const vote = await prisma.vote.create({
                data: {
                    pollOptionId,
                    userId: session.user.id,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            await pusherServer.trigger(
                `travel-${travelId}`,
                "polls:updated",
                vote,
            );

            return NextResponse.json(
                { message: "Votre vote a été ajoutée avec succès." },
                { status: 201 },
            );
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Erreur lors de l'ajout du sondage." },
            { status: 500 },
        );
    }
}