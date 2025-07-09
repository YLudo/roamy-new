import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string; taskId: string }> },
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
        const taskId = params.taskId;

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
                { message: "Vous n'avez pas l'autorisation de modifier une tâche de ce voyage." },
                { status: 403 },
            );
        }

        const values = await request.json();
        const { status } = values;

        const task = await prisma.task.update({
            where: { id: taskId },
            data: {
                status,
            },
        });

        await pusherServer.trigger(
            `travel-${travelId}`,
            "tasks:update",
            task,
        );

        return NextResponse.json(
            { message: "La tâche a été modifiée avec succès." },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur interne du serveur lors de la modification de la tâche." },
            { status: 500 },
        );
    }
}