import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
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
            return NextResponse.json({ message: "Le voyage que vous tentez de consulter n'existe pas." }, { status: 404 });
        }

        const isParticipant = travel.participants.some(p => p.userId === session.user.id);
        if (!isParticipant) {
            return NextResponse.json(
                { message: "Vous n'avez pas l'autorisation de modifier la dépense de ce voyage." },
                { status: 403 },
            );
        }

        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
        });

        if (!expense || expense.tripId !== travelId) {
            return NextResponse.json(
                { message: "La dépense n'a pas été trouvée dans le voyage." },
                { status: 404 },
            );
        }

        const result = await prisma.expenseParticipant.updateMany({
            where: {
                expenseId,
                userId: session.user.id,
                isSettled: false,
            },
            data: {
                isSettled: true,
                settledAt: new Date(),
            },
        });

        if (result.count === 0) {
            return NextResponse.json(
                { message: "La dépense n'a pas pu être modifiée." },
                { status: 400 },
            )
        }

        const updatedExpense = await prisma.expense.findUnique({
            where: { id: expenseId },
            include: {
                participants: {
                    include: {
                        user: true,
                    },
                },
                payer: true,
            },
        });

        if (updatedExpense) {
            await pusherServer.trigger(
                `travel-${travelId}`,
                "expenses:settled",
                updatedExpense
            );
        }

        return NextResponse.json(
            { message: "La dépense a bien été marquée comme réglée." },
            { status: 200 },
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Erreur lors de la modification de la dépense." },
            { status: 500 },
        );
    }
}