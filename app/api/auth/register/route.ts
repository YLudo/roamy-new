import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY!,
    });

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

        const token = await prisma.activateToken.create({
            data: {
                token: `${randomUUID()}${randomUUID()}`.replace(/-/g, ''),
                userId: user.id,
            },
        });

        const templateData = {
            username: user.name,
            link: `${process.env.NEXTAUTH_URL}/auth/activate/${token.token}`,
        };

        const messageData = {
            from: "Roamy <hello@roamy.fr>",
            to: user.email,
            subject: "Bienvenue sur Roamy - Activez votre compte dès maintenant !",
            template: "Mail d'activation",
            'h:X-Mailgun-Variables': JSON.stringify(templateData),
        };

        await mg.messages.create(process.env.MAILGUN_DOMAIN!, messageData);

        return NextResponse.json({ message: "Veuillez vérifier votre adresse e-mail dans votre boîte de réception." }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ message: "Erreur interne du serveur." }, { status: 500 });
    }
}