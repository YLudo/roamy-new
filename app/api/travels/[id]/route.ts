import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
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

        const travel = await prisma.trip.findFirst({
            where: {
                id: travelId,
                participants: {
                    some: {
                        userId: session.user.id,
                        status: "accepted",
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                activities: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        },
                    }
                },
                expenses: {
                    include: {
                        participants: {
                            include: {
                                user: true,
                            }
                        },
                        payer: true,
                    },
                },
                messages: {
                    include: {
                        sender: true,
                    },
                },
                tasks: true,
                polls: {
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
                }
            },
        });

        if (!travel) {
            return NextResponse.json({ message: "Le voyage que vous tentez de consulter n'existe pas." }, { status: 404 });
        }

        const isParticipant = travel.participants.some(p => p.userId === session.user.id);
        if (!isParticipant) {
            return NextResponse.json(
                { message: "Vous n'avez pas l'autorisation de récupérer les informations de ce voyage." },
                { status: 403 },
            );
        }

        return NextResponse.json(travel);
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur lors de la récupération du voyage." },
            { status: 500 },
        );
    }
}