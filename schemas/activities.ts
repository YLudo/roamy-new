import { z } from "zod";

export const ActivitySchema = z.object({
    title: z
        .string()
        .min(1, {
            message: "Vous devez spécifier le titre de l'activité.",
        }),
    description: z
        .string()
        .optional(),
    type: z
        .enum(
            ["transport", "accommodation", "restaurant", "sightseeing", "entertainment", "meeting", "other"],
            {
                message: "Vous devez spécifier un type valide.",
            }
        ),
    startDate: z
        .coerce
        .date({
            message: "Vous devez spécifier une date valide.",
        }),
    location: z
        .string()
        .optional(),
    latitude: z
        .number()
        .optional(),
    longitude: z
        .number()
        .optional(),
    estimatedCost: z
        .string()
        .transform((val) => val === "" ? undefined : val)
        .refine((val) => val === undefined || (!isNaN(Number(val)) && Number(val) > 0), {
            message: "Le montant doit être un nombre positif",
        })
        .optional(),
    isConfirmed: z
        .boolean(),
})