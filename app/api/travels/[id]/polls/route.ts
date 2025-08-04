import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { PollSchema } from "@/schemas/polls";
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
                { message: "Vous n'avez pas l'autorisation d'ajouter un sondage à ce voyage." },
                { status: 403 },
            );
        }

        const values = await request.json();

        const parsed = PollSchema.safeParse(values);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Veuillez vérifier les données envoyées." },
                { status: 400 },
            );
        }

        const { title, description, pollOptions } = parsed.data;

        const poll = await prisma.poll.create({
            data: {
                title,
                description,
                tripId: travelId,
                userId: session.user.id,
                pollOptions: {
                    createMany: {
                        data: pollOptions.map((option : { text: string }) => ({
                            text: option.text,
                        })),
                    },
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                pollOptions: {
                    include: {
                        votes: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        await pusherServer.trigger(
            `travel-${travelId}`,
            "polls:new",
            poll
        );

        return NextResponse.json(
            { message: "Le sondage a été ajouté avec succès." },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur lors de l'ajout du sondage." },
            { status: 500 },
        );
    }
}