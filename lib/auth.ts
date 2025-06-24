import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {
                    label: "Adresse e-mail",
                    type: "email",
                    placeholder: "example@example.com",
                },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Veuillez saisir votre email et mot de passe.");
                }
        
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
        
                if (!user) {
                    throw new Error("Aucun compte n'a été trouvé avec cette adresse e-mail.");
                }

                /*
                if (!user.emailVerified) {
                    throw new Error("Veuillez vérifier votre adresse-email.");
                }
                */
        
                if (!user.password) {
                    throw new Error("Problème de compte. Contactez le support.");
                }
        
                const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                if (!isValidPassword) {
                    throw new Error("Vos identifiants sont incorrects.");
                }
        
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
            return token;
        },
        async session({ session, token }) {
            session.user = {
                id: token.id as string,
                name: token.name as string,
                email: token.email as string,
            };
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};