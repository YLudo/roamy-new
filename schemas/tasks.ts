import { z } from "zod";

export const TaskSchema = z.object({
    title: z
        .string()
        .min(1, {
            message: "Vous devez spécifier le titre de la tâche.",
        }),
    description: z
        .string()
        .optional(),
})