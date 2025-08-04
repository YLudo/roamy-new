import z from "zod";

export const PollSchema = z.object({
    title: z
        .string()
        .min(3, {
            message: "Le titre du sondage doit contenir au moins 3 caractères.",
        }),
    description: z
        .string()
        .optional(),
    pollOptions: z
        .array(
            z.object({
                text: z
                    .string()
                    .min(1, {
                        message: "L'option du sondage ne peut pas être vide.",
                    })
            })
        )
        .min(2, {
            message: "Un sondage doit avoir au moins 2 options.",
        }),
})