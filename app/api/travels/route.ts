import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { TravelSchema } from "@/schemas/travels";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
         if (!session || !session.user.id) {
            return NextResponse.json(
                { message: "Votre session a expiré. Veuillez vous reconnecter." },
                { status: 401 },
            );
        }

        const values = await request.json();

        const parsed = TravelSchema.safeParse(values);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Veuillez vérifier les données envoyées." },
                { status: 400 },
            );
        }

        const {
            title,
            description,
            destination_country,
            destination_city,
            start_date,
            end_date,
            visibility,
        } = parsed.data;

        const travel = await prisma.trip.create({
            data: {
                title,
                description,
                destinationCountry: destination_country,
                destinationCity: destination_city,
                startDate: start_date,
                endDate: end_date,
                visibility,
                createdBy: session.user.id,
                participants: {
                    create: {
                        userId: session.user.id,
                        role: "owner",
                        status: "accepted",
                        joinedAt: new Date(),
                    },
                },
            },
        });

        await pusherServer.trigger(
            `user-${session.user.id}`,
            "travels:new",
            travel,
        );

        return NextResponse.json(
            { message: "Votre voyage a été créé avec succès." },
            { status: 201 },
        )
    } catch (error) {
        return NextResponse.json({ message: "Erreur lors de la création du voyage." }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.id) {
            return NextResponse.json(
                { message: "Votre session a expiré. Veuillez vous reconnecter." },
                { status: 401 },
            );
        }

        const travels = await prisma.trip.findMany({
            where: {
                OR: [
                    { createdBy: session.user.id },
                    { participants: { some: { userId: session.user.id } } }
                ]
            },
            orderBy: { startDate: "desc" },
        });

        return NextResponse.json(
            travels,
            { status: 200 },
        )
    } catch (error) {
        return NextResponse.json({ message: "Erreur lors de la récupération des voyages." }, { status: 500 });
    }
}