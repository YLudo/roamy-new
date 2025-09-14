import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string; expenseId: string }> },
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
        const expenseId = params.expenseId;

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
                { message: "Vous n'avez pas l'autorisation de supprimer une dépense de ce voyage." },
                { status: 403 },
            );
        }

        await prisma.expense.delete({
            where: { id: expenseId },
        });

        await pusherServer.trigger(
            `travel-${travelId}`,
            "expenses:delete",
            expenseId,
        );

        return NextResponse.json(
            { message: "La dépense a été supprimée avec succès." },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur interne du serveur lors de la suppression de la dépense." },
            { status: 500 },
        );
    }
}