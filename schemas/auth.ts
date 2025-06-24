import { z } from "zod";

export const RegisterSchema = z.object({
    name: z
        .string()
        .min(3, {
            message: "Votre nom d'utilisateur doit faire 3 caractères minimum.",
        }),
    email: z
        .string()
        .email({
            message: "Vous devez renseigner une adresse e-mail valide.",
        }),
    password: z
        .string()
        .min(8, {
            message: "Votre mot de passe doit faire 8 caractères minimum.",
        })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.?&])[A-Za-z\d@$!%*.?&]{8,}$/, {
            message: "Votre mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial."
        }),
});

export const LoginSchema = z.object({
    email: z
        .string()
        .email({
            message: "Vous devez renseigner une adresse e-mail valide.",
        }),
    password: z
        .string()
        .min(8, {
            message: "Votre mot de passe doit faire 8 caractères minimum.",
        })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.?&])[A-Za-z\d@$!%*.?&]{8,}$/, {
            message: "Votre mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial."
        }),
});