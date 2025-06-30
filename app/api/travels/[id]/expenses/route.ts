import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { ExpenseSchema } from "@/schemas/expenses";
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

        const values = await request.json();

        const parsed = ExpenseSchema.safeParse(values);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Veuillez vérifier les données envoyées." },
                { status: 400 },
            );
        }

        const {
            title,
            description,
            amount,
            category,
            paidBy,
            location,
            expenseDate,
            isShared,
            participants,
            participantAmounts
        } = parsed.data;

        const expense = await prisma.expense.create({
            data: {
                title,
                description,
                amount: parseFloat(amount),
                category,
                currency: "EUR",
                paidBy,
                location,
                expenseDate: new Date(expenseDate),
                isShared,
                tripId: travelId,

                participants: {
                    create: participants.map((userId) => ({
                        userId,
                        amountOwed: parseFloat(participantAmounts[userId]),
                    })),
                },
            },
            include: {
                participants: {
                    include: {
                        user: true
                    }
                },
                payer: true
            }
        });

        await pusherServer.trigger(
            `travel-${travelId}`,
            "expenses:new",
            expense
        );

        return NextResponse.json(
            { message: "La dépense a été ajouté avec succès." },
            { status: 201 },
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Erreur lors de l'ajout de la dépense." },
            { status: 500 },
        );
    }
}