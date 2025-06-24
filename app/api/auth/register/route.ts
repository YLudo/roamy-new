import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "L'adresse e-mail spécifiée est déjà utilisée." },
                { status: 400 },
            );
        }

        const existingUsername = await prisma.user.findUnique({
            where: { name },
        });

        if (existingUsername) {
            return NextResponse.json(
                { message: "Le nom d'utilisateur spécifié est déjà utilisé." },
                { status: 400 }
            );
        }

        const hashedPassword = await hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: "Veuillez vérifier votre adresse e-mail dans votre boîte de réception." }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ message: "Erreur interne du serveur." }, { status: 500 });
    }
}