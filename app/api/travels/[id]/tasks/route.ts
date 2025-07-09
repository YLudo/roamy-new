import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { TaskSchema } from "@/schemas/tasks";
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
            return NextResponse.json(
                { message: "Le voyage que vous tentez de consulter n'existe pas." },
                { status: 404 },
            );
        }

        const isParticipant = travel.participants.some(p => p.userId === session.user.id);
        if (!isParticipant) {
            return NextResponse.json(
                { message: "Vous n'avez pas l'autorisation d'ajouter une tâche à ce voyage." },
                { status: 403 },
            );
        }

        const values = await request.json();

        const parsed = TaskSchema.safeParse(values);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Veuillez vérifier les données envoyées." },
                { status: 400 },
            );
        }

        const {
            title,
            description,
        } = parsed.data;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                tripId: travelId,
            },
        });

        await pusherServer.trigger(
            `travel-${travelId}`,
            "tasks:new",
            task,
        );

        return NextResponse.json(
            { message: "La tâche a été ajoutée avec succès." },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur interne du serveur lors de l'ajout de la tâche." },
            { status: 500 },
        );
    }
}