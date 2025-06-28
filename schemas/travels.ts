import { z } from "zod";

export const TravelSchema = z.object({
    title: z
        .string()
        .min(1, {
            message: "Vous devez spécifier le titre du voyage.",
        }),
    description: z
        .string()
        .optional(),
    destination_country: z
        .string()
        .optional(),
    destination_city: z
        .string()
        .optional(),
    start_date: z
        .coerce
        .date()
        .optional(),
    end_date: z
        .coerce
        .date()
        .optional(),
    visibility: z
        .enum(["private", "participants_only", "public"]),
}).refine((data) => !data.start_date || !data.end_date || data.end_date > data.start_date, {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["end_date"],
});

export const ParticipantSchema = z.object({
    email: z
        .string()
        .min(1, {
            message: "Vous devez spécifier l'adresse e-mail du participant.",
        })
        .email({
            message: "Vous devez renseigner une adresse e-mail valide.",
        }),
});