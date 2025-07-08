import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { ActivitySchema } from "@/schemas/activities";
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
                { message: "Vous n'avez pas l'autorisation d'ajouter une activité à ce voyage." },
                { status: 403 },
            );
        }

        const values = await request.json();

        const parsed = ActivitySchema.safeParse(values);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Veuillez vérifier les données envoyées." },
                { status: 400 },
            );
        }

        const {
            title,
            description,
            type,
            startDate,
            location,
            latitude,
            longitude,
            estimatedCost,
            isConfirmed
        } = parsed.data;

        const activity = await prisma.activity.create({
            data: {
                title,
                description,
                type: type,
                startDate: new Date(startDate),
                location,
                latitude,
                longitude,
                estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
                isConfirmed,
                tripId: travelId,
                createdBy: session.user.id,
            },
        });

        await pusherServer.trigger(
            `travel-${travelId}`,
            "activities:new",
            activity,
        );

        return NextResponse.json(
            { message: "L'activité a été ajoutée avec succès." },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur interne du serveur lors de l'ajout de l'activité." },
            { status: 500 },
        );
    }
}